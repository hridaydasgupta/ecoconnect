package com.ecoconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class WalletSummaryResponse {
    private BigDecimal balance;   // sum of CREDITs minus sum of DEBITs
    private List<WalletTransactionResponse> transactions;
}
