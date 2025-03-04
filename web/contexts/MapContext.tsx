"use client";

import maplibregl from "maplibre-gl";
import {
	createContext,
	Dispatch,
	MutableRefObject,
	ReactNode,
	RefObject,
	SetStateAction,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

const MapContext = createContext<{
	mapRef: MutableRefObject<maplibregl.Map | null>;
	mapContainerRef: RefObject<HTMLDivElement>;
	mapLoading: boolean;
	setMapLoading: Dispatch<SetStateAction<boolean>>;
	location: { latitude: number; longitude: number };
	setLocation: Dispatch<SetStateAction<{ latitude: number; longitude: number }>>;
	clearSourcesAndLayers: (includes: string) => void;
	removeSourceAndLayer: (sourceId: string) => void;
} | null>(null);

export const MapProvider = ({ children }: { children: ReactNode }) => {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
		latitude: 15.0794,
		longitude: 120.62,
	});
	const [mapLoading, setMapLoading] = useState(true);

	// GET CURRENT LOCATION OF CENTRAL NODE
	useEffect(() => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(({ coords }) => {
				const { latitude, longitude } = coords;
				setLocation({ latitude, longitude });
			});
		}
	}, [setLocation]);

	// RENDER MAP
	useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;
		const newMap = new maplibregl.Map({
			container: mapContainerRef.current,
			style: "http://localhost:3000/map/style-raw-open.json",
			center: [location.longitude, location.latitude],
			zoom: 13,
			attributionControl: false,
		});
		mapRef.current = newMap;

		newMap.on("error", (e) => console.error(e));

		return () => {
			clearSourcesAndLayers();
			newMap.remove();
			mapRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location]);

	// SET MARKER FOR CENTRAL NODE LOCATION
	useEffect(() => {
		if (mapRef.current) {
			const marker = new maplibregl.Marker().setLngLat([location.longitude, location.latitude]);
			marker.addTo(mapRef.current);
			setMapLoading(false);
		}
	}, [location, mapRef, setMapLoading]);
	/* --- MAP RENDERING --- */

	/* --- UTILITY FUNCTIONS --- */
	function clearSourcesAndLayers(includes: string = "") {
		if (!mapRef.current) return;
		const style = mapRef.current.getStyle();
		if (style === undefined) return;
		const layers = style.layers;
		if (layers) {
			for (const layer of layers) {
				if (layer.id.includes(includes) && mapRef.current.getLayer(layer.id)) {
					mapRef.current.removeLayer(layer.id);
				}
			}
		}
		const sources = style.sources;
		if (sources) {
			for (const sourceId in sources) {
				if (sourceId.includes(includes) && mapRef.current.getSource(sourceId)) {
					mapRef.current.removeSource(sourceId);
				}
			}
		}
	}

	function removeSourceAndLayer(sourceId: string) {
		if (!mapRef.current) return;
		mapRef.current.removeLayer(sourceId);
		mapRef.current.removeSource(sourceId);
	}
	/* --- UTILITY FUNCTIONS --- */

	const providerValue = useMemo(
		() => ({
			mapRef,
			mapContainerRef,
			mapLoading,
			setMapLoading,
			location,
			setLocation,
			clearSourcesAndLayers,
			removeSourceAndLayer,
		}),
		[]
	);

	return <MapContext.Provider value={providerValue}>{children}</MapContext.Provider>;
};

export const useMapContext = () => {
	const context = useContext(MapContext);
	if (context === null) throw new Error("Map Context is null");
	return context;
};
