package com.ecoconnect.controller;

import com.ecoconnect.dto.AgentSummary;
import com.ecoconnect.model.User;
import com.ecoconnect.model.enums.Role;
import com.ecoconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
public class AgentController {

    private final UserRepository userRepository;

    // A Plant needs this list to pick who to assign a batch to.
    @PreAuthorize("hasRole('RECYCLING_PLANT')")
    @GetMapping("/available")
    public ResponseEntity<List<AgentSummary>> getAvailableAgents() {
        List<AgentSummary> agents = userRepository.findByRole(Role.LOGISTICS_AGENT).stream()
                .map(a -> new AgentSummary(a.getId(), a.getName(), a.getPhone(), a.getVehicleCapacityKg()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(agents);
    }
}
