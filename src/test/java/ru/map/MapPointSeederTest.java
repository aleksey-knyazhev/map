package ru.map;

import io.micronaut.runtime.server.event.ServerStartupEvent;
import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MapPointSeederTest {
    private final MapPointRepository repository = mock(MapPointRepository.class);
    private final MapPointSeeder seeder = new MapPointSeeder(repository);

    @Test
    void seedsInitialPointsWhenRepositoryIsEmpty() {
        when(repository.count()).thenReturn(0L);

        seeder.onApplicationEvent(mock(ServerStartupEvent.class));

        verify(repository).saveAll(any(Iterable.class));
    }

    @Test
    void doesNotSeedWhenPointsAlreadyExist() {
        when(repository.count()).thenReturn(1L);

        seeder.onApplicationEvent(mock(ServerStartupEvent.class));

        verify(repository, never()).saveAll(any(Iterable.class));
    }
}
