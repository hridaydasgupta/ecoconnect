package com.ecoconnect.dto;

import com.ecoconnect.model.enums.StopStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class StopSummary {
    private UUID stopId;
    private UUID orderId;
    private String generatorName;
    private String wasteType;
    private BigDecimal quantity;
    private int sequence;
    // Added: fields needed by Agent Trips UI
    private StopStatus status;
    private Double latitude;
    private Double longitude;
    private BigDecimal actualWeight;
    private LocalDateTime arrivedAt;
}
