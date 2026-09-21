package com.ecoconnect.service;

import com.ecoconnect.dto.StopSummary;
import com.ecoconnect.dto.UpdateStopStatusRequest;
import com.ecoconnect.model.*;
import com.ecoconnect.model.enums.BatchStatus;
import com.ecoconnect.model.enums.ListingStatus;
import com.ecoconnect.model.enums.OrderStatus;
import com.ecoconnect.model.enums.StopStatus;
import com.ecoconnect.model.enums.TransactionType;
import com.ecoconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PickupStopService {

    private final PickupStopRepository pickupStopRepository;
    private final PickupBatchRepository pickupBatchRepository;
    private final OrderRepository orderRepository;
    private final WasteListingRepository wasteListingRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    // Only the agent assigned to the stop's batch may update it.
    public StopSummary updateStatus(User agent, UUID stopId, UpdateStopStatusRequest request) {
        PickupStop stop = pickupStopRepository.findById(stopId)
                .orElseThrow(() -> new IllegalArgumentException("Stop not found"));

        PickupBatch batch = stop.getBatch();
        if (batch.getAgent() == null || !batch.getAgent().getId().equals(agent.getId())) {
            throw new IllegalArgumentException("This stop is not assigned to you");
        }

        if (request.getStatus() == StopStatus.COMPLETED && request.getActualWeight() == null) {
            throw new IllegalArgumentException("actualWeight is required when marking a stop COMPLETED");
        }

        stop.setStatus(request.getStatus());
        if (request.getActualWeight() != null) {
            stop.setActualWeight(request.getActualWeight());
        }
        if (request.getStatus() == StopStatus.ARRIVED || request.getStatus() == StopStatus.COMPLETED) {
            stop.setArrivedAt(LocalDateTime.now());
        }
        pickupStopRepository.save(stop);

        // First real movement on a PLANNED batch flips it to IN_PROGRESS.
        if (batch.getStatus() == BatchStatus.PLANNED) {
            batch.setStatus(BatchStatus.IN_PROGRESS);
            pickupBatchRepository.save(batch);
        }

        if (request.getStatus() == StopStatus.COMPLETED) {
            completePickup(stop);
        }

        // Once every stop in the batch is done (COMPLETED or FAILED), close the batch.
        boolean allDone = batch.getStops().stream()
                .allMatch(s -> s.getStatus() == StopStatus.COMPLETED || s.getStatus() == StopStatus.FAILED);
        if (allDone) {
            batch.setStatus(BatchStatus.COMPLETED);
            pickupBatchRepository.save(batch);
        }

        return new StopSummary(
                stop.getId(), stop.getOrder().getId(), stop.getOrder().getListing().getGenerator().getName(),
                stop.getOrder().getListing().getWasteType(), stop.getOrder().getListing().getQuantity(),
                stop.getStopSequence(), stop.getStatus(), stop.getLatitude(), stop.getLongitude(),
                stop.getActualWeight(), stop.getArrivedAt()
        );
    }

    // Marks the order/listing complete and pays the generator.
    private void completePickup(PickupStop stop) {
        OrderEntity order = stop.getOrder();
        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        WasteListing listing = order.getListing();
        listing.setStatus(ListingStatus.COMPLETED);
        wasteListingRepository.save(listing);

        // Generator gets credited, plant gets debited — both reference the same order.
        WalletTransaction credit = WalletTransaction.builder()
                .user(listing.getGenerator())
                .amount(order.getAgreedPrice())
                .type(TransactionType.CREDIT)
                .relatedOrder(order)
                .build();
        walletTransactionRepository.save(credit);

        WalletTransaction debit = WalletTransaction.builder()
                .user(order.getPlant())
                .amount(order.getAgreedPrice())
                .type(TransactionType.DEBIT)
                .relatedOrder(order)
                .build();
        walletTransactionRepository.save(debit);
    }
}
