import { OBSTACLE_MARKER_COLOR } from "@/map-styles";
import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Obstacle } from "@prisma/client";
import { useAppContext } from "@/contexts/AppContext";

export const useObstacles = () => {
	const { mapRef, obstacles, setObstacles } = useAppContext();
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
		if (obstacleMarkerObject.length > 0 && obstacleMarkerObject[0].marker) obstacleMarkerObject[0].marker.remove();
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

	return {
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
	};
};
