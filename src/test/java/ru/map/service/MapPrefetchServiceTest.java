package ru.map.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.map.model.MapPoint;
import ru.map.model.MapPointEntity;
import ru.map.model.MapPointType;
import ru.map.repository.MapPointRepository;

import java.lang.reflect.Field;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MapPrefetchServiceTest {
    private final MapPointRepository repository = mock(MapPointRepository.class);
    private final MapPrefetchService service = new MapPrefetchService(
            new MapBoundsCalculator(),
            repository,
            new MapPointMapper()
    );

    @Test
    void queriesRepositoryOnceWhenLongitudeRangeDoesNotWrap() {
        when(repository.findVisiblePoints(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of());

        service.prefetch(59.93, 30.31, 12);

        verify(repository).findVisiblePoints(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyInt());
    }

    @Test
    void queriesBothLongitudeRangesWhenBoundsCrossAntimeridianAndSortsResult() throws Exception {
        MapPointEntity zPoint = entity(1L, "Zulu", 10.0, 179.7, MapPointType.LANDMARK, 5);
        MapPointEntity aPoint = entity(2L, "Alpha", 10.0, -179.7, MapPointType.PARK, 5);
        when(repository.findVisiblePoints(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(zPoint))
                .thenReturn(List.of(aPoint));

        List<MapPoint> result = service.prefetch(10.0, 179.9, 8);

        verify(repository, times(2)).findVisiblePoints(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyInt());
        assertEquals(List.of("Alpha", "Zulu"), result.stream().map(MapPoint::title).toList());
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
