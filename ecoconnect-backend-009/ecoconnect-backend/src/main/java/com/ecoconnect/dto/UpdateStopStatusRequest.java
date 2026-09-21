package com.ecoconnect.dto;

import com.ecoconnect.model.enums.StopStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateStopStatusRequest {
    @NotNull
    private StopStatus status;      // ARRIVED, COMPLETED, or FAILED

    private BigDecimal actualWeight; // required when status = COMPLETED
}
