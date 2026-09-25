package ru.map.service;

public record MapBounds(
        double minLat,
        double maxLat,
        double minLng,
        double maxLng,
        int zoom
) {
    public boolean crossesAntimeridian() {
        return minLng > maxLng;
    }
}
