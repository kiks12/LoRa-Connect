
export type LatLng = [number, number]
export type Polygon = LatLng[]

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
      [minLat, minLng], // Bottom-left corner
      [minLat, maxLng], // Bottom-right corner
      [maxLat, maxLng], // Top-right corner
      [maxLat, minLng], // Top-left corner
      [minLat, minLng], // Close the polygon
    ];
  });
}