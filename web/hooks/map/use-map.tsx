"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Obstacle } from "@prisma/client";
import { COLOR_MAP, createRouteLayerGeoJSON, createRouteSource } from "@/utils/map";
import { GraphHopperAPIResult, ObstacleWithStatusIdentifier, LocationDataFromPy } from "@/types";
import { socket } from "@/socket/socket";
import { OBSTACLE_MARKER_COLOR } from "@/map-styles";
import { generalType } from "@/app/map/_components/RoutingControls";
import { LOCATION_FROM_RESCUER, LOCATION_FROM_USER, START_LOCATION_TRANSMISSION_TO_TRU } from "@/lora/lora-tags";
import { useAppContext } from "@/contexts/AppContext";

// const MapContext = createContext<{
// 	// ADMIN
// 	sendTransmitLocationSignalToBracelets: () => void;
// 	toggleMonitorLocations: () => void;
// 	monitorLocations: boolean;

// 	// UTILITIES
// 	clearSourcesAndLayers: (includes?: string) => void;
// 	removeSourceAndLayer: (sourceId: string) => void;

// 	// OBSTACLES
// 	obstacles: ObstacleWithStatusIdentifier[];
// 	showObstacles: boolean;
// 	toggleShowObstacles: () => void;
// 	addObstacle: (obstacle: Obstacle) => void;
// 	updateObstacle: (obstacle: Obstacle) => void;
// 	removeObstacle: (Obstacle: Obstacle) => void;
// 	addingObstacle: boolean;
// 	toggleAddingObstacle: () => void;
// 	currentObstacleMarkerLngLat: { lng: number; lat: number } | null;
// 	showObstacleMarkerOnMap: (obstacle: Obstacle) => void;
// 	removeObstacleMarkerFromMap: (obstacleId: number) => void;
// 	toggleObstacleOnMap: (obstacle: Obstacle) => void;
// 	obstaclesLoading: boolean;
// 	refreshObstacles: () => void;

// 	// ROUTING
// 	createRoute: (from: generalType, to: generalType, data: GraphHopperAPIResult) => void;
// 	clearRoute: () => void;
// } | null>(null);

export const useMap = () => {
	/* --- MAP VARIABLES --- */
	const { mapRef, mapContainerRef, users, setMapLoading, setUsers, rescuers, setRescuers, setLocation, location } = useAppContext();

	/* --- ADMIN VARIABLES --- */
	const [monitorLocations, setMonitorLocations] = useState(false);
	/* --- ADMIN VARIABLES --- */

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

	/* --- ROUTING VARIABLES --- */
	const fromMarker = useRef<maplibregl.Marker | null>(null);
	const toMarker = useRef<maplibregl.Marker | null>(null);
	/* --- ROUTING VARIABLES --- */

	/* --- MAP RENDERING --- */
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
		if (!mapContainerRef.current) return;
		const newMap = new maplibregl.Map({
			container: mapContainerRef.current,
			style: "http://localhost:3000/map/style-raw-open.json",
			center: [location.longitude, location.latitude],
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
			setUsers((prev) => (prev = users.map((user) => (user.bracelet?.braceletId === braceletId ? { ...user, latitude, longitude } : user))));
		}
	}

	function sendTransmitLocationSignalToBracelets() {
		// Send the signal to monitor locations
		socket.emit(START_LOCATION_TRANSMISSION_TO_TRU, START_LOCATION_TRANSMISSION_TO_TRU);

		// Receive user location signal from py
		socket.on(LOCATION_FROM_USER, async (data: LocationDataFromPy) => {
			const { braceletId, latitude, longitude } = data;
			const correctOwner = users.filter((user) => user.bracelet?.braceletId === braceletId);
			if (correctOwner.length === 0) return;
			// addUserPoint({ ...(correctOwner[0] as UserWithStatusIdentifier), latitude, longitude }, false, true);
			await saveNewLocationToDatabase({ braceletId, latitude, longitude, rescuer: false });
		});

		// Receive rescuer location signal from py
		socket.on(LOCATION_FROM_RESCUER, async (data: LocationDataFromPy) => {
			const { braceletId, latitude, longitude } = data;
			const correctOwner = rescuers.filter((user) => user.bracelet?.braceletId === braceletId);
			if (correctOwner.length === 0) return;
			// addRescuerPoint({ ...(correctOwner[0] as RescuerWithStatusIdentifier) }, false, true);
			await saveNewLocationToDatabase({ braceletId, latitude, longitude, rescuer: true });
		});
	}

	// Location Monitoring Code block - as long as monitorLocation is true this triggers
	useEffect(() => {
		if (!monitorLocations) {
			socket.off(LOCATION_FROM_USER);
			socket.off(LOCATION_FROM_RESCUER);
			return;
		}
		sendTransmitLocationSignalToBracelets();
		return () => {
			socket.off(LOCATION_FROM_USER);
			socket.off(LOCATION_FROM_RESCUER);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [monitorLocations]);

	function toggleMonitorLocations() {
		setMonitorLocations(!monitorLocations);
	}
	/* --- MONITOR LOCATION FUNCTIONS --- */

	/* --- OBSTACLES FUNCTIONS --- */
	const onAddObtacleMapClick = useCallback(
		({ lngLat }: maplibregl.MapMouseEvent) => {
			const { lat, lng } = lngLat;
			if (currentObstacleMarker.current) currentObstacleMarker.current.remove();
			currentObstacleMarker.current = new maplibregl.Marker({
				color: OBSTACLE_MARKER_COLOR,
			}).setLngLat([lng, lat]);
			currentObstacleMarker.current.addTo(mapRef.current!);
			setCurrentObstacleMarkerLngLat({ lat, lng });
		},
		[mapRef]
	);

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
	}, [addingObstacle, mapRef, onAddObtacleMapClick]);

	async function fetchObstaclesAPI() {
		setObstaclesLoading(true);
		const { obstacles }: { obstacles: Obstacle[] } = await (await fetch("/api/obstacles")).json();
		const mappedObstacles = obstacles ? obstacles.map((obstacle) => ({ ...obstacle, showing: false })) : [];
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

	/* --- ROUTING FUNCTIONS --- */
	function createRoute(from: generalType, to: generalType, data: GraphHopperAPIResult) {
		if (!mapRef.current) return;
		if (!data || typeof data === "undefined" || typeof data.paths === "undefined") return;
		if (fromMarker.current) fromMarker.current.remove();
		if (toMarker.current) toMarker.current.remove();
		clearSourcesAndLayers("ROUTE");
		const minimumTime = data.paths.reduce((acc, curr) => (acc.time < curr.time ? acc : curr));
		mapRef.current.addSource("ROUTE", createRouteSource(minimumTime.points.coordinates));
		mapRef.current.addLayer(createRouteLayerGeoJSON());
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
	/* --- ROUTING FUNCTIONS --- */

	return {
		clearSourcesAndLayers,
		removeSourceAndLayer,

		monitorLocations,
		toggleMonitorLocations,
		sendTransmitLocationSignalToBracelets,

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

		createRoute,
		clearRoute,
	};
};
