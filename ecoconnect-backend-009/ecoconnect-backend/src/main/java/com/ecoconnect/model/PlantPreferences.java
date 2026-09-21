package com.ecoconnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "plant_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlantPreferences {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @OneToOne
    @JoinColumn(name = "plant_id", nullable = false, unique = true)
    private User plant;

    // Maps directly to the Postgres text[] column (Hibernate 6.2+)
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "accepted_waste_types", columnDefinition = "text[]", nullable = false)
    private List<String> acceptedWasteTypes;

    @Column(name = "preferred_radius_km", nullable = false)
    @Builder.Default
    private BigDecimal preferredRadiusKm = BigDecimal.valueOf(20);

    @Column(name = "min_quantity_kg", nullable = false)
    @Builder.Default
    private BigDecimal minQuantityKg = BigDecimal.ZERO;

    @Column(name = "max_capacity_kg")
    private BigDecimal maxCapacityKg;

    @Column(name = "notify_instantly", nullable = false)
    @Builder.Default
    private boolean notifyInstantly = true;
}
