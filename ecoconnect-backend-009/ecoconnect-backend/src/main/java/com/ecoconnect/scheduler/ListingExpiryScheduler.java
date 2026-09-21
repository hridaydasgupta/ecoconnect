package com.ecoconnect.scheduler;

import com.ecoconnect.model.WasteListing;
import com.ecoconnect.model.enums.ExpiryAction;
import com.ecoconnect.model.enums.ListingStatus;
import com.ecoconnect.repository.WasteListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

// Runs every hour. Handles listings whose pickup deadline passed without a match:
//   - DISCARD choice            -> immediately DISCARDED
//   - CARRY_FORWARD, 1st time   -> auto-extended by 1 day (grace period), generator should confirm
//   - CARRY_FORWARD, already    -> generator never confirmed -> auto-DISCARDED
//     used the grace extension
@Component
@RequiredArgsConstructor
@Slf4j
public class ListingExpiryScheduler {

    private final WasteListingRepository wasteListingRepository;

    @Scheduled(cron = "0 0 * * * *") // every hour, on the hour
    public void processExpiredListings() {
        LocalDateTime now = LocalDateTime.now();

        List<WasteListing> expired = wasteListingRepository.findAll().stream()
                .filter(l -> l.getStatus() == ListingStatus.LISTED)
                .filter(l -> l.getExpiresAt().isBefore(now))
                .toList();

        for (WasteListing listing : expired) {
            if (listing.getOnExpiryAction() == ExpiryAction.DISCARD) {
                listing.setStatus(ListingStatus.DISCARDED);
                listing.setDiscardedReason("Deadline passed without pickup");
            } else if (listing.getCarryForwardCount() == 0) {
                // First grace extension — give the generator one more day, unconfirmed.
                listing.setExpiresAt(listing.getExpiresAt().plusDays(1));
                listing.setCarryForwardCount(1);
            } else {
                // Already carried forward once and still not picked up / not reconfirmed.
                listing.setStatus(ListingStatus.DISCARDED);
                listing.setDiscardedReason("Auto-discarded after unconfirmed carry-forward");
            }
            wasteListingRepository.save(listing);
        }

        if (!expired.isEmpty()) {
            log.info("Listing expiry job processed {} listing(s)", expired.size());
        }
    }
}
