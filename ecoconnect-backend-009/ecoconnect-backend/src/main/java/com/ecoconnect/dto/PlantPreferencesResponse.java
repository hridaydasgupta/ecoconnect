package com.ecoconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class PlantPreferencesResponse {
    private List<String> acceptedWasteTypes;
    private BigDecimal preferredRadiusKm;
    private BigDecimal minQuantityKg;
    private BigDecimal maxCapacityKg;
    private boolean notifyInstantly;
}
