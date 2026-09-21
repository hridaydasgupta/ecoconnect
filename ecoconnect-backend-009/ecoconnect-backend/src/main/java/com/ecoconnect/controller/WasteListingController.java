package com.ecoconnect.controller;

import com.ecoconnect.dto.CreateListingRequest;
import com.ecoconnect.dto.ListingResponse;
import com.ecoconnect.dto.MatchedListingResponse;
import com.ecoconnect.model.User;
import com.ecoconnect.service.WasteListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class WasteListingController {

    private final WasteListingService wasteListingService;

    // Only Generators can create a listing.
    @PreAuthorize("hasRole('GENERATOR')")
    @PostMapping
    public ResponseEntity<ListingResponse> createListing(
            @AuthenticationPrincipal User generator,
            @Valid @RequestBody CreateListingRequest request) {
        return ResponseEntity.ok(wasteListingService.createListing(generator, request));
    }

    // Any logged-in user (typically a Plant) can browse active listings.
    @GetMapping
    public ResponseEntity<List<ListingResponse>> getActiveListings() {
        return ResponseEntity.ok(wasteListingService.getActiveListings());
    }

    // Smart matching: only listings compatible with this plant's preferences,
    // filtered by radius, ranked by urgency then distance.
    @PreAuthorize("hasRole('RECYCLING_PLANT')")
    @GetMapping("/matched")
    public ResponseEntity<List<MatchedListingResponse>> getMatchedListings(@AuthenticationPrincipal User plant) {
        return ResponseEntity.ok(wasteListingService.getMatchedListings(plant));
    }

    // A Generator viewing their own listings.
    @PreAuthorize("hasRole('GENERATOR')")
    @GetMapping("/mine")
    public ResponseEntity<List<ListingResponse>> getMyListings(@AuthenticationPrincipal User generator) {
        return ResponseEntity.ok(wasteListingService.getMyListings(generator));
    }

    // Generator reconfirms a carry-forward listing — resets expiry and carry count.
    @PreAuthorize("hasRole('GENERATOR')")
    @PutMapping("/{id}/reconfirm")
    public ResponseEntity<ListingResponse> reconfirmListing(
            @AuthenticationPrincipal User generator,
            @PathVariable("id") java.util.UUID listingId) {
        return ResponseEntity.ok(wasteListingService.reconfirmListing(generator, listingId));
    }
}
