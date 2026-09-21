package com.ecoconnect.model;

import com.ecoconnect.model.enums.StopStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pickup_stops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PickupStop {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @ManyToOne
    @JoinColumn(name = "batch_id", nullable = false)
    private PickupBatch batch;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private OrderEntity order;

    @Column(name = "stop_sequence", nullable = false)
    private Integer stopSequence;

    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StopStatus status = StopStatus.PENDING;

    @Column(name = "actual_weight")
    private BigDecimal actualWeight;

    @Column(name = "arrived_at")
    private LocalDateTime arrivedAt;
}
