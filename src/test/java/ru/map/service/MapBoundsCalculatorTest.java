package ru.map.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MapBoundsCalculatorTest {
    private final MapBoundsCalculator calculator = new MapBoundsCalculator();

    @Test
    void clampsZoomToSupportedRange() {
        assertEquals(1, calculator.calculate(59.93, 30.31, 0).zoom());
        assertEquals(19, calculator.calculate(59.93, 30.31, 25).zoom());
    }

    @Test
    void clampsLatitudeBeforeCalculatingBounds() {
        MapBounds bounds = calculator.calculate(100.0, 30.31, 19);

        assertEquals(84.99914169311523, bounds.minLat(), 0.00000001);
        assertEquals(85.00085830688477, bounds.maxLat(), 0.00000001);
    }

    @Test
    void detectsLongitudeRangeWithoutAntimeridianCrossing() {
        MapBounds bounds = calculator.calculate(59.93, 30.31, 12);

        assertFalse(bounds.crossesAntimeridian());
    }

    @Test
    void detectsLongitudeRangeWithAntimeridianCrossing() {
        MapBounds bounds = calculator.calculate(10.0, 179.9, 8);

        assertTrue(bounds.crossesAntimeridian());
        assertTrue(bounds.minLng() > bounds.maxLng());
    }
}
