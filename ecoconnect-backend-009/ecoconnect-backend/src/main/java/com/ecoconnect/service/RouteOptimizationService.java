package com.ecoconnect.service;

import com.ecoconnect.model.PickupStop;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * AI Route Optimization Service
 * ─────────────────────────────
 * Type:       Heuristic Search-based AI
 * Algorithm:  Nearest Neighbor Greedy Heuristic (TSP variant)
 * Complexity: O(n²) — suitable for real-time pickup route optimization
 *
 * Problem: Given n pickup stops with GPS coordinates, find a near-optimal
 *          visiting order that minimizes total travel distance.
 *
 * Approach: Start from stop #1, repeatedly visit the nearest unvisited stop.
 *           Uses Haversine formula for geodesic (great-circle) distance.
 *
 * Academic Reference: Nearest Neighbor is a greedy heuristic for TSP (NP-Hard).
 *                     It produces routes within ~20-25% of optimal on average.
 */
@Service
public class RouteOptimizationService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Optimizes the pickup stop order using Nearest Neighbor heuristic.
     *
     * @param stops  List of pickup stops with GPS coordinates
     * @return       Re-ordered list of stops (optimized route)
     */
    public List<PickupStop> optimizeRoute(List<PickupStop> stops) {
        if (stops == null || stops.size() <= 2) {
            return stops; // No optimization needed for 0-2 stops
        }

        int n = stops.size();
        boolean[] visited = new boolean[n];
        List<PickupStop> optimized = new ArrayList<>(n);

        // Start from the first stop (index 0)
        int current = 0;
        visited[current] = true;
        optimized.add(stops.get(current));

        // Nearest Neighbor: always go to the closest unvisited stop
        for (int step = 1; step < n; step++) {
            int nearest = -1;
            double minDist = Double.MAX_VALUE;

            PickupStop currentStop = stops.get(current);

            for (int j = 0; j < n; j++) {
                if (!visited[j]) {
                    double dist = haversineKm(
                            currentStop.getLatitude(),  currentStop.getLongitude(),
                            stops.get(j).getLatitude(), stops.get(j).getLongitude()
                    );
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = j;
                    }
                }
            }

            if (nearest != -1) {
                visited[nearest] = true;
                optimized.add(stops.get(nearest));
                current = nearest;
            }
        }

        return optimized;
    }

    /**
     * Calculates total route distance in km for a given stop order.
     * Used to compare before/after optimization.
     */
    public double totalRouteDistanceKm(List<PickupStop> stops) {
        double total = 0.0;
        for (int i = 0; i < stops.size() - 1; i++) {
            PickupStop a = stops.get(i);
            PickupStop b = stops.get(i + 1);
            if (a.getLatitude() != null && b.getLatitude() != null) {
                total += haversineKm(a.getLatitude(), a.getLongitude(),
                                     b.getLatitude(), b.getLongitude());
            }
        }
        return Math.round(total * 100.0) / 100.0; // round to 2 decimals
    }

    /**
     * Haversine Formula — Great-circle distance between two GPS points.
     *
     * Formula:
     *   a = sin²(Δlat/2) + cos(lat1) · cos(lat2) · sin²(Δlon/2)
     *   c = 2 · atan2(√a, √(1−a))
     *   d = R · c
     *
     * @param lat1  Latitude of point 1 (degrees)
     * @param lon1  Longitude of point 1 (degrees)
     * @param lat2  Latitude of point 2 (degrees)
     * @param lon2  Longitude of point 2 (degrees)
     * @return      Distance in kilometers
     */
    public double haversineKm(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0.0;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
