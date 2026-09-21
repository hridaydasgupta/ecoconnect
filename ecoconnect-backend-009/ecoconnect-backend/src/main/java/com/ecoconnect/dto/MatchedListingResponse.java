package com.ecoconnect.dto;

import com.ecoconnect.model.enums.ExpiryAction;
import com.ecoconnect.model.enums.ListingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class MatchedListingResponse {
    private UUID id;
    private String wasteType;
    private BigDecimal quantity;
    private String unit;
    private LocalTime pickupDeadlineTime;
    private LocalDateTime expiresAt;
    private ExpiryAction onExpiryAction;
    private ListingStatus status;
    private String generatorName;
    private Double distanceKm;   // null if either party has no location set
    private Integer urgencyScore;
}
