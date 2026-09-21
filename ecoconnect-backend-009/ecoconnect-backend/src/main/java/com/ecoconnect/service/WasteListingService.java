package com.ecoconnect.service;

import com.ecoconnect.dto.CreateListingRequest;
import com.ecoconnect.dto.ListingResponse;
import com.ecoconnect.dto.MatchedListingResponse;
import com.ecoconnect.model.PlantPreferences;
import com.ecoconnect.model.User;
import com.ecoconnect.model.WasteListing;
import com.ecoconnect.model.enums.ExpiryAction;
import com.ecoconnect.model.enums.ListingStatus;
import com.ecoconnect.repository.PlantPreferencesRepository;
import com.ecoconnect.repository.WasteListingRepository;
import com.ecoconnect.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WasteListingService {

    private final WasteListingRepository wasteListingRepository;
    private final PlantPreferencesRepository plantPreferencesRepository;

    public ListingResponse createListing(User generator, CreateListingRequest request) {
        LocalDateTime expiresAt = LocalDate.now().atTime(request.getPickupDeadlineTime());

        // If the chosen deadline time has already passed today, push it to tomorrow.
        if (expiresAt.isBefore(LocalDateTime.now())) {
            expiresAt = expiresAt.plusDays(1);
        }

        // Listings marked DISCARD carry more urgency than CARRY_FORWARD ones.
        int urgencyScore = (request.getOnExpiryAction() == ExpiryAction.DISCARD) ? 100 : 20;

        WasteListing listing = WasteListing.builder()
                .generator(generator)
                .wasteType(request.getWasteType().toUpperCase())
                .quantity(request.getQuantity())
                .unit(request.getUnit() == null ? "KG" : request.getUnit())
                .pickupDeadlineTime(request.getPickupDeadlineTime())
                .expiresAt(expiresAt)
                .onExpiryAction(request.getOnExpiryAction())
                .urgencyScore(urgencyScore)
                .status(ListingStatus.LISTED)
                .build();

        wasteListingRepository.save(listing);
        return toResponse(listing);
    }

    public List<ListingResponse> getActiveListings() {
        return wasteListingRepository.findByStatus(ListingStatus.LISTED)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ListingResponse> getMyListings(User generator) {
        return wasteListingRepository.findByGenerator_IdOrderByCreatedAtDesc(generator.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // The core "nearby + compatible" matching logic for a Plant.
    public List<MatchedListingResponse> getMatchedListings(User plant) {
        PlantPreferences prefs = plantPreferencesRepository.findByPlant_Id(plant.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Set your plant preferences first — POST /api/plant-preferences"));

        double radiusKm = prefs.getPreferredRadiusKm().doubleValue();

        return wasteListingRepository.findAll().stream()
                // Step 1: hard filter — waste type must be one this plant accepts
                .filter(l -> l.getStatus() == ListingStatus.LISTED)
                .filter(l -> prefs.getAcceptedWasteTypes().contains(l.getWasteType()))
                // Step 2: soft filter — within radius (skip filtering if location data is missing)
                .filter(l -> withinRadiusOrUnknown(plant, l, radiusKm))
                // Step 3: rank — most urgent first, then closest first
                .sorted(Comparator
                        .comparing((WasteListing l) -> l.getUrgencyScore()).reversed()
                        .thenComparing(l -> distanceOrMax(plant, l)))
                .map(l -> toMatchedResponse(l, plant))
                .collect(Collectors.toList());
    }

    private boolean withinRadiusOrUnknown(User plant, WasteListing listing, double radiusKm) {
        Double distance = calculateDistance(plant, listing);
        return distance == null || distance <= radiusKm;
    }

    private double distanceOrMax(User plant, WasteListing listing) {
        Double distance = calculateDistance(plant, listing);
        return distance == null ? Double.MAX_VALUE : distance;
    }

    private Double calculateDistance(User plant, WasteListing listing) {
        User generator = listing.getGenerator();
        if (plant.getLatitude() == null || plant.getLongitude() == null
                || generator.getLatitude() == null || generator.getLongitude() == null) {
            return null; // location missing on one side — can't compute, so don't exclude it
        }
        return GeoUtils.distanceKm(
                plant.getLatitude(), plant.getLongitude(),
                generator.getLatitude(), generator.getLongitude()
        );
    }

    public ListingResponse reconfirmListing(User generator, java.util.UUID listingId) {
        WasteListing listing = wasteListingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (!listing.getGenerator().getId().equals(generator.getId())) {
            throw new IllegalArgumentException("You can only reconfirm your own listings");
        }
        if (listing.getStatus() != ListingStatus.LISTED) {
            throw new IllegalArgumentException("Only LISTED listings can be reconfirmed");
        }

        // Reset expiry to today (or tomorrow) at the same deadline time
        LocalDateTime newExpiry = LocalDate.now().atTime(listing.getPickupDeadlineTime());
        if (newExpiry.isBefore(LocalDateTime.now())) {
            newExpiry = newExpiry.plusDays(1);
        }
        listing.setExpiresAt(newExpiry);
        listing.setCarryForwardCount(0);
        listing.setLastConfirmedAt(LocalDateTime.now());
        wasteListingRepository.save(listing);
        return toResponse(listing);
    }

    private MatchedListingResponse toMatchedResponse(WasteListing l, User plant) {
        return new MatchedListingResponse(
                l.getId(), l.getWasteType(), l.getQuantity(), l.getUnit(),
                l.getPickupDeadlineTime(), l.getExpiresAt(), l.getOnExpiryAction(),
                l.getStatus(), l.getGenerator().getName(),
                calculateDistance(plant, l), l.getUrgencyScore()
        );
    }

    private ListingResponse toResponse(WasteListing l) {
        return new ListingResponse(
                l.getId(), l.getWasteType(), l.getQuantity(), l.getUnit(),
                l.getPickupDeadlineTime(), l.getExpiresAt(), l.getOnExpiryAction(),
                l.getStatus(), l.getGenerator().getName(), l.getCreatedAt(),
                l.getCarryForwardCount()
        );
    }
}
