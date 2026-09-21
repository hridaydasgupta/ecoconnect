package com.ecoconnect.service;

import com.ecoconnect.dto.PlantPreferencesRequest;
import com.ecoconnect.dto.PlantPreferencesResponse;
import com.ecoconnect.model.PlantPreferences;
import com.ecoconnect.model.User;
import com.ecoconnect.repository.PlantPreferencesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlantPreferencesService {

    private final PlantPreferencesRepository plantPreferencesRepository;

    // Creates preferences the first time, updates them on every call after that (upsert).
    public PlantPreferencesResponse setPreferences(User plant, PlantPreferencesRequest request) {
        PlantPreferences prefs = plantPreferencesRepository.findByPlant_Id(plant.getId())
                .orElse(PlantPreferences.builder().plant(plant).build());

        prefs.setAcceptedWasteTypes(
                request.getAcceptedWasteTypes().stream().map(String::toUpperCase).toList()
        );
        prefs.setPreferredRadiusKm(request.getPreferredRadiusKm());
        prefs.setMinQuantityKg(request.getMinQuantityKg());
        prefs.setMaxCapacityKg(request.getMaxCapacityKg());
        prefs.setNotifyInstantly(request.isNotifyInstantly());

        plantPreferencesRepository.save(prefs);
        return toResponse(prefs);
    }

    public PlantPreferencesResponse getPreferences(User plant) {
        PlantPreferences prefs = plantPreferencesRepository.findByPlant_Id(plant.getId())
                .orElseThrow(() -> new IllegalArgumentException("No preferences set yet — call POST /api/plant-preferences first"));
        return toResponse(prefs);
    }

    private PlantPreferencesResponse toResponse(PlantPreferences p) {
        return new PlantPreferencesResponse(
                p.getAcceptedWasteTypes(), p.getPreferredRadiusKm(),
                p.getMinQuantityKg(), p.getMaxCapacityKg(), p.isNotifyInstantly()
        );
    }
}
