package com.ecoconnect.controller;

import com.ecoconnect.dto.PlantPreferencesRequest;
import com.ecoconnect.dto.PlantPreferencesResponse;
import com.ecoconnect.model.User;
import com.ecoconnect.service.PlantPreferencesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plant-preferences")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RECYCLING_PLANT')")
public class PlantPreferencesController {

    private final PlantPreferencesService plantPreferencesService;

    @PostMapping
    public ResponseEntity<PlantPreferencesResponse> setPreferences(
            @AuthenticationPrincipal User plant,
            @Valid @RequestBody PlantPreferencesRequest request) {
        return ResponseEntity.ok(plantPreferencesService.setPreferences(plant, request));
    }

    @GetMapping("/mine")
    public ResponseEntity<PlantPreferencesResponse> getPreferences(@AuthenticationPrincipal User plant) {
        return ResponseEntity.ok(plantPreferencesService.getPreferences(plant));
    }
}
