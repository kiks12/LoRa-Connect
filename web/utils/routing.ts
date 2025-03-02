
export type LatLng = [number, number]
export type Polygon = LatLng[]

export function createCustomModelObject(obstacles: LatLng[]) {
  const features = createBlockAreaFeatures(obstacles)
  const speeds = createBlockAreaSpeeds(obstacles)

  return {
    "speed": speeds,
    "areas": {
      "type": "FeatureCollection",
      "features": features,
    },
  }
}

export function createBlockAreaSpeeds(obstacles: LatLng[]) {
  const polygons = createAvoidPolygons(obstacles)
  return polygons.map((polygon, idx) => ({
    "if": `in_custom${idx}`,
    "multiply_by": "0"
  }))
}

export function createBlockAreaFeatures(obstacles: LatLng[]) {
  const polygons = createAvoidPolygons(obstacles)
  return polygons.map((polygon, idx) => ({
    "type": "Feature",
    "id": `custom${idx}`,
    "properties": {},
    "geometry": {
      "type": "Polygon",
      "coordinates": [polygon],
    }
  }))
}

/**
 * Creates avoid polygons for GraphHopper API from an array of obstacle coordinates.
 * @param obstacles Array of obstacle coordinates ([lat, lng]).
 * @param buffer Buffer size in degrees (default: 0.0001).
 * @returns Array of polygons in the format required by GraphHopper.
 */
export function createAvoidPolygons(obstacles: LatLng[], buffer: number = 0.0001, precision: number = 6): Polygon[] {
  // Helper function to round a number to the specified precision
  const round = (num: number): number => {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
  };

  return obstacles.map(([lat, lng]) => {
    // Calculate bounds for the square polygon
    const minLat = round(lat - buffer);
    const maxLat = round(lat + buffer);
    const minLng = round(lng - buffer);
    const maxLng = round(lng + buffer);

    // Define the square polygon (clockwise or counterclockwise)
    return [
      [minLng, minLat], // Bottom-left corner
      [maxLng, minLat], // Bottom-right corner
      [maxLng, maxLat], // Top-right corner
      [minLng, maxLat], // Top-left corner
      [minLng, minLat,], // Close the polygon
    ];
  });
}