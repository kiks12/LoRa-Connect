
export const OWNERS_TAG = "OWNERS_DATA_TABLE"
export const BRACELETS_TAG = "BRACELETS_DATA_TABLE"
export const RESCUERS_TAG = "RESCUERS_DATA_TABLE"
export const MISSIONS_TAG = "MISSIONS_DATA_TABLE"
export const EVACUATION_CENTERS_TAG = "EVACUATION_CENTERS_DATA_TABLE"

// GEOJSON SOURCE IDS
export const OWNER_SOURCE_BASE = "OWNER"
export const OWNER_POINT_SOURCE = `${OWNER_SOURCE_BASE}_POINT`
export const OWNER_AREA_SOURCE = `${OWNER_SOURCE_BASE}_AREA`

export function createGeoJsonSourceId(tags: string[], id: number) {
  return `${tags.join("_")}-${id}`
}