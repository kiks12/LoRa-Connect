
export const USERS_TAG = "USERS_DATA_TABLE"
export const BRACELETS_TAG = "BRACELETS_DATA_TABLE"
export const RESCUERS_TAG = "RESCUERS_DATA_TABLE"
export const OPERATIONS_TAG = "OPERATIONS_DATA_TABLE"
export const EVACUATION_CENTERS_TAG = "EVACUATION_CENTERS_DATA_TABLE"
export const TEAMS_TAG = "TEAMS_TAG_DATA_TABLE"

// GEOJSON SOURCE IDS
export const USER_SOURCE_BASE = "OWNER"
export const USER_POINT_SOURCE = `${USER_SOURCE_BASE}_POINT`
export const USER_AREA_SOURCE = `${USER_SOURCE_BASE}_AREA`

export const RESCUER_SOURCE_BASE = "RESCUER"
export const RESCUER_POINT_SOURCE = `${RESCUER_SOURCE_BASE}_POINT`
export const RESCUER_AREA_SOURCE = `${RESCUER_SOURCE_BASE}_AREA`

export function createGeoJsonSourceId(tags: string[], id: number) {
  return `${tags.join("_")}-${id}`
}