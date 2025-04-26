
import { createGeoJsonSourceId, USER_POINT_SOURCE, RESCUER_POINT_SOURCE } from "./tags";
import { GeoJSONSourceSpecification, LayerSpecification } from "maplibre-gl";
import { EVACUATION_CENTER_MARKER_COLOR, OBSTACLE_MARKER_COLOR, OWNER_MARKER_COLOR, RESCUER_MARKER_COLOR, ROUTE_COLOR } from "@/map-styles";
import { geometry } from "@turf/turf";

export function createOwnerPointGeoJSON({ userId, name, latitude, longitude }: { latitude: number; longitude: number; userId: number, name: string}) {
  return {
    sourceId: createGeoJsonSourceId([USER_POINT_SOURCE], userId),
    data: {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        properties: {
          name: name
        }
      },
    },
  };
}

export function createOwnerInnerPointLayerGeoJSON({ sourceId }: { sourceId: string }) {
  return {
    id: sourceId,
    source: sourceId,
    type: "circle",
    paint: {
      "circle-radius": 10,
      "circle-color": OWNER_MARKER_COLOR,
      "circle-opacity": 0.5,
      "circle-stroke-width": 2,
      "circle-stroke-color": OWNER_MARKER_COLOR,
    },
  };
}

export function createOwnerOuterPointLayerGeoJSON({ sourceId }: { sourceId: string }) {
  return {
    id: `${sourceId}-pulse`,
    source: sourceId,
    type: "circle",
    paint: {
      "circle-radius": 10,
      "circle-color": OWNER_MARKER_COLOR,
      "circle-opacity": 0,
    },
  };
}

export function createOwnerLabelLayer({ sourceId }: { sourceId: string }) {
  return {
    id: `${sourceId}-label`, // make sure it's unique
    source: sourceId,
    type: "symbol",
    layout: {
      "text-field": ["get", "name"], // <-- Pull "name" from feature properties
      "text-font": ["Noto Sans Bold"],
      "text-size": 12,
      "text-offset": [0, 1.5], // <-- move text below the circle
      "text-anchor": "top",
    },
    paint: {
      "text-color": "#000000", // Black text
      "text-halo-color": "#ffffff", // White outline for better visibility
      "text-halo-width": 1,
    },
  };
}

export function createRescuerPointGeoJSON({ rescuerId, name, latitude, longitude }: { latitude: number; longitude: number; rescuerId: number, name: string }) {
  return {
    sourceId: createGeoJsonSourceId([RESCUER_POINT_SOURCE], rescuerId),
    data: {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        properties: {
          name: name
        }
      },
    },
  };
}

export function createRescuerInnerPointLayerGeoJSON({ sourceId }: { sourceId: string }) {
  return {
    id: sourceId,
    source: sourceId,
    type: "circle",
    paint: {
      "circle-radius": 10,
      "circle-color": RESCUER_MARKER_COLOR,
      "circle-opacity": 0.5,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#bf8900",
    },
  };
}

export function createRescuerOuterPointLayerGeoJSON({ sourceId }: { sourceId: string }) {
  return {
    id: `${sourceId}-pulse`,
    source: sourceId,
    type: "circle",
    paint: {
      "circle-radius": 10,
      "circle-color": RESCUER_MARKER_COLOR,
      "circle-opacity": 0,
    },
  };
}

export function createRescuerLabelLayer({ sourceId }: { sourceId: string }) {
  return {
    id: `${sourceId}-label`, // make sure it's unique
    source: sourceId,
    type: "symbol",
    layout: {
      "text-field": ["get", "name"], // <-- Pull "name" from feature properties
      "text-font": ["Noto Sans Bold"],
      "text-size": 12,
      "text-offset": [0, 1.5], // <-- move text below the circle
      "text-anchor": "top",
    },
    paint: {
      "text-color": "#000000", // Black text
      "text-halo-color": "#ffffff", // White outline for better visibility
      "text-halo-width": 1,
    },
  };
}

export function createRouteSource(coordinates: number[][]) : GeoJSONSourceSpecification {
  return {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: coordinates
      }
    }
  }
}

export function createRouteLayerGeoJSON(id: string, source: string): LayerSpecification {
  return {
    id: id,
    type: 'line',
    source: source,
    layout: {
      'line-join': 'bevel',
      'line-cap': 'round'
    },
    paint: {
      'line-color': ROUTE_COLOR,
      'line-width': 6.5,
    }
  }
}

export const COLOR_MAP = {
  "RESCUERS": RESCUER_MARKER_COLOR,
  "USERS": OWNER_MARKER_COLOR,
  "EVACUATION_CENTERS": EVACUATION_CENTER_MARKER_COLOR,
  "OBSTACLES": OBSTACLE_MARKER_COLOR
}