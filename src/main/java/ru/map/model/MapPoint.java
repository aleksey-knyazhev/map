package ru.map.model;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record MapPoint(
        long id,
        String title,
        double lat,
        double lng,
        String type,
        int minZoomToShow
) {
}
