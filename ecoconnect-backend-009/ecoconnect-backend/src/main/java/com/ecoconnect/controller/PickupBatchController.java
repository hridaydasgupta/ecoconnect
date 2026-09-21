package com.ecoconnect.controller;

import com.ecoconnect.dto.AssignAgentRequest;
import com.ecoconnect.dto.BatchResponse;
import com.ecoconnect.dto.CreateBatchRequest;
import com.ecoconnect.model.User;
import com.ecoconnect.service.PickupBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pickup-batches")
@RequiredArgsConstructor
public class PickupBatchController {

    private final PickupBatchService pickupBatchService;

    @PreAuthorize("hasRole('RECYCLING_PLANT')")
    @PostMapping
    public ResponseEntity<BatchResponse> createBatch(
            @AuthenticationPrincipal User plant,
            @Valid @RequestBody CreateBatchRequest request) {
        return ResponseEntity.ok(pickupBatchService.createBatch(plant, request));
    }

    @PreAuthorize("hasRole('RECYCLING_PLANT')")
    @GetMapping("/mine")
    public ResponseEntity<List<BatchResponse>> getMyBatches(@AuthenticationPrincipal User plant) {
        return ResponseEntity.ok(pickupBatchService.getMyBatches(plant));
    }

    @PreAuthorize("hasRole('RECYCLING_PLANT')")
    @PutMapping("/{id}/assign-agent")
    public ResponseEntity<BatchResponse> assignAgent(
            @AuthenticationPrincipal User plant,
            @PathVariable("id") UUID batchId,
            @Valid @RequestBody AssignAgentRequest request) {
        return ResponseEntity.ok(pickupBatchService.assignAgent(plant, batchId, request.getAgentId()));
    }

    @PreAuthorize("hasRole('LOGISTICS_AGENT')")
    @GetMapping("/assigned")
    public ResponseEntity<List<BatchResponse>> getAssignedBatches(@AuthenticationPrincipal User agent) {
        return ResponseEntity.ok(pickupBatchService.getAssignedBatches(agent));
    }

    @PreAuthorize("hasRole('LOGISTICS_AGENT')")
    @GetMapping("/history")
    public ResponseEntity<List<BatchResponse>> getAgentHistory(@AuthenticationPrincipal User agent) {
        return ResponseEntity.ok(pickupBatchService.getAgentHistory(agent));
    }
}
