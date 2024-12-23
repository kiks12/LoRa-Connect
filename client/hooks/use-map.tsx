"use client";

import {
	createContext,
	Dispatch,
	MutableRefObject,
	ReactNode,
	RefObject,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import maplibregl, { LayerSpecification, SourceSpecification } from "maplibre-gl";
import { Owners, Rescuers } from "@prisma/client";
import {
	createOwnerPointAreaGeoJSON,
	createOwnerPointAreaLayerGeoJSON,
	createOwnerPointGeoJSON,
	createOwnerPointLayerGeoJSON,
	createRescuerPointAreaGeoJSON,
	createRescuerPointAreaLayerGeoJSON,
	createRescuerPointGeoJSON,
	createRescuerPointLayerGeoJSON,
} from "@/utils/map";
import { LocationDataFromLoRa, OwnerWithBracelet, RescuerWithBracelet } from "@/types";
import { OWNER_SOURCE_BASE, RESCUER_SOURCE_BASE } from "@/utils/tags";
import { socket } from "@/socket/socket";
import { SEND_RECEIVED_LOCATION_TO_CLIENT, SEND_TRANSMIT_LOCATION_SIGNAL_TO_BRACELETS } from "@/tags";

const MapContext = createContext<{
	map: MutableRefObject<maplibregl.Map | null>;
	mapContainerRef: RefObject<HTMLDivElement>;
	addOwnerPoint: ({ latitude, longitude, ownerId }: OwnerWithBracelet, showLocation?: boolean) => void;
	addOwnerArea: ({ latitude, longitude, ownerId }: OwnerWithBracelet, showLocation?: boolean) => void;
	addRescuerPoint: ({ latitude, longitude, rescuerId }: Rescuers, showLocation?: boolean) => void;
	addRescuerArea: ({ latitude, longitude, rescuerId }: Rescuers, showLocation?: boolean) => void;
	clearSourcesAndLayers: (includes?: string) => void;
	rescuers: RescuerWithBracelet[];
	showRescuersLocations: boolean;
	setShowRescuersLocations: Dispatch<SetStateAction<boolean>>;
	owners: OwnerWithBracelet[];
	showOwnerLocations: boolean;
	setShowOwnerLocations: Dispatch<SetStateAction<boolean>>;
	sendTransmitLocationSignalToBracelets: () => void;
	monitorLocations: boolean;
	toggleMonitorLocations: () => void;
} | null>(null);

export const MapProvider = ({ children }: { children: ReactNode }) => {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const [{ longitude, latitude }, setLocation] = useState<{ latitude: number; longitude: number }>({
		latitude: 15.0794,
		longitude: 120.62,
	});
	const [rescuers, setRescuers] = useState<RescuerWithBracelet[]>([]);
	const [showRescuersLocations, setShowRescuersLocations] = useState(false);
	const [owners, setOwners] = useState<OwnerWithBracelet[]>([]);
	const [showOwnerLocations, setShowOwnerLocations] = useState(false);
	const [monitorLocations, setMonitorLocations] = useState(false);

	/* --- MAP RENDERING --- */
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

		newMap.on("error", (e) => console.error(e));

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
	/* --- MAP RENDERING --- */

	/* --- OWNER FUNCTIONS --- */
	const addOwnerArea = useCallback(({ latitude, longitude, ownerId }: Owners, showLocation: boolean = false) => {
		if (latitude === null && longitude === null) return;
		if (!mapRef.current) return;
		const { sourceId, data } = createOwnerPointAreaGeoJSON({ ownerId, latitude: latitude!, longitude: longitude! });

		if (mapRef.current.getSource(sourceId) && showLocation) return;
		if (mapRef.current.getSource(sourceId) && !showLocation) return removeSourceAndLayer(sourceId);

		mapRef.current.addSource(sourceId, data as SourceSpecification);
		mapRef.current.addLayer(createOwnerPointAreaLayerGeoJSON({ sourceId }) as LayerSpecification);
	}, []);

	const addOwnerPoint = useCallback(
		(owner: Owners, showLocation: boolean = false, monitorLocation: boolean = false) => {
			const { latitude, longitude, ownerId } = owner;
			if (latitude === null && longitude === null) return;
			if (!mapRef.current) return;
			const { sourceId, data } = createOwnerPointGeoJSON({ ownerId, latitude: latitude!, longitude: longitude! });

			if (mapRef.current.getSource(sourceId) && showLocation) return;
			if (mapRef.current.getSource(sourceId) && !showLocation && !monitorLocation) return removeSourceAndLayer(sourceId);
			if (mapRef.current.getSource(sourceId) && monitorLocation) removeSourceAndLayer(sourceId);

			mapRef.current.addSource(sourceId, data as SourceSpecification);
			mapRef.current.addLayer(createOwnerPointLayerGeoJSON({ sourceId }) as LayerSpecification);
			mapRef.current.on("click", sourceId, () => {
				console.log("click");
				addOwnerArea(owner);
			});
		},
		[addOwnerArea]
	);

	useEffect(() => {
		async function getOwners() {
			return (await fetch("/api/owners")).json();
		}

		getOwners().then(({ owners }) => setOwners(owners));
	}, []);

	useEffect(() => {
		if (!showOwnerLocations) {
			clearSourcesAndLayers(OWNER_SOURCE_BASE);
			return;
		}
		owners.forEach((owner) => addOwnerPoint(owner, true));
	}, [addOwnerPoint, showOwnerLocations]);
	/* --- OWNER FUNCTIONS --- */

	/* --- RESCUER FUNCTIONS --- */
	const addRescuerArea = useCallback(({ latitude, longitude, rescuerId }: Rescuers, showLocation: boolean = false) => {
		if (latitude === null && longitude === null) return;
		if (!mapRef.current) return;
		const { sourceId, data } = createRescuerPointAreaGeoJSON({ rescuerId, latitude: latitude!, longitude: longitude! });

		if (mapRef.current.getSource(sourceId) && showLocation) return;
		if (mapRef.current.getSource(sourceId) && !showLocation) return removeSourceAndLayer(sourceId);

		mapRef.current.addSource(sourceId, data as SourceSpecification);
		mapRef.current.addLayer(createRescuerPointAreaLayerGeoJSON({ sourceId }) as LayerSpecification);
	}, []);

	const addRescuerPoint = useCallback(
		(rescuer: Rescuers, showLocation: boolean = false, monitorLocation: boolean = false) => {
			const { latitude, longitude, rescuerId } = rescuer;
			if (latitude === null && longitude === null) return;
			if (!mapRef.current) return;
			const { sourceId, data } = createRescuerPointGeoJSON({ rescuerId, latitude: latitude!, longitude: longitude! });

			if (mapRef.current.getSource(sourceId) && showLocation) return;
			if (mapRef.current.getSource(sourceId) && !showLocation && !monitorLocation) return removeSourceAndLayer(sourceId);
			if (mapRef.current.getSource(sourceId) && monitorLocation) removeSourceAndLayer(sourceId);

			mapRef.current.addSource(sourceId, data as SourceSpecification);
			mapRef.current.addLayer(createRescuerPointLayerGeoJSON({ sourceId }) as LayerSpecification);
			mapRef.current.on("click", sourceId, () => {
				addRescuerArea(rescuer);
			});
		},
		[addRescuerArea]
	);

	useEffect(() => {
		async function getRescuers() {
			return (await fetch("/api/rescuers")).json();
		}

		getRescuers().then(({ rescuers }) => setRescuers(rescuers));
	}, []);

	useEffect(() => {
		if (!showRescuersLocations) {
			clearSourcesAndLayers(RESCUER_SOURCE_BASE);
			return;
		}
		rescuers.forEach((rescuer) => addRescuerPoint(rescuer, true));
	}, [addRescuerPoint, showRescuersLocations]);
	/* --- RESCUER FUNCTIONS --- */

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

	/* --- MONITOR LOCATION FUNCTIONS --- */
	async function saveNewLocationToDatabase({
		braceletId,
		latitude,
		longitude,
		rescuer,
	}: {
		braceletId: string;
		latitude: number;
		longitude: number;
		rescuer: boolean;
	}) {
		await fetch("/api/bracelets/update-location", {
			method: "PATCH",
			body: JSON.stringify({ braceletId, latitude, longitude }),
		});
		if (rescuer) {
			setRescuers(
				(prev) => (prev = rescuers.map((rescuer) => (rescuer.bracelet?.braceletId === braceletId ? { ...rescuer, latitude, longitude } : rescuer)))
			);
		} else {
			setOwners((prev) => (prev = owners.map((owner) => (owner.bracelet?.braceletId === braceletId ? { ...owner, latitude, longitude } : owner))));
		}
	}

	function sendTransmitLocationSignalToBracelets() {
		// Send the signal to monitor locations
		socket.emit(SEND_TRANSMIT_LOCATION_SIGNAL_TO_BRACELETS, SEND_TRANSMIT_LOCATION_SIGNAL_TO_BRACELETS);

		// Receive the signal from bracelets
		socket.on(SEND_RECEIVED_LOCATION_TO_CLIENT, async (data: LocationDataFromLoRa) => {
			const { rescuer, braceletId, latitude, longitude } = data;
			const correctOwner = rescuer
				? rescuers.filter((rescuer) => rescuer.bracelet?.braceletId === braceletId)
				: owners.filter((owner) => owner.bracelet?.braceletId === braceletId);
			if (correctOwner.length === 0) return;
			if (rescuer) {
				addRescuerPoint({ ...(correctOwner[0] as RescuerWithBracelet), latitude, longitude }, false, true);
			} else {
				addOwnerPoint({ ...(correctOwner[0] as OwnerWithBracelet), latitude, longitude }, false, true);
			}
			await saveNewLocationToDatabase({ braceletId, latitude, longitude, rescuer });
		});
	}

	// Location Monitoring Code block - as long as monitorLocation is true this triggers
	useEffect(() => {
		if (!monitorLocations) {
			socket.off(SEND_RECEIVED_LOCATION_TO_CLIENT);
			return;
		}
		sendTransmitLocationSignalToBracelets();
		return () => {
			socket.off(SEND_RECEIVED_LOCATION_TO_CLIENT);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [monitorLocations]);

	function toggleMonitorLocations() {
		setMonitorLocations(!monitorLocations);
	}
	/* --- MONITOR LOCATION FUNCTIONS --- */

	return (
		<MapContext.Provider
			value={{
				map: mapRef,
				mapContainerRef,
				clearSourcesAndLayers,
				addOwnerPoint,
				addOwnerArea,
				addRescuerPoint,
				addRescuerArea,
				rescuers,
				showRescuersLocations,
				setShowRescuersLocations,
				owners,
				showOwnerLocations,
				setShowOwnerLocations,
				sendTransmitLocationSignalToBracelets,
				monitorLocations,
				toggleMonitorLocations,
			}}
		>
			{children}
		</MapContext.Provider>
	);
};

export const useMapContext = () => {
	const context = useContext(MapContext);
	if (context === null) throw new Error("Use Map Context is null, must be used within MapProvider");
	return context;
};
