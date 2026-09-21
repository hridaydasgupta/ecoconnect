package com.ecoconnect.service;

import com.ecoconnect.dto.AcceptListingRequest;
import com.ecoconnect.dto.OrderResponse;
import com.ecoconnect.model.OrderEntity;
import com.ecoconnect.model.User;
import com.ecoconnect.model.WasteListing;
import com.ecoconnect.model.enums.ListingStatus;
import com.ecoconnect.model.enums.OrderStatus;
import com.ecoconnect.repository.OrderRepository;
import com.ecoconnect.repository.WasteListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final WasteListingRepository wasteListingRepository;
    private final OrderRepository orderRepository;

    // Plant accepts a LISTED listing -> creates an Order, marks the listing MATCHED.
    public OrderResponse acceptListing(User plant, UUID listingId, AcceptListingRequest request) {
        WasteListing listing = wasteListingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (listing.getStatus() != ListingStatus.LISTED) {
            throw new IllegalArgumentException("This listing is no longer available (status: " + listing.getStatus() + ")");
        }

        OrderEntity order = OrderEntity.builder()
                .listing(listing)
                .plant(plant)
                .agreedPrice(request.getAgreedPrice())
                .status(OrderStatus.CONFIRMED)
                .build();
        orderRepository.save(order);

        listing.setStatus(ListingStatus.MATCHED);
        wasteListingRepository.save(listing);

        return toResponse(order);
    }

    public List<OrderResponse> getMyOrders(User plant) {
        return orderRepository.findByPlant_IdOrderByMatchedAtDesc(plant.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse toResponse(OrderEntity o) {
        return new OrderResponse(
                o.getId(),
                o.getListing().getId(),
                o.getListing().getWasteType(),
                o.getListing().getGenerator().getName(),
                o.getPlant().getName(),
                o.getListing().getQuantity(),    // ← quantity
                o.getListing().getUnit(),         // ← unit (KG / TONNES)
                o.getAgreedPrice(),
                o.getStatus(),
                o.getMatchedAt()
        );
    }
}
