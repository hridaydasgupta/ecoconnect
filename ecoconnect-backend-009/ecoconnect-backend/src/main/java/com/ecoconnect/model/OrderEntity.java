package com.ecoconnect.model;

import com.ecoconnect.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @OneToOne
    @JoinColumn(name = "listing_id", nullable = false, unique = true)
    private WasteListing listing;

    @ManyToOne
    @JoinColumn(name = "plant_id", nullable = false)
    private User plant;

    @Column(name = "agreed_price", nullable = false)
    @Builder.Default
    private BigDecimal agreedPrice = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.CONFIRMED;

    @CreationTimestamp
    @Column(name = "matched_at", updatable = false)
    private LocalDateTime matchedAt;
}
