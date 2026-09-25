package ru.map.model;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Serdeable
@Table(
        name = "map_points",
        indexes = {
                @Index(name = "idx_map_points_lat_lng", columnList = "lat,lng"),
                @Index(name = "idx_map_points_min_zoom", columnList = "min_zoom_to_show")
        }
)
public class MapPointEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private double lat;

    @Column(nullable = false)
    private double lng;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MapPointType type;

    @Column(name = "min_zoom_to_show", nullable = false)
    private int minZoomToShow;

    public MapPointEntity() {
    }

    public MapPointEntity(String title, double lat, double lng, MapPointType type, int minZoomToShow) {
        this.title = title;
        this.lat = lat;
        this.lng = lng;
        this.type = type;
        this.minZoomToShow = minZoomToShow;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public double getLat() {
        return lat;
    }

    public double getLng() {
        return lng;
    }

    public MapPointType getType() {
        return type;
    }

    public int getMinZoomToShow() {
        return minZoomToShow;
    }
}
