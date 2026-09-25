package ru.map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MapControllerTest {
    private final MapPointRepository repository = mock(MapPointRepository.class);
    private final MapController controller = new MapController(repository);

    @Test
    void mapsEntitiesToResponseDtos() throws Exception {
        MapPointEntity entity = entity(42L, "Hermitage", 59.9398, 30.3146, MapPointType.CULTURE, 11);
        when(repository.findVisiblePoints(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(entity));

        List<MapPoint> result = controller.prefetch(59.93, 30.31, 12);

        assertEquals(List.of(new MapPoint(42L, "Hermitage", 59.9398, 30.3146, "culture", 11)), result);
    }

    @Test
    void clampsZoomToSupportedRange() {
        when(repository.findVisiblePoints(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of());

        controller.prefetch(59.93, 30.31, 0);
        controller.prefetch(59.93, 30.31, 25);

        ArgumentCaptor<Integer> zoomCaptor = ArgumentCaptor.forClass(Integer.class);
        verify(repository, times(2)).findVisiblePoints(anyDouble(), anyDouble(), anyDouble(), anyDouble(), zoomCaptor.capture());
        assertIterableEquals(List.of(1, 19), zoomCaptor.getAllValues());
    }

    @Test
    void clampsLatitudeBeforeCalculatingBounds() {
        when(repository.findVisiblePoints(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of());

        controller.prefetch(100.0, 30.31, 19);

        ArgumentCaptor<Double> minLatCaptor = ArgumentCaptor.forClass(Double.class);
        ArgumentCaptor<Double> maxLatCaptor = ArgumentCaptor.forClass(Double.class);
        verify(repository).findVisiblePoints(
                minLatCaptor.capture(),
                maxLatCaptor.capture(),
                anyDouble(),
                anyDouble(),
                anyInt()
        );
        assertEquals(84.99914169311523, minLatCaptor.getValue(), 0.00000001);
        assertEquals(85.00085830688477, maxLatCaptor.getValue(), 0.00000001);
    }

    @Test
    void queriesRepositoryOnceWhenLongitudeRangeDoesNotWrap() {
        when(repository.findVisiblePoints(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of());

        controller.prefetch(59.93, 30.31, 12);

        verify(repository).findVisiblePoints(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyInt());
    }

    @Test
    void queriesBothLongitudeRangesWhenBoundsCrossAntimeridianAndSortsResult() throws Exception {
        MapPointEntity zPoint = entity(1L, "Zulu", 10.0, 179.7, MapPointType.LANDMARK, 5);
        MapPointEntity aPoint = entity(2L, "Alpha", 10.0, -179.7, MapPointType.PARK, 5);
        when(repository.findVisiblePoints(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(zPoint))
                .thenReturn(List.of(aPoint));

        List<MapPoint> result = controller.prefetch(10.0, 179.9, 8);

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
