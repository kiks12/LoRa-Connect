import { OBSTACLE_MARKER_COLOR } from "@/map-styles";
import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Obstacle } from "@prisma/client";
import { useAppContext } from "@/contexts/AppContext";
import { useMapContext } from "@/contexts/MapContext";
import { useObstaclesContext } from "@/contexts/ObstacleContext";
import { formatTwoDigitNumber, triggerFunctionWithTimerUsingTimeout2 } from "@/lib/utils";
import { socket } from "@/socket/socket";
import { OBSTACLE_TO_RESCUER } from "@/lora/lora-tags";
import useTimeUpdater from "./use-timeUpdater";
import { useToast } from "../use-toast";

export const useObstacles = () => {
	const { mapRef } = useMapContext();
	const { obstacles, setObstacles, timeIntervals, packetId, setPacketId } = useAppContext();
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
	const [form, setForm] = useState<{
		name: string;
		type: string;
		latitude: number;
		longitude: number;
	}>({
		name: "",
		type: "",
		latitude: 0,
		longitude: 0,
	});
	const { currentObstacleMarkerLatLng, setCurrentObstacleMarkerLatLng } = useObstaclesContext();
	const { updateTime } = useTimeUpdater();
	const { toast } = useToast();

	function onNameChange(newVal: string) {
		setForm((prev) => ({ ...prev, name: newVal }));
	}

	function onTypeChange(newVal: string) {
		setForm((prev) => ({ ...prev, type: newVal }));
	}

	function sendObstaclesToRescuers() {
		if (timeIntervals.some((time) => time.title === "Obstacles to Rescuers")) {
			toast({
				variant: "destructive",
				description: "Obstacles to Rescuers timer currently running",
			});
		} else {
			triggerFunctionWithTimerUsingTimeout2(
				"Obstacles to Rescuers",
				() => {
					let localPacketId = packetId;
					const mapped = obstacles.map((obstacle) => {
						const stringPacketId = formatTwoDigitNumber(localPacketId);
						localPacketId = (localPacketId + 1) % 100;
						return {
							...obstacle,
							packetId: stringPacketId,
						};
					});
					setPacketId(localPacketId);
					socket.emit(OBSTACLE_TO_RESCUER, mapped);
				},
				updateTime,
				() => {}
			);
		}
	}

	const onAddObtacleMapClick = useCallback(
		({ lngLat }: maplibregl.MapMouseEvent) => {
			const { lat, lng } = lngLat;
			if (currentObstacleMarker.current) {
				currentObstacleMarker.current.remove();
				currentObstacleMarker.current = null;
			}
			currentObstacleMarker.current = new maplibregl.Marker({
				color: OBSTACLE_MARKER_COLOR,
			}).setLngLat([lng, lat]);
			currentObstacleMarker.current.addTo(mapRef.current!);
			setCurrentObstacleMarkerLatLng({ lat, lng });
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[mapRef]
	);

	useEffect(() => {
		if (mapRef.current) {
			if (addingObstacle) {
				mapRef.current.on("click", onAddObtacleMapClick);
			} else {
				mapRef.current.off("click", onAddObtacleMapClick);
				currentObstacleMarker.current?.remove();
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
		currentObstacleMarkerLatLng,
		showObstacleMarkerOnMap,
		removeObstacleMarkerFromMap,
		toggleObstacleOnMap,
		updateObstacle,
		obstaclesLoading,
		refreshObstacles,
		form,
		onNameChange,
		onTypeChange,
		sendObstaclesToRescuers,
	};
};
