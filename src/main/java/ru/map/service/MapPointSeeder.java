package ru.map.service;

import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.runtime.server.event.ServerStartupEvent;
import jakarta.inject.Singleton;
import ru.map.model.MapPointEntity;
import ru.map.model.MapPointType;
import ru.map.repository.MapPointRepository;

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
                new MapPointEntity("Дворцовая площадь", 59.9390, 30.3158, MapPointType.LANDMARK, 10),
                new MapPointEntity("Государственный Эрмитаж", 59.9398, 30.3146, MapPointType.CULTURE, 11),
                new MapPointEntity("Исаакиевский собор", 59.9343, 30.3061, MapPointType.LANDMARK, 11),
                new MapPointEntity("Казанский собор", 59.9342, 30.3246, MapPointType.LANDMARK, 12),
                new MapPointEntity("Спас на Крови", 59.9400, 30.3287, MapPointType.LANDMARK, 12),
                new MapPointEntity("Петропавловская крепость", 59.9500, 30.3167, MapPointType.LANDMARK, 10),
                new MapPointEntity("Невский проспект", 59.9358, 30.3276, MapPointType.STREET, 11),
                new MapPointEntity("Мариинский театр", 59.9259, 30.2963, MapPointType.CULTURE, 12),
                new MapPointEntity("Летний сад", 59.9455, 30.3353, MapPointType.PARK, 12),
                new MapPointEntity("Русский музей", 59.9386, 30.3325, MapPointType.CULTURE, 12),
                new MapPointEntity("Московский вокзал", 59.9297, 30.3627, MapPointType.TRANSPORT, 12),
                new MapPointEntity("Витебский вокзал", 59.9203, 30.3294, MapPointType.TRANSPORT, 12),
                new MapPointEntity("Новая Голландия", 59.9291, 30.2895, MapPointType.PARK, 12),
                new MapPointEntity("Ленэкспо", 59.9311, 30.2357, MapPointType.VENUE, 10),
                new MapPointEntity("Газпром Арена", 59.9728, 30.2214, MapPointType.SPORT, 10),
                new MapPointEntity("Смольный собор", 59.9489, 30.3952, MapPointType.LANDMARK, 11),
                new MapPointEntity("Елагин остров", 59.9799, 30.2531, MapPointType.PARK, 11),
                new MapPointEntity("Лахта Центр", 59.9871, 30.1771, MapPointType.LANDMARK, 9)
        ));
    }
}
