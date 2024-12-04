"use client";

import { createContext, MutableRefObject, ReactNode, RefObject, useContext, useEffect, useRef, useState } from "react";
import maplibregl, { LayerSpecification, SourceSpecification } from "maplibre-gl";
import { Owners } from "@prisma/client";

const MapContext = createContext<{
	map: MutableRefObject<maplibregl.Map | null>;
	mapContainerRef: RefObject<HTMLDivElement>;
	addOwnerPoint: ({ latitude, longitude, ownerId }: Owners) => void;
	interactive: boolean;
	clearSourcesAndLayers: () => void;
	clearOwnersSourcesAndLayers: () => void;
} | null>(null);

export const MapProvider = ({ children }: { children: ReactNode }) => {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const [interactive, setInteractive] = useState(true);
	const [{ longitude, latitude }, setLocation] = useState<{ latitude: number; longitude: number }>({
		latitude: 15.0794,
		longitude: 120.62,
	});

	// GET CURRENT LOCATION OF CENTRAL NODE
	useEffect(() => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(({ coords }) => {
				const { latitude, longitude } = coords;
				setLocation({ latitude, longitude });
			});
		}
	}, []);

	// RENDER MAP
	useEffect(() => {
		if (!mapContainerRef.current) return;
		const newMap = new maplibregl.Map({
			container: mapContainerRef.current,
			style: "http://localhost:3000/map/style-raw-open.json",
			center: [longitude, latitude],
			zoom: 13,
			hash: true,
			attributionControl: false,
		});
		mapRef.current = newMap;
		console.log("Map initialized: ", mapRef.current);

		newMap.on("error", (e) => console.error(e));

		console.log("Map interactive: ", interactive);
		return () => {
			clearSourcesAndLayers();
			newMap.remove();
			mapRef.current = null;
		};
	}, [latitude, longitude]);

	// SET MARKER FOR CENTRAL NODE LOCATION
	useEffect(() => {
		if (mapRef.current) {
			const marker = new maplibregl.Marker().setLngLat([longitude, latitude]);
			marker.addTo(mapRef.current);
		}
	}, [latitude, longitude, mapRef]);

	function clearSourcesAndLayers() {
		if (!mapRef.current) return;
		const style = mapRef.current.getStyle();
		if (style === undefined) return;
		const layers = style.layers;
		if (layers) {
			for (const layer of layers) {
				if (mapRef.current.getLayer(layer.id)) {
					mapRef.current.removeLayer(layer.id);
				}
			}
		}
		const sources = style.sources;
		if (sources) {
			for (const sourceId in sources) {
				if (mapRef.current.getSource(sourceId)) {
					mapRef.current.removeSource(sourceId);
				}
			}
		}
	}

	function clearOwnersSourcesAndLayers() {
		if (!mapRef.current) return;
		const style = mapRef.current.getStyle();
		if (style === undefined) return;
		const layers = style.layers;
		if (layers) {
			for (const layer of layers) {
				if (layer.id.includes("owner") && mapRef.current.getLayer(layer.id)) {
					mapRef.current.removeLayer(layer.id);
				}
			}
		}
		const sources = style.sources;
		if (sources) {
			for (const sourceId in sources) {
				if (sourceId.includes("owner") && mapRef.current.getSource(sourceId)) {
					mapRef.current.removeSource(sourceId);
				}
			}
		}
	}

	function createOwnerPointGeoJSON({ ownerId, latitude, longitude }: { latitude: number; longitude: number; ownerId: number }) {
		return {
			sourceId: `owner-point-${ownerId}`,
			data: {
				type: "geojson",
				data: {
					type: "Point",
					coordinates: [longitude, latitude],
				},
			},
		};
	}

	function createOwnerPointLayerGeoJSON({ sourceId }: { sourceId: string }) {
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

	function addOwnerPoint({ latitude, longitude, ownerId }: Owners) {
		console.log(mapRef.current);
		if (latitude === null && longitude === null) return;
		if (!mapRef.current) return;
		if (!interactive) return;
		const { sourceId, data } = createOwnerPointGeoJSON({ ownerId, latitude: latitude!, longitude: longitude! });

		mapRef.current.addSource(sourceId, data as SourceSpecification);
		mapRef.current.addLayer(createOwnerPointLayerGeoJSON({ sourceId }) as LayerSpecification);
		mapRef.current.on("click", sourceId, () => {
			console.log("Clicked");
		});
	}

	return (
		<MapContext.Provider value={{ map: mapRef, mapContainerRef, addOwnerPoint, interactive, clearSourcesAndLayers, clearOwnersSourcesAndLayers }}>
			{children}
		</MapContext.Provider>
	);
};

export const useMapContext = () => {
	const context = useContext(MapContext);
	if (context === null) throw new Error("Use Map Context is null, must be used within MapProvider");
	return context;
};
