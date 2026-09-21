package com.ecoconnect.model;

import com.ecoconnect.model.enums.BatchStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pickup_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PickupBatch {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @ManyToOne
    @JoinColumn(name = "plant_id", nullable = false)
    private User plant;

    @ManyToOne
    @JoinColumn(name = "agent_id")
    private User agent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BatchStatus status = BatchStatus.PLANNED;

    @Column(name = "total_distance_km")
    private Double totalDistanceKm;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PickupStop> stops = new java.util.ArrayList<>();
}
