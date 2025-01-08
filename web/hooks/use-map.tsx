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
import { Obstacle } from "@prisma/client";
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
import {
	EvacuationCenterWithStatusIdentifier,
	LocationDataFromLoRa,
	ObstacleWithStatusIdentifier,
	OwnerWithBracelet,
	OwnerWithStatusIdentifier,
	RescuerWithBracelet,
	RescuerWithStatusIdentifier,
} from "@/types";
import { OWNER_SOURCE_BASE, RESCUER_SOURCE_BASE } from "@/utils/tags";
import { socket } from "@/socket/socket";
import { SEND_RECEIVED_LOCATION_TO_CLIENT, SEND_TRANSMIT_LOCATION_SIGNAL_TO_BRACELETS } from "@/tags";
import { EVACUATION_CENTER_MARKER_COLOR, OBSTACLE_MARKER_COLOR } from "@/map-styles";

const MapContext = createContext<{
	// MAP
	map: MutableRefObject<maplibregl.Map | null>;
	mapContainerRef: RefObject<HTMLDivElement>;
	mapLoading: boolean;

	// ADMIN
	sendTransmitLocationSignalToBracelets: () => void;
	toggleMonitorLocations: () => void;
	monitorLocations: boolean;

	// UTILITIES
	clearSourcesAndLayers: (includes?: string) => void;

	// RESCUERS
	rescuers: RescuerWithStatusIdentifier[];
	showRescuersLocations: boolean;
	addRescuerPoint: ({ latitude, longitude, rescuerId }: RescuerWithStatusIdentifier, showLocation?: boolean) => void;
	addRescuerArea: ({ latitude, longitude, rescuerId }: RescuerWithStatusIdentifier, showLocation?: boolean) => void;
	setShowRescuersLocations: Dispatch<SetStateAction<boolean>>;
	clearRescuerShowStatuses: () => void;
	filterSearchRescuer: (value: string) => void;
	refreshRescuers: () => void;
	rescuersLoading: boolean;

	// OWNERS
	owners: OwnerWithStatusIdentifier[];
	showOwnerLocations: boolean;
	addOwnerPoint: ({ latitude, longitude, ownerId }: OwnerWithStatusIdentifier, showLocation?: boolean) => void;
	addOwnerArea: ({ latitude, longitude, ownerId }: OwnerWithStatusIdentifier, showLocation?: boolean) => void;
	setShowOwnerLocations: Dispatch<SetStateAction<boolean>>;
	clearOwnerShowStatuses: () => void;
	filterSearchOwner: (value: string) => void;
	refreshOwners: () => void;
	ownersLoading: boolean;

	// EVACUATION CENTERS
	evacuationCenters: EvacuationCenterWithStatusIdentifier[];
	showEvacuationCenters: boolean;
	toggleShowEvacuationCenters: () => void;
	evacuationCentersLoading: boolean;
	refreshEvacuationCenters: () => void;

	// OBSTACLES
	obstacles: ObstacleWithStatusIdentifier[];
	showObstacles: boolean;
	toggleShowObstacles: () => void;
	addObstacle: (obstacle: Obstacle) => void;
	updateObstacle: (obstacle: Obstacle) => void;
	removeObstacle: (Obstacle: Obstacle) => void;
	addingObstacle: boolean;
	toggleAddingObstacle: () => void;
	currentObstacleMarkerLngLat: { lng: number; lat: number } | null;
	showObstacleMarkerOnMap: (obstacle: Obstacle) => void;
	removeObstacleMarkerFromMap: (obstacleId: number) => void;
	toggleObstacleOnMap: (obstacle: Obstacle) => void;
	obstaclesLoading: boolean;
	refreshObstacles: () => void;
} | null>(null);

export const MapProvider = ({ children }: { children: ReactNode }) => {
	/* --- MAP VARIABLES --- */
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const [{ longitude, latitude }, setLocation] = useState<{ latitude: number; longitude: number }>({
		latitude: 15.0794,
		longitude: 120.62,
	});
	const [mapLoading, setMapLoading] = useState(true);
	/* --- MAP VARIABLES --- */

	/* --- ADMIN VARIABLES --- */
	const [monitorLocations, setMonitorLocations] = useState(false);
	/* --- ADMIN VARIABLES --- */

	/* --- RESCUERS VARIABLES --- */
	const [rescuers, setRescuers] = useState<RescuerWithStatusIdentifier[]>([]);
	const [rescuersLoading, setRescuersLoading] = useState(false);
	const [backupRescuers, setBackupRescuers] = useState<RescuerWithStatusIdentifier[]>([]);
	const [showRescuersLocations, setShowRescuersLocations] = useState(false);
	/* --- RESCUERS VARIABLES --- */

	/* --- OWNERS VARIABLES --- */
	const [owners, setOwners] = useState<OwnerWithStatusIdentifier[]>([]);
	const [ownersLoading, setOwnersLoading] = useState(false);
	const [backupOwners, setBackupOwners] = useState<OwnerWithStatusIdentifier[]>([]);
	const [showOwnerLocations, setShowOwnerLocations] = useState(false);
	/* --- OWNERS VARIABLES --- */

	/* --- EVACUATION CENTERS VARIABLES --- */
	const [evacuationCenters, setEvacuationCenters] = useState<EvacuationCenterWithStatusIdentifier[]>([]);
	const [evacuationCentersLoading, setEvacuationCentersLoading] = useState(true);
	const [evacuationCentersMarkers, setEvacuationCentersMarkers] = useState<{ evacuationCenterId: number; marker: maplibregl.Marker }[]>([]);
	const [showEvacuationCenters, setShowEvacuationCenters] = useState(false);
	/* --- EVACUATION CENTERS VARIABLES --- */

	/* --- OBSTACLES VARIABLES --- */
	const [obstacles, setObstacles] = useState<ObstacleWithStatusIdentifier[]>([]);
	const [obstaclesLoading, setObstaclesLoading] = useState(true);
	const [obstaclesMarkers, setObstaclesMarkers] = useState<
		{
			obstacleId: number;
			marker: maplibregl.Marker;
		}[]
	>([]);
	const [showObstacles, setShowObstacles] = useState(false);
	const [addingObstacle, setAddingObstacle] = useState(false);
	const currentObstacleMarker = useRef<maplibregl.Marker | null>(null);
	const [currentObstacleMarkerLngLat, setCurrentObstacleMarkerLngLat] = useState<{ lng: number; lat: number } | null>(null);
	/* --- OBSTACLES VARIABLES --- */

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
			setMapLoading(false);
		}
	}, [latitude, longitude, mapRef, setMapLoading]);
	/* --- MAP RENDERING --- */

	/* --- EVAUCATION CENTERS FUNCTIONS --- */
	async function fetchEvacuationCentersAPI() {
		setEvacuationCentersLoading(true);
		const { evacuationCenters } = await (await fetch("/api/evacuation-centers")).json();
		setEvacuationCenters(evacuationCenters);
		setEvacuationCentersLoading(false);
	}

	function refreshEvacuationCenters() {
		fetchEvacuationCentersAPI();
	}

	// API FETCHING OF EVACUATION CENTER
	useEffect(() => {
		fetchEvacuationCentersAPI();

		return () => setEvacuationCenters([]);
	}, []);

	useEffect(() => {
		if (showEvacuationCenters && mapRef.current) {
			evacuationCenters.forEach((evacuationCenter) => showEvacuationCenterMarkerOnMap(evacuationCenter));
		} else {
			evacuationCentersMarkers.forEach((obj) => removeEvacuationCenterMarkerFromMap(obj.evacuationCenterId));
			setEvacuationCentersMarkers([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showEvacuationCenters]);

	function showEvacuationCenterMarkerOnMap(evacuationCenter: EvacuationCenterWithStatusIdentifier) {
		const marker = new maplibregl.Marker({
			color: EVACUATION_CENTER_MARKER_COLOR,
		}).setLngLat([evacuationCenter.longitude, evacuationCenter.latitude]);
		marker.addTo(mapRef.current!);
		setEvacuationCentersMarkers((prev) => [...prev, { marker, evacuationCenterId: evacuationCenter.evacuationId }]);
		toggleEvacuationCenterStatus(evacuationCenter.evacuationId);
	}

	function removeEvacuationCenterMarkerFromMap(evacuationCenterId: number) {
		const evacuationCenterMarker = evacuationCentersMarkers.filter((evacuationCenter) => evacuationCenter.evacuationCenterId === evacuationCenterId);
		const evacuationCenter = evacuationCenters.filter((ev) => ev.evacuationId === evacuationCenterId);
		setEvacuationCentersMarkers((prev) => (prev = prev.filter((obj) => obj.evacuationCenterId === evacuationCenterId)));
		toggleEvacuationCenterStatus(evacuationCenter[0].evacuationId);
		evacuationCenterMarker[0].marker.remove();
	}

	function toggleEvacuationCenterStatus(evacuationCenterId: number) {
		setEvacuationCenters(
			(prev) =>
				(prev = prev.map((evacuationCenter) =>
					evacuationCenter.evacuationId === evacuationCenterId ? { ...evacuationCenter, showing: !evacuationCenter.showing } : evacuationCenter
				))
		);
	}

	function toggleShowEvacuationCenters() {
		setShowEvacuationCenters(!showEvacuationCenters);
	}
	/* --- EVAUCATION CENTERS FUNCTIONS --- */

	/* --- OWNER FUNCTIONS --- */
	const addOwnerArea = useCallback(({ latitude, longitude, ownerId }: OwnerWithStatusIdentifier, showLocation: boolean = false) => {
		if (latitude === null && longitude === null) return;
		if (!mapRef.current) return;
		const { sourceId, data } = createOwnerPointAreaGeoJSON({ ownerId, latitude: latitude!, longitude: longitude! });

		if (mapRef.current.getSource(sourceId) && showLocation) return;
		if (mapRef.current.getSource(sourceId) && !showLocation) return removeSourceAndLayer(sourceId);

		mapRef.current.addSource(sourceId, data as SourceSpecification);
		mapRef.current.addLayer(createOwnerPointAreaLayerGeoJSON({ sourceId }) as LayerSpecification);
	}, []);

	const addOwnerPoint = useCallback(
		({ latitude, longitude, ownerId }: OwnerWithStatusIdentifier, showLocation: boolean = false, monitorLocation: boolean = false) => {
			if (latitude === null && longitude === null) return;
			if (!mapRef.current) return;
			const { sourceId, data } = createOwnerPointGeoJSON({ ownerId, latitude: latitude!, longitude: longitude! });
			const mapRefSource = mapRef.current.getSource(sourceId);

			if (mapRefSource && showLocation) return;
			if (mapRefSource && !showLocation && !monitorLocation) return removeOwnerPoint(sourceId, ownerId);
			if (mapRefSource && monitorLocation) removeOwnerPoint(sourceId, ownerId);

			mapRef.current.addSource(sourceId, data as SourceSpecification);
			mapRef.current.addLayer(createOwnerPointLayerGeoJSON({ sourceId }) as LayerSpecification);
			toggleOwnerShowStatus(ownerId);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	function removeOwnerPoint(sourceId: string, ownerId: number) {
		removeSourceAndLayer(sourceId);
		toggleOwnerShowStatus(ownerId);
	}

	function toggleOwnerShowStatus(ownerId: number) {
		setOwners((prev) => (prev = prev.map((owner) => (owner.ownerId === ownerId ? { ...owner, showing: !owner.showing } : owner))));
	}

	function clearOwnerShowStatuses() {
		setOwners((prev) => (prev = prev.map((owner) => ({ ...owner, showing: false }))));
	}

	function filterSearchOwner(value: string) {
		setOwners(backupOwners.filter((owner) => owner.name.toLowerCase().includes(value.toLowerCase())));
	}

	async function fetchOwnersAPI() {
		setOwnersLoading(true);
		const { owners }: { owners: OwnerWithBracelet[] } = await (await fetch("/api/owners")).json();
		const mappedOwners = owners.map((owner) => ({ ...owner, showing: false }));
		setOwners(mappedOwners);
		setBackupOwners(mappedOwners);
		setOwnersLoading(false);
	}

	function refreshOwners() {
		fetchOwnersAPI();
	}

	// API FETCHING OF OWNERS
	useEffect(() => {
		fetchOwnersAPI();

		return () => {
			setOwners([]);
			setBackupOwners([]);
		};
	}, []);

	useEffect(() => {
		if (!showOwnerLocations) {
			clearSourcesAndLayers(OWNER_SOURCE_BASE);
			clearOwnerShowStatuses();
			return;
		}
		owners.forEach((owner) => addOwnerPoint(owner, true));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addOwnerPoint, showOwnerLocations]);
	/* --- OWNER FUNCTIONS --- */

	/* --- RESCUER FUNCTIONS --- */
	const addRescuerArea = useCallback(({ latitude, longitude, rescuerId }: RescuerWithStatusIdentifier, showLocation: boolean = false) => {
		if (latitude === null && longitude === null) return;
		if (!mapRef.current) return;
		const { sourceId, data } = createRescuerPointAreaGeoJSON({ rescuerId, latitude: latitude!, longitude: longitude! });

		if (mapRef.current.getSource(sourceId) && showLocation) return;
		if (mapRef.current.getSource(sourceId) && !showLocation) return removeSourceAndLayer(sourceId);

		mapRef.current.addSource(sourceId, data as SourceSpecification);
		mapRef.current.addLayer(createRescuerPointAreaLayerGeoJSON({ sourceId }) as LayerSpecification);
	}, []);

	const addRescuerPoint = useCallback(
		({ latitude, longitude, rescuerId }: RescuerWithStatusIdentifier, showLocation: boolean = false, monitorLocation: boolean = false) => {
			if (latitude === null && longitude === null) return;
			if (!mapRef.current) return;
			const { sourceId, data } = createRescuerPointGeoJSON({ rescuerId, latitude: latitude!, longitude: longitude! });

			if (mapRef.current.getSource(sourceId) && showLocation) return;
			if (mapRef.current.getSource(sourceId) && !showLocation && !monitorLocation) return removeRescuerPoint(sourceId, rescuerId);
			if (mapRef.current.getSource(sourceId) && monitorLocation) removeRescuerPoint(sourceId, rescuerId);

			mapRef.current.addSource(sourceId, data as SourceSpecification);
			mapRef.current.addLayer(createRescuerPointLayerGeoJSON({ sourceId }) as LayerSpecification);
			toggleRescuerShowStatus(rescuerId);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	function removeRescuerPoint(sourceId: string, rescuerId: number) {
		removeSourceAndLayer(sourceId);
		toggleRescuerShowStatus(rescuerId);
	}

	function clearRescuerShowStatuses() {
		setRescuers((prev) => (prev = prev.map((rescuer) => ({ ...rescuer, showing: false }))));
	}

	function toggleRescuerShowStatus(rescuerId: number) {
		setRescuers((prev) => (prev = prev.map((rescuer) => (rescuer.rescuerId === rescuerId ? { ...rescuer, showing: !rescuer.showing } : rescuer))));
	}

	function filterSearchRescuer(value: string) {
		setRescuers(backupRescuers.filter((rescuer) => rescuer.name.toLowerCase().includes(value.toLowerCase())));
	}

	async function fetchRescuersAPI() {
		setRescuersLoading(true);
		const { rescuers }: { rescuers: RescuerWithBracelet[] } = await (await fetch("/api/rescuers")).json();
		const mappedRescuers = rescuers.map((rescuer) => ({ ...rescuer, showing: false }));
		setRescuers(mappedRescuers);
		setBackupRescuers(mappedRescuers);
		setRescuersLoading(false);
	}

	function refreshRescuers() {
		fetchRescuersAPI();
	}

	// API FETCHING OF RESCUERS
	useEffect(() => {
		fetchRescuersAPI();

		return () => {
			setRescuers([]);
			setBackupRescuers([]);
		};
	}, []);

	useEffect(() => {
		if (!showRescuersLocations) {
			clearSourcesAndLayers(RESCUER_SOURCE_BASE);
			clearRescuerShowStatuses();
			return;
		}
		rescuers.forEach((rescuer) => addRescuerPoint(rescuer, true));
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				(prev) => (prev = rescuers.map((rescuer) => (rescuer.bracelet?.braceletId === braceletId ? { ...rescuer, latitude, longitude } : rescuer)))
			);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
				addRescuerPoint({ ...(correctOwner[0] as RescuerWithStatusIdentifier), latitude, longitude }, false, true);
			} else {
				addOwnerPoint({ ...(correctOwner[0] as OwnerWithStatusIdentifier), latitude, longitude }, false, true);
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

	/* --- OBSTACLES FUNCTIONS --- */
	const onAddObtacleMapClick = useCallback(({ lngLat }: maplibregl.MapMouseEvent) => {
		const { lat, lng } = lngLat;
		if (currentObstacleMarker.current) currentObstacleMarker.current.remove();
		currentObstacleMarker.current = new maplibregl.Marker({
			color: OBSTACLE_MARKER_COLOR,
		}).setLngLat([lng, lat]);
		currentObstacleMarker.current.addTo(mapRef.current!);
		setCurrentObstacleMarkerLngLat({ lat, lng });
	}, []);

	useEffect(() => {
		if (mapRef.current) {
			if (addingObstacle) {
				mapRef.current.on("click", onAddObtacleMapClick);
			} else {
				mapRef.current.off("click", onAddObtacleMapClick);
				currentObstacleMarker.current?.remove();
				setCurrentObstacleMarkerLngLat(null);
			}
		}
	}, [addingObstacle, onAddObtacleMapClick]);

	async function fetchObstaclesAPI() {
		setObstaclesLoading(true);
		const { obstacles }: { obstacles: Obstacle[] } = await (await fetch("/api/obstacles")).json();
		const mappedObstacles = obstacles.map((obstacle) => ({ ...obstacle, showing: false }));
		setObstacles(mappedObstacles);
		setObstaclesLoading(false);
	}

	function refreshObstacles() {
		fetchObstaclesAPI();
	}

	// API FETCHING OF OBSTACLES
	useEffect(() => {
		fetchObstaclesAPI();

		return () => setObstacles([]);
	}, []);

	useEffect(() => {
		if (showObstacles && mapRef.current) {
			obstacles.forEach((obstacle) => showObstacleMarkerOnMap(obstacle));
		} else {
			obstaclesMarkers.forEach(async (obj) => await removeObstacleMarkerFromMap(obj.obstacleId));
			setObstaclesMarkers([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showObstacles]);

	function toggleObstacleOnMap(obstacle: Obstacle) {
		if (obstaclesMarkers.filter((obs) => obs.obstacleId === obstacle.obstacleId).length > 0) removeObstacleMarkerFromMap(obstacle.obstacleId);
		else showObstacleMarkerOnMap(obstacle);
	}

	function toggleObstacleShowStatus(obstacleId: number) {
		setObstacles((prev) => (prev = prev.map((obs) => (obstacleId === obs.obstacleId ? { ...obs, showing: !obs.showing } : obs))));
	}

	function showObstacleMarkerOnMap(obstacle: Obstacle) {
		const popup = new maplibregl.Popup().setText(obstacle.name).addTo(mapRef.current!);
		const marker = new maplibregl.Marker({
			color: OBSTACLE_MARKER_COLOR,
		})
			.setLngLat([obstacle.longitude, obstacle.latitude])
			.setPopup(popup);
		const currentMarker = obstaclesMarkers.filter((obs) => obs.obstacleId === obstacle.obstacleId);
		if (currentMarker.length > 0 && showObstacles) return;
		marker.addTo(mapRef.current!);
		setObstaclesMarkers((prev) => [...prev, { obstacleId: obstacle.obstacleId, marker: marker }]);
		toggleObstacleShowStatus(obstacle.obstacleId);
	}

	async function removeObstacleMarkerFromMap(obstacleId: number) {
		const obstacleMarkerObject = obstaclesMarkers.filter((obs) => obs.obstacleId === obstacleId);
		setObstaclesMarkers(obstaclesMarkers.filter((m) => m.obstacleId !== obstacleId));
		toggleObstacleShowStatus(obstacleId);
		obstacleMarkerObject[0].marker.remove();
	}

	function toggleShowObstacles() {
		setShowObstacles(!showObstacles);
	}

	function toggleAddingObstacle() {
		setAddingObstacle(!addingObstacle);
	}

	function addObstacle(newObstacle: Obstacle) {
		setObstacles((prev) => [...prev, { ...newObstacle, showing: true }]);
	}

	function updateObstacle(updatedObstacle: Obstacle) {
		setObstacles(obstacles.map((obs) => (obs.obstacleId === updatedObstacle.obstacleId ? { ...updatedObstacle, showing: true } : obs)));
		removeObstacleMarkerFromMap(updatedObstacle.obstacleId);
		setObstaclesMarkers(obstaclesMarkers.filter((obj) => obj.obstacleId !== updatedObstacle.obstacleId));
		showObstacleMarkerOnMap(updatedObstacle);
	}

	function removeObstacle(obstacle: Obstacle) {
		setObstacles(obstacles.filter((o) => o.obstacleId !== obstacle.obstacleId));
	}
	/* --- OBSTACLES FUNCTIONS --- */

	return (
		<MapContext.Provider
			value={{
				map: mapRef,
				mapContainerRef,
				mapLoading,

				clearSourcesAndLayers,
				monitorLocations,
				toggleMonitorLocations,
				sendTransmitLocationSignalToBracelets,

				owners,
				addOwnerPoint,
				addOwnerArea,
				showOwnerLocations,
				setShowOwnerLocations,
				clearOwnerShowStatuses,
				filterSearchOwner,
				refreshOwners,
				ownersLoading,

				rescuers,
				addRescuerPoint,
				addRescuerArea,
				showRescuersLocations,
				setShowRescuersLocations,
				clearRescuerShowStatuses,
				filterSearchRescuer,
				refreshRescuers,
				rescuersLoading,

				evacuationCenters,
				showEvacuationCenters,
				toggleShowEvacuationCenters,
				evacuationCentersLoading,
				refreshEvacuationCenters,

				obstacles,
				showObstacles,
				toggleShowObstacles,
				addObstacle,
				removeObstacle,
				addingObstacle,
				toggleAddingObstacle,
				currentObstacleMarkerLngLat,
				showObstacleMarkerOnMap,
				removeObstacleMarkerFromMap,
				toggleObstacleOnMap,
				updateObstacle,
				obstaclesLoading,
				refreshObstacles,
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
