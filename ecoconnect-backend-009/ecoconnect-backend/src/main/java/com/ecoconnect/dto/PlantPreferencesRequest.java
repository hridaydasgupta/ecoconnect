package com.ecoconnect.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PlantPreferencesRequest {
    @NotEmpty
    private List<String> acceptedWasteTypes;   // e.g. ["SUGARCANE", "COCONUT"]

    private BigDecimal preferredRadiusKm = BigDecimal.valueOf(20);
    private BigDecimal minQuantityKg = BigDecimal.ZERO;
    private BigDecimal maxCapacityKg;
    private boolean notifyInstantly = true;
}
