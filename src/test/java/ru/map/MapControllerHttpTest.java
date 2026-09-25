package ru.map;

import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.client.HttpClient;
import io.micronaut.http.client.annotation.Client;
import io.micronaut.http.client.exceptions.HttpClientResponseException;
import io.micronaut.test.annotation.MockBean;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.core.type.Argument;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@MicronautTest
class MapControllerHttpTest {
    @Inject
    @Client("/")
    HttpClient client;

    @Inject
    MapPointRepository repository;

    @Test
    void prefetchReturnsMapPointJson() throws Exception {
        when(repository.findVisiblePoints(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(entity(7L, "Palace Square", 59.939, 30.3158, MapPointType.LANDMARK, 10)));

        List<MapPoint> result = client.toBlocking().retrieve(
                HttpRequest.GET("/api/map/prefetch?centerLat=59.93&centerLng=30.31&zoom=12"),
                Argument.listOf(MapPoint.class)
        );

        assertEquals(List.of(new MapPoint(7L, "Palace Square", 59.939, 30.3158, "landmark", 10)), result);
    }

    @Test
    void prefetchRejectsMissingRequiredQueryParameter() {
        HttpClientResponseException exception = assertThrows(
                HttpClientResponseException.class,
                () -> client.toBlocking().retrieve("/api/map/prefetch?centerLat=59.93&centerLng=30.31")
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void prefetchRejectsInvalidQueryParameterType() {
        HttpClientResponseException exception = assertThrows(
                HttpClientResponseException.class,
                () -> client.toBlocking().retrieve("/api/map/prefetch?centerLat=invalid&centerLng=30.31&zoom=12")
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @MockBean(MapPointRepository.class)
    MapPointRepository repository() {
        return mock(MapPointRepository.class);
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
