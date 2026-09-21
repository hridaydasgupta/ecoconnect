package com.ecoconnect.service;

import com.ecoconnect.dto.BatchResponse;
import com.ecoconnect.dto.CreateBatchRequest;
import com.ecoconnect.dto.StopSummary;
import com.ecoconnect.model.*;
import com.ecoconnect.model.enums.BatchStatus;
import com.ecoconnect.model.enums.OrderStatus;
import com.ecoconnect.model.enums.Role;
import com.ecoconnect.model.enums.StopStatus;
import com.ecoconnect.repository.OrderRepository;
import com.ecoconnect.repository.PickupBatchRepository;
import com.ecoconnect.repository.PickupStopRepository;
import com.ecoconnect.repository.PlantPreferencesRepository;
import com.ecoconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PickupBatchService {

    private final OrderRepository orderRepository;
    private final PickupBatchRepository pickupBatchRepository;
    private final PickupStopRepository pickupStopRepository;
    private final PlantPreferencesRepository plantPreferencesRepository;
    private final UserRepository userRepository;
    private final RouteOptimizationService routeOptimizationService;

    // Plant selects multiple confirmed Orders -> groups them into one physical pickup trip.
    public BatchResponse createBatch(User plant, CreateBatchRequest request) {
        List<OrderEntity> orders = orderRepository.findAllById(request.getOrderIds());

        if (orders.size() != request.getOrderIds().size()) {
            throw new IllegalArgumentException("One or more order IDs were not found");
        }

        for (OrderEntity order : orders) {
            if (!order.getPlant().getId().equals(plant.getId())) {
                throw new IllegalArgumentException("Order " + order.getId() + " does not belong to you");
            }
            if (order.getStatus() != OrderStatus.CONFIRMED) {
                throw new IllegalArgumentException("Order " + order.getId() + " is not in CONFIRMED status (status: " + order.getStatus() + ")");
            }
            // Prevent same order being added to multiple batches
            if (pickupStopRepository.existsByOrder_Id(order.getId())) {
                throw new IllegalArgumentException("Order " + order.getId() + " is already part of another batch");
            }
        }

        BigDecimal totalWeight = orders.stream()
                .map(o -> o.getListing().getQuantity())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal capacityLimit = plantPreferencesRepository.findByPlant_Id(plant.getId())
                .map(PlantPreferences::getMaxCapacityKg)
                .orElse(null);

        boolean capacityOk = capacityLimit == null || totalWeight.compareTo(capacityLimit) <= 0;

        if (!capacityOk) {
            throw new IllegalArgumentException(String.format(
                    "Total weight %.2f kg exceeds your vehicle capacity %.2f kg — split into multiple batches",
                    totalWeight, capacityLimit));
        }

        PickupBatch batch = PickupBatch.builder()
                .plant(plant)
                .status(BatchStatus.PLANNED)
                .scheduledDate(request.getScheduledDate())
                .build();

        List<PickupStop> stops = new ArrayList<>();
        int sequence = 1;
        for (OrderEntity order : orders) {
            User generator = order.getListing().getGenerator();
            PickupStop stop = PickupStop.builder()
                    .batch(batch)
                    .order(order)
                    .stopSequence(sequence++)
                    .latitude(generator.getLatitude())
                    .longitude(generator.getLongitude())
                    .status(StopStatus.PENDING)
                    .build();
            stops.add(stop);

            // Mark order as IN_TRANSIT once batched — visible to generator too
            order.setStatus(OrderStatus.IN_TRANSIT);
            orderRepository.save(order);
        }
        batch.setStops(stops);

        // ── AI: Optimize route using Nearest Neighbor heuristic ─────────────
        List<PickupStop> optimizedStops = routeOptimizationService.optimizeRoute(stops);
        // Re-assign sequence numbers based on optimized order
        for (int i = 0; i < optimizedStops.size(); i++) {
            optimizedStops.get(i).setStopSequence(i + 1);
        }
        // Calculate and store total optimized route distance
        double optimizedDistanceKm = routeOptimizationService.totalRouteDistanceKm(optimizedStops);
        batch.setTotalDistanceKm(optimizedDistanceKm);
        batch.setStops(optimizedStops);
        // ────────────────────────────────────────────────────────────────────

        pickupBatchRepository.save(batch); // cascades and saves stops too

        return toResponse(batch, totalWeight, capacityLimit, capacityOk);
    }

    // Plant assigns a Logistics Agent to a PLANNED batch.
    public BatchResponse assignAgent(User plant, UUID batchId, UUID agentId) {
        PickupBatch batch = pickupBatchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));

        if (!batch.getPlant().getId().equals(plant.getId())) {
            throw new IllegalArgumentException("This batch does not belong to you");
        }
        if (batch.getStatus() != BatchStatus.PLANNED) {
            throw new IllegalArgumentException("Can only assign an agent while the batch is PLANNED");
        }

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new IllegalArgumentException("Agent not found"));
        if (agent.getRole() != Role.LOGISTICS_AGENT) {
            throw new IllegalArgumentException("Selected user is not a LOGISTICS_AGENT");
        }

        batch.setAgent(agent);
        pickupBatchRepository.save(batch);

        BigDecimal total = batch.getStops().stream()
                .map(s -> s.getOrder().getListing().getQuantity())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return toResponse(batch, total, null, true);
    }

    // What an agent sees — only PLANNED or IN_PROGRESS batches assigned to them.
    public List<BatchResponse> getAssignedBatches(User agent) {
        return pickupBatchRepository
                .findByAgent_IdAndStatusIn(agent.getId(), List.of(BatchStatus.PLANNED, BatchStatus.IN_PROGRESS))
                .stream()
                .map(b -> {
                    BigDecimal total = b.getStops().stream()
                            .map(s -> s.getOrder().getListing().getQuantity())
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return toResponse(b, total, null, true);
                })
                .collect(Collectors.toList());
    }

    // Plant's own batches — all statuses.
    public List<BatchResponse> getMyBatches(User plant) {
        return pickupBatchRepository.findByPlant_Id(plant.getId())
                .stream()
                .map(b -> {
                    BigDecimal total = b.getStops().stream()
                            .map(s -> s.getOrder().getListing().getQuantity())
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return toResponse(b, total, null, true);
                })
                .collect(Collectors.toList());
    }

    // Agent's FULL trip history — all statuses including COMPLETED/CANCELLED.
    public List<BatchResponse> getAgentHistory(User agent) {
        return pickupBatchRepository.findByAgent_IdOrderByCreatedAtDesc(agent.getId())
                .stream()
                .map(b -> {
                    BigDecimal total = b.getStops().stream()
                            .map(s -> s.getOrder().getListing().getQuantity())
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return toResponse(b, total, null, true);
                })
                .collect(Collectors.toList());
    }

    private BatchResponse toResponse(PickupBatch batch, BigDecimal totalWeight,
                                      BigDecimal capacityLimit, boolean capacityOk) {
        List<StopSummary> stopSummaries = batch.getStops().stream()
                .map(s -> new StopSummary(
                        s.getId(),
                        s.getOrder().getId(),
                        s.getOrder().getListing().getGenerator().getName(),
                        s.getOrder().getListing().getWasteType(),
                        s.getOrder().getListing().getQuantity(),
                        s.getStopSequence(),
                        s.getStatus(),
                        s.getLatitude(),
                        s.getLongitude(),
                        s.getActualWeight(),
                        s.getArrivedAt()
                ))
                .collect(Collectors.toList());

        String agentName = batch.getAgent() != null ? batch.getAgent().getName() : null;

        return new BatchResponse(
                batch.getId(), batch.getStatus(), batch.getScheduledDate(),
                totalWeight, capacityLimit, capacityOk, stopSummaries,
                batch.getTotalDistanceKm(), agentName
        );
    }
}
