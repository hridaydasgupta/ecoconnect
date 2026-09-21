package com.ecoconnect.controller;

import com.ecoconnect.dto.PriceRecommendationResponse;
import com.ecoconnect.service.PriceRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for AI-powered features:
 *  - GET /api/ai/price-recommendation  → Knowledge-based price suggestion
 *  - GET /api/ai/health                → AI system status check
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final PriceRecommendationService priceRecommendationService;

    /**
     * AI Price Recommendation Endpoint
     *
     * Returns a rule-based price suggestion for a waste listing.
     * Accessible by RECYCLING_PLANT role only.
     *
     * Query params:
     *   wasteType    — e.g. SUGARCANE, PAPER, METAL
     *   quantityKg   — listing quantity in kg
     *   distanceKm   — distance between generator and plant
     *   urgencyScore — urgency of listing (0-200)
     *
     * Example: GET /api/ai/price-recommendation?wasteType=SUGARCANE&quantityKg=100&distanceKm=12&urgencyScore=50
     */
    @GetMapping("/price-recommendation")
    @PreAuthorize("hasRole('RECYCLING_PLANT')")
    public ResponseEntity<PriceRecommendationResponse> getPriceRecommendation(
            @RequestParam String wasteType,
            @RequestParam double quantityKg,
            @RequestParam(defaultValue = "0") double distanceKm,
            @RequestParam(defaultValue = "0") int urgencyScore) {

        PriceRecommendationResponse response = priceRecommendationService
                .recommend(wasteType, quantityKg, distanceKm, urgencyScore);
        return ResponseEntity.ok(response);
    }

    /**
     * AI Health Check — confirms AI services are running
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("EcoConnect AI Systems: Route Optimizer (Heuristic Search) + Price Recommender (Knowledge-based) — OPERATIONAL");
    }
}
