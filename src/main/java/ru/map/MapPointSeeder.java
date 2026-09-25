package ru.map;

import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.runtime.server.event.ServerStartupEvent;
import jakarta.inject.Singleton;

import java.util.List;

@Singleton
public class MapPointSeeder implements ApplicationEventListener<ServerStartupEvent> {
    private final MapPointRepository repository;

    public MapPointSeeder(MapPointRepository repository) {
        this.repository = repository;
    }

    @Override
    public void onApplicationEvent(ServerStartupEvent event) {
        if (repository.count() > 0) {
            return;
        }

        repository.saveAll(List.of(
                new MapPointEntity("Palace Square", 59.9390, 30.3158, "landmark", 10),
                new MapPointEntity("State Hermitage Museum", 59.9398, 30.3146, "culture", 11),
                new MapPointEntity("Saint Isaac's Cathedral", 59.9343, 30.3061, "landmark", 11),
                new MapPointEntity("Kazan Cathedral", 59.9342, 30.3246, "landmark", 12),
                new MapPointEntity("Church of the Savior on Spilled Blood", 59.9400, 30.3287, "landmark", 12),
                new MapPointEntity("Peter and Paul Fortress", 59.9500, 30.3167, "landmark", 10),
                new MapPointEntity("Nevsky Prospect", 59.9358, 30.3276, "street", 11),
                new MapPointEntity("Mariinsky Theatre", 59.9259, 30.2963, "culture", 12),
                new MapPointEntity("Summer Garden", 59.9455, 30.3353, "park", 12),
                new MapPointEntity("Russian Museum", 59.9386, 30.3325, "culture", 12),
                new MapPointEntity("Moskovsky Railway Station", 59.9297, 30.3627, "transport", 12),
                new MapPointEntity("Vitebsky Railway Station", 59.9203, 30.3294, "transport", 12),
                new MapPointEntity("New Holland Island", 59.9291, 30.2895, "park", 12),
                new MapPointEntity("Lenexpo", 59.9311, 30.2357, "venue", 10),
                new MapPointEntity("Gazprom Arena", 59.9728, 30.2214, "sport", 10),
                new MapPointEntity("Smolny Cathedral", 59.9489, 30.3952, "landmark", 11),
                new MapPointEntity("Yelagin Island", 59.9799, 30.2531, "park", 11),
                new MapPointEntity("Lakhta Center", 59.9871, 30.1771, "landmark", 9)
        ));
    }
}
