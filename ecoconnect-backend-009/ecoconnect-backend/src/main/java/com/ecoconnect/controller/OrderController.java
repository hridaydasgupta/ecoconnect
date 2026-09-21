package com.ecoconnect.controller;

import com.ecoconnect.dto.AcceptListingRequest;
import com.ecoconnect.dto.OrderResponse;
import com.ecoconnect.model.User;
import com.ecoconnect.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RECYCLING_PLANT')")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/listings/{id}/accept")
    public ResponseEntity<OrderResponse> acceptListing(
            @AuthenticationPrincipal User plant,
            @PathVariable("id") UUID listingId,
            @Valid @RequestBody AcceptListingRequest request) {
        return ResponseEntity.ok(orderService.acceptListing(plant, listingId, request));
    }

    @GetMapping("/orders/mine")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal User plant) {
        return ResponseEntity.ok(orderService.getMyOrders(plant));
    }
}
