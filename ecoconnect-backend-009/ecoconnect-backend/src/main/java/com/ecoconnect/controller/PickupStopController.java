package com.ecoconnect.controller;

import com.ecoconnect.dto.StopSummary;
import com.ecoconnect.dto.UpdateStopStatusRequest;
import com.ecoconnect.model.User;
import com.ecoconnect.service.PickupStopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/pickup-stops")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LOGISTICS_AGENT')")
public class PickupStopController {

    private final PickupStopService pickupStopService;

    @PutMapping("/{id}/status")
    public ResponseEntity<StopSummary> updateStatus(
            @AuthenticationPrincipal User agent,
            @PathVariable("id") UUID stopId,
            @Valid @RequestBody UpdateStopStatusRequest request) {
        return ResponseEntity.ok(pickupStopService.updateStatus(agent, stopId, request));
    }
}
