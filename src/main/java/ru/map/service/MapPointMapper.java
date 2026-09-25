package ru.map.service;

import jakarta.inject.Singleton;
import ru.map.model.MapPoint;
import ru.map.model.MapPointEntity;

import java.util.Locale;

@Singleton
public class MapPointMapper {
    public MapPoint toDto(MapPointEntity entity) {
        return new MapPoint(
                entity.getId(),
                entity.getTitle(),
                entity.getLat(),
                entity.getLng(),
                entity.getType().name().toLowerCase(Locale.ROOT),
                entity.getMinZoomToShow()
        );
    }
}
