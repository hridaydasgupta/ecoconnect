package com.ecoconnect.repository;

import com.ecoconnect.model.WasteListing;
import com.ecoconnect.model.enums.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WasteListingRepository extends JpaRepository<WasteListing, UUID> {

    // Generator's own listings — ordered newest first
    List<WasteListing> findByGenerator_IdOrderByCreatedAtDesc(UUID generatorId);

    // All LISTED status listings — for active feed
    List<WasteListing> findByStatus(ListingStatus status);
}
