package ru.map.service;

import jakarta.inject.Singleton;
import ru.map.model.MapPoint;
import ru.map.model.MapPointEntity;
import ru.map.repository.MapPointRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Singleton
public class MapPrefetchService {
    private final MapBoundsCalculator boundsCalculator;
    private final MapPointRepository pointRepository;
    private final MapPointMapper pointMapper;

    public MapPrefetchService(
            MapBoundsCalculator boundsCalculator,
            MapPointRepository pointRepository,
            MapPointMapper pointMapper
    ) {
        this.boundsCalculator = boundsCalculator;
        this.pointRepository = pointRepository;
        this.pointMapper = pointMapper;
    }

    public List<MapPoint> prefetch(double centerLat, double centerLng, int zoom) {
        MapBounds bounds = boundsCalculator.calculate(centerLat, centerLng, zoom);
        return findVisiblePoints(bounds)
                .stream()
                .map(pointMapper::toDto)
                .toList();
    }

    private List<MapPointEntity> findVisiblePoints(MapBounds bounds) {
        if (!bounds.crossesAntimeridian()) {
            return pointRepository.findVisiblePoints(
                    bounds.minLat(),
                    bounds.maxLat(),
                    bounds.minLng(),
                    bounds.maxLng(),
                    bounds.zoom()
            );
        }

        List<MapPointEntity> result = new ArrayList<>();
        result.addAll(pointRepository.findVisiblePoints(
                bounds.minLat(),
                bounds.maxLat(),
                bounds.minLng(),
                180.0,
                bounds.zoom()
        ));
        result.addAll(pointRepository.findVisiblePoints(
                bounds.minLat(),
                bounds.maxLat(),
                -180.0,
                bounds.maxLng(),
                bounds.zoom()
        ));
        result.sort(Comparator.comparing(MapPointEntity::getTitle));
        return result;
    }
}
