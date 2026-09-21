package com.ecoconnect.dto;

import com.ecoconnect.model.enums.ExpiryAction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalTime;

@Data
public class CreateListingRequest {
    @NotBlank
    private String wasteType;       // e.g. SUGARCANE, COCONUT, FLOWER, FRUIT_PULP, DAIRY

    @NotNull
    @Positive
    private java.math.BigDecimal quantity;

    private String unit = "KG";

    @NotNull
    private LocalTime pickupDeadlineTime;

    @NotNull
    private ExpiryAction onExpiryAction;  // DISCARD or CARRY_FORWARD
}
