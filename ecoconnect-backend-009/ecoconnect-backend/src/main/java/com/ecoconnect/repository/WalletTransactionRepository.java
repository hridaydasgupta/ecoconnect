package com.ecoconnect.repository;

import com.ecoconnect.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {
    List<WalletTransaction> findByUser_IdOrderByCreatedAtDesc(UUID userId);
}
