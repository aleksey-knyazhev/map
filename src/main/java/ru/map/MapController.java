package ru.map;

import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.QueryValue;

import java.util.Comparator;
import java.util.List;

@Controller("/api/map")
public class MapController {
    private static final double PREFETCH_MULTIPLIER = 2.5;

    private static final List<MapPoint> POINTS = List.of(
            new MapPoint(1, "Palace Square", 59.9390, 30.3158, "landmark", 10),
            new MapPoint(2, "State Hermitage Museum", 59.9398, 30.3146, "culture", 11),
            new MapPoint(3, "Saint Isaac's Cathedral", 59.9343, 30.3061, "landmark", 11),
            new MapPoint(4, "Kazan Cathedral", 59.9342, 30.3246, "landmark", 12),
            new MapPoint(5, "Church of the Savior on Spilled Blood", 59.9400, 30.3287, "landmark", 12),
            new MapPoint(6, "Peter and Paul Fortress", 59.9500, 30.3167, "landmark", 10),
            new MapPoint(7, "Nevsky Prospect", 59.9358, 30.3276, "street", 11),
            new MapPoint(8, "Mariinsky Theatre", 59.9259, 30.2963, "culture", 12),
            new MapPoint(9, "Summer Garden", 59.9455, 30.3353, "park", 12),
            new MapPoint(10, "Russian Museum", 59.9386, 30.3325, "culture", 12),
            new MapPoint(11, "Moskovsky Railway Station", 59.9297, 30.3627, "transport", 12),
            new MapPoint(12, "Vitebsky Railway Station", 59.9203, 30.3294, "transport", 12),
            new MapPoint(13, "New Holland Island", 59.9291, 30.2895, "park", 12),
            new MapPoint(14, "Lenexpo", 59.9311, 30.2357, "venue", 10),
            new MapPoint(15, "Gazprom Arena", 59.9728, 30.2214, "sport", 10),
            new MapPoint(16, "Smolny Cathedral", 59.9489, 30.3952, "landmark", 11),
            new MapPoint(17, "Yelagin Island", 59.9799, 30.2531, "park", 11),
            new MapPoint(18, "Lakhta Center", 59.9871, 30.1771, "landmark", 9)
    );

    @Get("/prefetch")
    public List<MapPoint> prefetch(
            @QueryValue double centerLat,
            @QueryValue double centerLng,
            @QueryValue int zoom
    ) {
        double safeLat = clamp(centerLat, -85.0, 85.0);
        int safeZoom = clamp(zoom, 1, 19);
        double screenVerticalSpan = 180.0 / Math.pow(2.0, safeZoom - 1.0);
        double latHalfDelta = (screenVerticalSpan / 2.0) * PREFETCH_MULTIPLIER;
        double cos = Math.max(Math.cos(Math.toRadians(safeLat)), 0.01);
        double lngHalfDelta = Math.min(latHalfDelta / cos, 180.0);

        double minLat = clamp(safeLat - latHalfDelta, -90.0, 90.0);
        double maxLat = clamp(safeLat + latHalfDelta, -90.0, 90.0);
        double minLng = normalizeLng(centerLng - lngHalfDelta);
        double maxLng = normalizeLng(centerLng + lngHalfDelta);

        return POINTS.stream()
                .filter(point -> point.minZoomToShow() <= safeZoom)
                .filter(point -> point.lat() >= minLat && point.lat() <= maxLat)
                .filter(point -> isLngInside(point.lng(), minLng, maxLng))
                .sorted(Comparator.comparing(MapPoint::title))
                .toList();
    }

    private static boolean isLngInside(double lng, double minLng, double maxLng) {
        double normalized = normalizeLng(lng);
        if (minLng <= maxLng) {
            return normalized >= minLng && normalized <= maxLng;
        }
        return normalized >= minLng || normalized <= maxLng;
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
