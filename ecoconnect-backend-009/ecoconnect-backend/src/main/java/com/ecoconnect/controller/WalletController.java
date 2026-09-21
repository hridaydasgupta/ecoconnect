package com.ecoconnect.controller;

import com.ecoconnect.dto.WalletSummaryResponse;
import com.ecoconnect.model.User;
import com.ecoconnect.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    // Works for any role — generators, plants, and agents all have a wallet history.
    @GetMapping("/mine")
    public ResponseEntity<WalletSummaryResponse> getMyWallet(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(walletService.getMyWallet(user));
    }
}
