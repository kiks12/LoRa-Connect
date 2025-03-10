
import { createGeoJsonSourceId, USER_POINT_SOURCE, RESCUER_POINT_SOURCE } from "./tags";
import { GeoJSONSourceSpecification, LayerSpecification } from "maplibre-gl";
import { EVACUATION_CENTER_MARKER_COLOR, OBSTACLE_MARKER_COLOR, OWNER_MARKER_COLOR, RESCUER_MARKER_COLOR, ROUTE_COLOR } from "@/map-styles";

export function createOwnerPointGeoJSON({ userId, latitude, longitude }: { latitude: number; longitude: number; userId: number }) {
  return {
    sourceId: createGeoJsonSourceId([USER_POINT_SOURCE], userId),
    data: {
      type: "geojson",
      data: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    },
  };
}

export function createOwnerPointLayerGeoJSON({ sourceId }: { sourceId: string }) {
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

export function createRescuerPointGeoJSON({ rescuerId, latitude, longitude }: { latitude: number; longitude: number; rescuerId: number }) {
  return {
    sourceId: createGeoJsonSourceId([RESCUER_POINT_SOURCE], rescuerId),
    data: {
      type: "geojson",
      data: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    },
  };
}

export function createRescuerPointLayerGeoJSON({ sourceId }: { sourceId: string }) {
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