package com.br.puc.carona.utils;

import java.util.ArrayList;
import java.util.List;

import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

/**
 * Utility class for optimizing routes with multiple waypoints.
 * Implements a simple nearest neighbor heuristic for the Traveling Salesman Problem (TSP).
 */
@UtilityClass
@Slf4j
public class RouteOptimizer {

    /**
     * Represents a waypoint with its coordinates and metadata.
     */
    public static class Waypoint {
        private final Double latitude;
        private final Double longitude;
        private final String type; // "pickup" or "dropoff"
        private final Long passengerId;
        private final String passengerName;
        private final String address;
        private final Long pedidoId;

        public Waypoint(Double latitude, Double longitude, String type, Long passengerId, 
                       String passengerName, String address, Long pedidoId) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.type = type;
            this.passengerId = passengerId;
            this.passengerName = passengerName;
            this.address = address;
            this.pedidoId = pedidoId;
        }

        // Getters
        public Double getLatitude() { return latitude; }
        public Double getLongitude() { return longitude; }
        public String getType() { return type; }
        public Long getPassengerId() { return passengerId; }
        public String getPassengerName() { return passengerName; }
        public String getAddress() { return address; }
        public Long getPedidoId() { return pedidoId; }
        
        public boolean isPickup() { return "pickup".equals(type); }
        public boolean isDropoff() { return "dropoff".equals(type); }
        
        @Override
        public String toString() {
            return String.format("%s[%s] for %s at (%.6f, %.6f)", 
                type, passengerId, passengerName, latitude, longitude);
        }
    }

    /**
     * Optimizes the order of waypoints using a nearest neighbor algorithm with constraints.
     * Ensures that pickup points are visited before their corresponding dropoff points.
     * 
     * @param startLat Driver's starting latitude
     * @param startLng Driver's starting longitude
     * @param endLat Driver's ending latitude
     * @param endLng Driver's ending longitude
     * @param waypoints List of waypoints to optimize
     * @return List of waypoints in optimized order
     */
    public static List<Waypoint> optimizeRoute(Double startLat, Double startLng, 
                                              Double endLat, Double endLng, 
                                              List<Waypoint> waypoints) {
        if (waypoints == null || waypoints.isEmpty()) {
            return new ArrayList<>();
        }

        log.info("Optimizing route with {} waypoints", waypoints.size());
        
        // Create a copy of waypoints to avoid modifying the original list
        final List<Waypoint> remainingWaypoints = new ArrayList<>(waypoints);
        final List<Waypoint> optimizedRoute = new ArrayList<>();
        
        // Current position starts at driver's start location
        Double currentLat = startLat;
        Double currentLng = startLng;
        
        // Apply constraints and optimize
        while (!remainingWaypoints.isEmpty()) {
            Waypoint nextWaypoint = findNextBestWaypoint(currentLat, currentLng, remainingWaypoints);
            
            if (nextWaypoint == null) {
                // This shouldn't happen, but just in case
                log.warn("Could not find next waypoint, adding remaining waypoints in order");
                optimizedRoute.addAll(remainingWaypoints);
                break;
            }
            
            optimizedRoute.add(nextWaypoint);
            remainingWaypoints.remove(nextWaypoint);
            
            // Update current position
            currentLat = nextWaypoint.getLatitude();
            currentLng = nextWaypoint.getLongitude();
            
            log.debug("Added waypoint: {}", nextWaypoint);
        }
        
        log.info("Route optimization completed. Order: {}", 
            optimizedRoute.stream()
                .map(w -> String.format("%s(%s)", w.getType(), w.getPassengerName()))
                .toList());
        
        return optimizedRoute;
    }

    /**
     * Finds the next best waypoint to visit based on distance and constraints.
     * Constraints:
     * 1. Cannot visit a dropoff point before its corresponding pickup point
     * 2. Prefer pickup points when distances are similar
     */
    private static Waypoint findNextBestWaypoint(Double currentLat, Double currentLng, 
                                               List<Waypoint> remainingWaypoints) {
        Waypoint bestWaypoint = null;
        double bestDistance = Double.MAX_VALUE;
        
        for (Waypoint waypoint : remainingWaypoints) {
            // Check constraints
            if (!canVisitWaypoint(waypoint, remainingWaypoints)) {
                continue;
            }
            
            double distance = calculateDistance(currentLat, currentLng, 
                                              waypoint.getLatitude(), waypoint.getLongitude());
            
            // Apply heuristics: prefer pickup points when distances are close
            if (waypoint.isPickup()) {
                distance *= 0.9; // Give pickup points a 10% advantage
            }
            
            if (distance < bestDistance) {
                bestDistance = distance;
                bestWaypoint = waypoint;
            }
        }
        
        return bestWaypoint;
    }

    /**
     * Checks if a waypoint can be visited based on constraints.
     * Rule: Cannot visit a dropoff point if its corresponding pickup point hasn't been visited yet.
     */
    private static boolean canVisitWaypoint(Waypoint waypoint, List<Waypoint> remainingWaypoints) {
        if (waypoint.isPickup()) {
            return true; // Pickup points can always be visited
        }
        
        // For dropoff points, check if corresponding pickup point has been visited
        boolean hasCorrespondingPickup = remainingWaypoints.stream()
            .anyMatch(w -> w.isPickup() && w.getPassengerId().equals(waypoint.getPassengerId()));
        
        return !hasCorrespondingPickup; // Can visit dropoff only if pickup is already done
    }

    /**
     * Calculates the Haversine distance between two points in kilometers.
     */
    private static double calculateDistance(Double lat1, Double lng1, Double lat2, Double lng2) {
        final double R = 6371; // Earth's radius in kilometers
        final double dLat = Math.toRadians(lat2 - lat1);
        final double dLng = Math.toRadians(lng2 - lng1);
        
        final double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        final double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }

    /**
     * Converts optimized waypoints to coordinate arrays for route calculation.
     */
    public static List<Double[]> waypointsToCoordinates(List<Waypoint> waypoints) {
        return waypoints.stream()
            .map(w -> new Double[]{w.getLatitude(), w.getLongitude()})
            .toList();
    }
}
