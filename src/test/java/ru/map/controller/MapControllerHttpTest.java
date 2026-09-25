package ru.map.controller;

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
import ru.map.model.MapPoint;
import ru.map.service.MapPrefetchService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@MicronautTest
class MapControllerHttpTest {
    @Inject
    @Client("/")
    HttpClient client;

    @Inject
    MapPrefetchService prefetchService;

    @Test
    void prefetchReturnsMapPointJson() {
        when(prefetchService.prefetch(59.93, 30.31, 12))
                .thenReturn(List.of(new MapPoint(7L, "Palace Square", 59.939, 30.3158, "landmark", 10)));

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

    @MockBean(MapPrefetchService.class)
    MapPrefetchService prefetchService() {
        return mock(MapPrefetchService.class);
    }
}
