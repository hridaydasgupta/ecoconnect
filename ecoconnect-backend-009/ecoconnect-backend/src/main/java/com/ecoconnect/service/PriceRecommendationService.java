package com.ecoconnect.service;

import com.ecoconnect.dto.PriceRecommendationResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * AI Price Recommendation Service
 * ─────────────────────────────────
 * Type:       Knowledge-based System (Expert System)
 * Category:   Rule-based Inference Engine
 *
 * Architecture:
 *   ┌──────────────────────────────────────┐
 *   │         USER INTERFACE               │
 *   │    (Accept Listing Modal — React)    │
 *   └───────────────┬──────────────────────┘
 *                   │
 *   ┌───────────────▼──────────────────────┐
 *   │         INFERENCE ENGINE             │
 *   │   Applies production rules to        │
 *   │   derive price recommendation        │
 *   └───────────────┬──────────────────────┘
 *                   │
 *   ┌───────────────▼──────────────────────┐
 *   │          KNOWLEDGE BASE              │
 *   │  Base prices per waste type (₹/kg)   │
 *   │  Distance cost rules (₹/km)          │
 *   │  Quantity discount rules             │
 *   │  Urgency adjustment rules            │
 *   └──────────────────────────────────────┘
 *
 * Academic Reference:
 *   Production Rules (IF-THEN format) encode domain expert knowledge.
 *   The inference engine fires applicable rules to reach a conclusion.
 *   This mirrors the MYCIN expert system architecture (Shortliffe, 1976).
 */
@Service
public class PriceRecommendationService {

    // ── KNOWLEDGE BASE: Base prices per waste type (₹ per kg) ──────────────
    // Domain knowledge from Indian agricultural waste market
    private static final Map<String, double[]> WASTE_BASE_PRICE_RANGE = Map.of(
        "SUGARCANE",   new double[]{3.5,  6.0},   // ₹3.5 - ₹6 / kg
        "COCONUT",     new double[]{4.0,  7.0},   // ₹4 - ₹7 / kg
        "FLOWER",      new double[]{5.0,  9.0},   // ₹5 - ₹9 / kg (compost value)
        "FRUIT_PULP",  new double[]{2.5,  5.0},   // ₹2.5 - ₹5 / kg
        "DAIRY",       new double[]{2.0,  4.5},   // ₹2 - ₹4.5 / kg
        "PAPER",       new double[]{8.0, 14.0},   // ₹8 - ₹14 / kg (highest recycling value)
        "PLASTIC",     new double[]{6.0, 12.0},   // ₹6 - ₹12 / kg
        "METAL",       new double[]{18.0,35.0}    // ₹18 - ₹35 / kg (scrap value)
    );

    // ── KNOWLEDGE BASE: Transport cost rules ──────────────────────────────
    private static final double TRANSPORT_COST_PER_KM = 2.5; // ₹2.5 / km (shared over batch)

    /**
     * Main inference method — applies production rules to generate price recommendation.
     *
     * Rules fired (in order):
     *   R1: Base price from waste type knowledge base
     *   R2: IF quantity > 500kg THEN apply bulk discount (−10%)
     *   R3: IF quantity < 20kg  THEN apply small-load premium (+15%)
     *   R4: IF distanceKm > 50  THEN add transport cost to lower bound
     *   R5: IF urgencyScore >= 100 THEN apply urgency markdown (−8%) — seller is desperate
     *   R6: Clamp final range to non-negative values
     *
     * @param wasteType     Waste category (e.g., SUGARCANE, PAPER)
     * @param quantityKg    Quantity in kilograms
     * @param distanceKm    Distance between generator and plant
     * @param urgencyScore  Urgency of listing (higher = more urgent)
     * @return              PriceRecommendationResponse with range and reasoning
     */
    public PriceRecommendationResponse recommend(
            String wasteType, double quantityKg,
            double distanceKm, int urgencyScore) {

        List<String> reasoning = new ArrayList<>();

        // ── R1: Fetch base price range from Knowledge Base ──────────────────
        double[] baseRange = WASTE_BASE_PRICE_RANGE.getOrDefault(
                wasteType.toUpperCase(), new double[]{2.0, 5.0});
        double low  = baseRange[0];
        double high = baseRange[1];
        reasoning.add(String.format("Base price for %s: ₹%.1f–₹%.1f/kg (market knowledge base)",
                wasteType, low, high));

        // ── R2: Bulk discount rule ──────────────────────────────────────────
        // IF quantity > 500 kg THEN price per kg decreases (economies of scale)
        if (quantityKg > 500) {
            low  *= 0.90;
            high *= 0.90;
            reasoning.add("Rule R2 fired: Bulk quantity (>500kg) → 10% discount applied");
        }

        // ── R3: Small load premium ──────────────────────────────────────────
        // IF quantity < 20 kg THEN price per kg increases (handling overhead)
        else if (quantityKg < 20) {
            low  *= 1.15;
            high *= 1.15;
            reasoning.add("Rule R3 fired: Small load (<20kg) → 15% premium applied");
        }

        // ── R4: Distance transport cost adjustment ──────────────────────────
        // IF distance > 50 km THEN reduce offer price (transport eats into margin)
        if (distanceKm > 50) {
            double transportDeduction = (distanceKm - 50) * TRANSPORT_COST_PER_KM / quantityKg;
            low  = Math.max(0.5, low  - transportDeduction);
            high = Math.max(1.0, high - transportDeduction);
            reasoning.add(String.format(
                    "Rule R4 fired: Distance %.1f km > 50 km → transport cost deduction ₹%.2f/kg",
                    distanceKm, transportDeduction));
        }

        // ── R5: Urgency markdown ────────────────────────────────────────────
        // IF urgencyScore >= 100 THEN generator is urgent → plant can offer less
        if (urgencyScore >= 100) {
            low  *= 0.92;
            high *= 0.92;
            reasoning.add("Rule R5 fired: High urgency listing → 8% markdown (seller motivated)");
        }

        // ── R6: Clamp values ────────────────────────────────────────────────
        low  = Math.max(0.5, low);
        high = Math.max(low + 0.5, high);

        // Calculate total recommended price range
        BigDecimal totalLow  = BigDecimal.valueOf(low  * quantityKg).setScale(0, RoundingMode.FLOOR);
        BigDecimal totalHigh = BigDecimal.valueOf(high * quantityKg).setScale(0, RoundingMode.CEILING);
        BigDecimal midpoint  = totalLow.add(totalHigh).divide(BigDecimal.valueOf(2), 0, RoundingMode.HALF_UP);

        String suggestion = String.format(
                "Suggested price: ₹%s – ₹%s (recommended: ₹%s)",
                totalLow, totalHigh, midpoint);

        return new PriceRecommendationResponse(
                totalLow, totalHigh, midpoint,
                BigDecimal.valueOf(low).setScale(2, RoundingMode.HALF_UP),
                BigDecimal.valueOf(high).setScale(2, RoundingMode.HALF_UP),
                suggestion, reasoning
        );
    }
}
