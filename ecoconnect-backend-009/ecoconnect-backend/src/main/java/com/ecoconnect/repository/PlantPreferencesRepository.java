package com.ecoconnect.repository;

import com.ecoconnect.model.PlantPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PlantPreferencesRepository extends JpaRepository<PlantPreferences, UUID> {
    Optional<PlantPreferences> findByPlant_Id(UUID plantId);
}
