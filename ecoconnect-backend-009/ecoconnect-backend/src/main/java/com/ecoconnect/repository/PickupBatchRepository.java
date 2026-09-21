package com.ecoconnect.repository;

import com.ecoconnect.model.PickupBatch;
import com.ecoconnect.model.enums.BatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PickupBatchRepository extends JpaRepository<PickupBatch, UUID> {
    List<PickupBatch> findByPlant_Id(UUID plantId);
    List<PickupBatch> findByAgent_IdAndStatusIn(UUID agentId, List<BatchStatus> statuses);
    List<PickupBatch> findByAgent_IdOrderByCreatedAtDesc(UUID agentId); // all statuses — for history
}
