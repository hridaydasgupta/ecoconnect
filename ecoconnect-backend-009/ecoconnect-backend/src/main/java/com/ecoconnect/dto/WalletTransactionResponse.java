package com.ecoconnect.dto;

import com.ecoconnect.model.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class WalletTransactionResponse {
    private UUID id;
    private BigDecimal amount;
    private TransactionType type;
    private UUID relatedOrderId;
    private LocalDateTime createdAt;
}
