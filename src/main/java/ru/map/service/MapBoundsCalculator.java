package ru.map.service;

import jakarta.inject.Singleton;

@Singleton
public class MapBoundsCalculator {
    private static final double PREFETCH_MULTIPLIER = 2.5;
    private static final double MIN_SAFE_LAT = -85.0;
    private static final double MAX_SAFE_LAT = 85.0;
    private static final int MIN_ZOOM = 1;
    private static final int MAX_ZOOM = 19;

    public MapBounds calculate(double centerLat, double centerLng, int zoom) {
        double safeLat = clamp(centerLat, MIN_SAFE_LAT, MAX_SAFE_LAT);
        int safeZoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
        double screenVerticalSpan = 180.0 / Math.pow(2.0, safeZoom - 1.0);
        double latHalfDelta = (screenVerticalSpan / 2.0) * PREFETCH_MULTIPLIER;
        double cos = Math.max(Math.cos(Math.toRadians(safeLat)), 0.01);
        double lngHalfDelta = Math.min(latHalfDelta / cos, 180.0);

        return new MapBounds(
                clamp(safeLat - latHalfDelta, -90.0, 90.0),
                clamp(safeLat + latHalfDelta, -90.0, 90.0),
                normalizeLng(centerLng - lngHalfDelta),
                normalizeLng(centerLng + lngHalfDelta),
                safeZoom
        );
    }

    private static double normalizeLng(double lng) {
        double normalized = ((lng + 180.0) % 360.0 + 360.0) % 360.0 - 180.0;
        return normalized == -180.0 ? 180.0 : normalized;
    }

    private static double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private static int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
