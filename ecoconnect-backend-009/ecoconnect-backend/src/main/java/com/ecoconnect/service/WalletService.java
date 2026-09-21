package com.ecoconnect.service;

import com.ecoconnect.dto.WalletSummaryResponse;
import com.ecoconnect.dto.WalletTransactionResponse;
import com.ecoconnect.model.User;
import com.ecoconnect.model.WalletTransaction;
import com.ecoconnect.model.enums.TransactionType;
import com.ecoconnect.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletTransactionRepository walletTransactionRepository;

    public WalletSummaryResponse getMyWallet(User user) {
        List<WalletTransaction> txns = walletTransactionRepository
                .findByUser_IdOrderByCreatedAtDesc(user.getId());

        BigDecimal balance = txns.stream()
                .map(t -> t.getType() == TransactionType.CREDIT ? t.getAmount() : t.getAmount().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<WalletTransactionResponse> responses = txns.stream()
                .map(t -> new WalletTransactionResponse(
                        t.getId(), t.getAmount(), t.getType(),
                        t.getRelatedOrder() == null ? null : t.getRelatedOrder().getId(),
                        t.getCreatedAt()))
                .collect(Collectors.toList());

        return new WalletSummaryResponse(balance, responses);
    }
}
