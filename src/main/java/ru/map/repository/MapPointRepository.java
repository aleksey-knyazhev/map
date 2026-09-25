package ru.map.repository;

import io.micronaut.data.annotation.Query;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;
import ru.map.model.MapPointEntity;

import java.util.List;

@Repository
public interface MapPointRepository extends CrudRepository<MapPointEntity, Long> {
    @Query("""
            SELECT p
            FROM MapPointEntity p
            WHERE p.lat BETWEEN :minLat AND :maxLat
              AND p.lng BETWEEN :minLng AND :maxLng
              AND p.minZoomToShow <= :zoom
            ORDER BY p.title
            """)
    List<MapPointEntity> findVisiblePoints(
            double minLat,
            double maxLat,
            double minLng,
            double maxLng,
            int zoom
    );
}
