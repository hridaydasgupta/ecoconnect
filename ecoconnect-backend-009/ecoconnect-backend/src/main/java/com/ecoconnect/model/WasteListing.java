package com.ecoconnect.model;

import com.ecoconnect.model.enums.ExpiryAction;
import com.ecoconnect.model.enums.ListingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "waste_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasteListing {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @ManyToOne
    @JoinColumn(name = "generator_id", nullable = false)
    private User generator;

    @Column(name = "waste_type", nullable = false, length = 50)
    private String wasteType; // e.g. SUGARCANE, COCONUT, FLOWER, FRUIT_PULP, DAIRY

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String unit = "KG";

    @Column(name = "urgency_score", nullable = false)
    @Builder.Default
    private Integer urgencyScore = 0;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "pickup_deadline_time", nullable = false)
    @Builder.Default
    private LocalTime pickupDeadlineTime = LocalTime.of(20, 0);

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "on_expiry_action", nullable = false, length = 20)
    @Builder.Default
    private ExpiryAction onExpiryAction = ExpiryAction.CARRY_FORWARD;

    @Column(name = "carry_forward_count", nullable = false)
    @Builder.Default
    private Integer carryForwardCount = 0;

    @Column(name = "last_confirmed_at")
    private LocalDateTime lastConfirmedAt;

    @ManyToOne
    @JoinColumn(name = "carried_forward_from")
    private WasteListing carriedForwardFrom;

    @Column(name = "discarded_reason", length = 100)
    private String discardedReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ListingStatus status = ListingStatus.LISTED;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
