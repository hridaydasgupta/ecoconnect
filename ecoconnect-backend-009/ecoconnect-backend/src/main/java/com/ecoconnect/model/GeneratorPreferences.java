package com.ecoconnect.model;

import com.ecoconnect.model.enums.ListingPattern;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "generator_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratorPreferences {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @OneToOne
    @JoinColumn(name = "generator_id", nullable = false, unique = true)
    private User generator;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_pattern", nullable = false, length = 20)
    @Builder.Default
    private ListingPattern listingPattern = ListingPattern.IRREGULAR;

    @Column(name = "reminder_enabled", nullable = false)
    @Builder.Default
    private boolean reminderEnabled = false;

    @Column(name = "preferred_reminder_time")
    private LocalTime preferredReminderTime;
}
