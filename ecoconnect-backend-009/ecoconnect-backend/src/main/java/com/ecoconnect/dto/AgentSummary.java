package com.ecoconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class AgentSummary {
    private UUID id;
    private String name;
    private String phone;
    private Double vehicleCapacityKg;
}
