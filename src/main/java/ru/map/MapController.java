package ru.map;

import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.QueryValue;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Controller("/api/map")
public class MapController {
    private static final double PREFETCH_MULTIPLIER = 2.5;

    private final MapPointRepository pointRepository;

    public MapController(MapPointRepository pointRepository) {
        this.pointRepository = pointRepository;
    }

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

        return findVisiblePoints(minLat, maxLat, minLng, maxLng, safeZoom)
                .stream()
                .map(MapController::toDto)
                .toList();
    }

    private List<MapPointEntity> findVisiblePoints(
            double minLat,
            double maxLat,
            double minLng,
            double maxLng,
            int zoom
    ) {
        if (minLng <= maxLng) {
            return pointRepository.findVisiblePoints(minLat, maxLat, minLng, maxLng, zoom);
        }

        List<MapPointEntity> result = new ArrayList<>();
        result.addAll(pointRepository.findVisiblePoints(minLat, maxLat, minLng, 180.0, zoom));
        result.addAll(pointRepository.findVisiblePoints(minLat, maxLat, -180.0, maxLng, zoom));
        result.sort(Comparator.comparing(MapPointEntity::getTitle));
        return result;
    }

    private static MapPoint toDto(MapPointEntity entity) {
        return new MapPoint(
                entity.getId(),
                entity.getTitle(),
                entity.getLat(),
                entity.getLng(),
                entity.getType(),
                entity.getMinZoomToShow()
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
