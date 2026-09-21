package com.ecoconnect.controller;

import com.ecoconnect.dto.UpdateLocationRequest;
import com.ecoconnect.model.User;
import com.ecoconnect.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Works for any logged-in role — generators and plants both need this set.
    @PutMapping("/me/location")
    public ResponseEntity<Void> updateMyLocation(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateLocationRequest request) {
        userService.updateLocation(user, request);
        return ResponseEntity.ok().build();
    }
}
