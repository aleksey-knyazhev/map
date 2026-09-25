package ru.map.service;

import org.junit.jupiter.api.Test;
import ru.map.model.MapPoint;
import ru.map.model.MapPointEntity;
import ru.map.model.MapPointType;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MapPointMapperTest {
    private final MapPointMapper mapper = new MapPointMapper();

    @Test
    void mapsEntityToDto() throws Exception {
        MapPointEntity entity = entity(42L, "Hermitage", 59.9398, 30.3146, MapPointType.CULTURE, 11);

        MapPoint result = mapper.toDto(entity);

        assertEquals(new MapPoint(42L, "Hermitage", 59.9398, 30.3146, "culture", 11), result);
    }

    private static MapPointEntity entity(
            Long id,
            String title,
            double lat,
            double lng,
            MapPointType type,
            int minZoomToShow
    ) throws Exception {
        MapPointEntity entity = new MapPointEntity(title, lat, lng, type, minZoomToShow);
        Field idField = MapPointEntity.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(entity, id);
        return entity;
    }
}
