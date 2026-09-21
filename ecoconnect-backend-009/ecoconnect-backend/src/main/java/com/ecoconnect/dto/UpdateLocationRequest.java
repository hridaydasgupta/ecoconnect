package com.ecoconnect.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateLocationRequest {
    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;
}
