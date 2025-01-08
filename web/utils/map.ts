
import * as turf from "@turf/turf"
import { createGeoJsonSourceId, OWNER_AREA_SOURCE, OWNER_POINT_SOURCE, RESCUER_AREA_SOURCE, RESCUER_POINT_SOURCE } from "./tags";

export function createOwnerPointGeoJSON({ ownerId, latitude, longitude }: { latitude: number; longitude: number; ownerId: number }) {
  return {
    sourceId: createGeoJsonSourceId([OWNER_POINT_SOURCE], ownerId),
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
      "circle-color": "#007cbf",
      "circle-opacity": 0.5,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#007cbf",
    },
  };
}

export function createOwnerPointAreaGeoJSON({ ownerId, latitude, longitude }: { latitude: number; longitude: number; ownerId: number }) {
  const circle = turf.circle([longitude, latitude], 10, {
    steps: 64, 
    units: "kilometers"
  })

  return {
    sourceId: createGeoJsonSourceId([OWNER_AREA_SOURCE], ownerId),
    data: {
      type: "geojson",
      data: circle
    },
  };
}

export function createOwnerPointAreaLayerGeoJSON({ sourceId }: { sourceId: string }) {
  return {
    id: sourceId,
    source: sourceId,
    type: "fill",
    paint: {
      "fill-color": "#007cbf",
      "fill-opacity": 0.2,
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
      "circle-color": "#bf8900",
      "circle-opacity": 0.5,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#bf8900",
    },
  };
}

export function createRescuerPointAreaGeoJSON({ rescuerId, latitude, longitude }: { latitude: number; longitude: number; rescuerId: number }) {
  const circle = turf.circle([longitude, latitude], 10, {
    steps: 64, 
    units: "kilometers"
  })

  return {
    sourceId: createGeoJsonSourceId([RESCUER_AREA_SOURCE], rescuerId),
    data: {
      type: "geojson",
      data: circle
    },
  };
}

export function createRescuerPointAreaLayerGeoJSON({ sourceId }: { sourceId: string }) {
  return {
    id: sourceId,
    source: sourceId,
    type: "fill",
    paint: {
      "fill-color": "#bf8900",
      "fill-opacity": 0.2,
    },
  };
}