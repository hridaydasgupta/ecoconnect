package com.ecoconnect.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AcceptListingRequest {
    @NotNull
    @PositiveOrZero
    private BigDecimal agreedPrice;
}
