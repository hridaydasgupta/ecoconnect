package com.ecoconnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String role; // GENERATOR, RECYCLING_PLANT, LOGISTICS_AGENT, ADMIN
}
