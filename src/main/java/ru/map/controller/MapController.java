package ru.map.controller;

import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.QueryValue;
import ru.map.model.MapPoint;
import ru.map.service.MapPrefetchService;

import java.util.List;

@Controller("/api/map")
public class MapController {
    private final MapPrefetchService prefetchService;

    public MapController(MapPrefetchService prefetchService) {
        this.prefetchService = prefetchService;
    }

    @Get("/prefetch")
    public List<MapPoint> prefetch(
            @QueryValue double centerLat,
            @QueryValue double centerLng,
            @QueryValue int zoom
    ) {
        return prefetchService.prefetch(centerLat, centerLng, zoom);
    }
}
