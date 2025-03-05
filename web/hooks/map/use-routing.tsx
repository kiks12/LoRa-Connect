"use client";

import { generalType } from "@/app/map/_components/RoutingControls";
import { useMapContext } from "@/contexts/MapContext";
import { GraphHopperAPIResult } from "@/types";
import { COLOR_MAP, createRouteLayerGeoJSON, createRouteSource } from "@/utils/map";
import maplibregl from "maplibre-gl";
import { useRef } from "react";

export const useRouting = () => {
	const { mapRef, clearSourcesAndLayers } = useMapContext();
	const fromMarker = useRef<maplibregl.Marker | null>(null);
	const toMarker = useRef<maplibregl.Marker | null>(null);

	function createRoute(from: generalType, to: generalType, data: GraphHopperAPIResult) {
		if (!mapRef.current) return;
		if (!data || typeof data === "undefined" || typeof data.paths === "undefined") return;
		if (fromMarker.current) fromMarker.current.remove();
		if (toMarker.current) toMarker.current.remove();
		clearSourcesAndLayers("ROUTE");
		const minimumTime = data.paths.reduce((acc, curr) => (acc.time < curr.time ? acc : curr));
		mapRef.current.addSource("ROUTE", createRouteSource(minimumTime.points.coordinates));
		mapRef.current.addLayer(createRouteLayerGeoJSON("ROUTE", "ROUTE"));
		fromMarker.current = new maplibregl.Marker({
			color: COLOR_MAP[from.type],
		})
			.setLngLat([from.longitude!, from.latitude!])
			.addTo(mapRef.current);
		toMarker.current = new maplibregl.Marker({
			color: COLOR_MAP[to.type],
		})
			.setLngLat([to.longitude!, to.latitude!])
			.addTo(mapRef.current);
	}

	function clearRoute() {
		clearSourcesAndLayers("ROUTE");
		if (fromMarker.current) fromMarker.current.remove();
		if (toMarker.current) toMarker.current.remove();
		fromMarker.current = null;
		toMarker.current = null;
	}

	return {
		fromMarker,
		toMarker,
		createRoute,
		clearRoute,
	};
};
