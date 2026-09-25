package ru.map.repository;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.testcontainers.containers.PostgreSQLContainer;
import ru.map.model.MapPointEntity;
import ru.map.model.MapPointType;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

@MicronautTest(transactional = false)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class MapPointRepositoryTest implements TestPropertyProvider {
    private static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17-alpine")
            .withDatabaseName("map_test")
            .withUsername("postgres")
            .withPassword("postgres");

    static {
        POSTGRES.start();
    }

    @Inject
    MapPointRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void findsOnlyPointsInsideBoundsAndVisibleForZoom() {
        repository.saveAll(List.of(
                new MapPointEntity("Inside", 59.93, 30.31, MapPointType.LANDMARK, 10),
                new MapPointEntity("Outside latitude", 61.00, 30.31, MapPointType.LANDMARK, 10),
                new MapPointEntity("Outside longitude", 59.93, 31.00, MapPointType.LANDMARK, 10),
                new MapPointEntity("Hidden by zoom", 59.93, 30.31, MapPointType.LANDMARK, 13)
        ));

        List<MapPointEntity> result = repository.findVisiblePoints(59.0, 60.0, 30.0, 30.5, 12);

        assertEquals(List.of("Inside"), result.stream().map(MapPointEntity::getTitle).toList());
    }

    @Test
    void returnsResultsOrderedByTitle() {
        repository.saveAll(List.of(
                new MapPointEntity("Zulu", 59.93, 30.31, MapPointType.LANDMARK, 10),
                new MapPointEntity("Alpha", 59.94, 30.32, MapPointType.PARK, 10),
                new MapPointEntity("Middle", 59.95, 30.33, MapPointType.CULTURE, 10)
        ));

        List<MapPointEntity> result = repository.findVisiblePoints(59.0, 60.0, 30.0, 31.0, 12);

        assertEquals(List.of("Alpha", "Middle", "Zulu"), result.stream().map(MapPointEntity::getTitle).toList());
    }

    @Test
    void returnsEmptyListWhenNothingMatches() {
        repository.save(new MapPointEntity("Outside", 59.93, 30.31, MapPointType.LANDMARK, 10));

        List<MapPointEntity> result = repository.findVisiblePoints(10.0, 20.0, 10.0, 20.0, 12);

        assertEquals(List.of(), result);
    }

    @Override
    public Map<String, String> getProperties() {
        return Map.of(
                "datasources.default.url", POSTGRES.getJdbcUrl(),
                "datasources.default.username", POSTGRES.getUsername(),
                "datasources.default.password", POSTGRES.getPassword(),
                "datasources.default.driver-class-name", "org.postgresql.Driver",
                "datasources.default.db-type", "postgres",
                "datasources.default.dialect", "POSTGRES",
                "jpa.default.properties.hibernate.hbm2ddl.auto", "create-drop"
        );
    }
}
