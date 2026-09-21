package com.ecoconnect.repository;

import com.ecoconnect.model.PickupStop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PickupStopRepository extends JpaRepository<PickupStop, UUID> {
    boolean existsByOrder_Id(UUID orderId);
}
