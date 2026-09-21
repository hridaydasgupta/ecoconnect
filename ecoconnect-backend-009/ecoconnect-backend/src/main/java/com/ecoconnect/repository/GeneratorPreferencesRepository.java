package com.ecoconnect.repository;

import com.ecoconnect.model.GeneratorPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GeneratorPreferencesRepository extends JpaRepository<GeneratorPreferences, UUID> {
}
