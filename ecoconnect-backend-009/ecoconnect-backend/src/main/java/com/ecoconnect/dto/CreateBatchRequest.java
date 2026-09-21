package com.ecoconnect.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CreateBatchRequest {
    @NotEmpty
    private List<UUID> orderIds;

    @NotNull
    @FutureOrPresent
    private LocalDate scheduledDate;
}
