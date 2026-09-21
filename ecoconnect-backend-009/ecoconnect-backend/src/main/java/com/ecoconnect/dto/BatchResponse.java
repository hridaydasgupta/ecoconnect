package com.ecoconnect.dto;

import com.ecoconnect.model.enums.BatchStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class BatchResponse {
    private UUID id;
    private BatchStatus status;
    private LocalDate scheduledDate;
    private BigDecimal totalWeightKg;
    private BigDecimal capacityLimitKg;
    private boolean capacityOk;
    private List<StopSummary> stops;
    private Double totalDistanceKm; // Added: for route info display
    private String agentName;       // Added: to show assigned agent
}
