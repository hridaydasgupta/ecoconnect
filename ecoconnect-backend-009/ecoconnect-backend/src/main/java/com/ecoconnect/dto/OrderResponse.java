package com.ecoconnect.dto;

import com.ecoconnect.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private UUID listingId;
    private String wasteType;
    private String generatorName;
    private String plantName;
    private java.math.BigDecimal quantity;   // ← Added
    private String unit;                      // ← Added (KG / TONNES)
    private BigDecimal agreedPrice;
    private OrderStatus status;
    private LocalDateTime matchedAt;
}
