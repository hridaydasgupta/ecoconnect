package com.ecoconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Response from the AI Price Recommendation (Knowledge-based System).
 * Contains price range, midpoint suggestion, per-kg rates, and rule reasoning trace.
 */
@Data
@AllArgsConstructor
public class PriceRecommendationResponse {
    private BigDecimal totalPriceLow;       // Minimum recommended total price (₹)
    private BigDecimal totalPriceHigh;      // Maximum recommended total price (₹)
    private BigDecimal recommendedPrice;    // Midpoint — ideal offer price (₹)
    private BigDecimal perKgLow;            // Per-kg lower bound
    private BigDecimal perKgHigh;           // Per-kg upper bound
    private String suggestion;              // Human-readable summary
    private List<String> reasoning;         // Rule trace — which rules fired and why
}
