"use client";

import { useEffect, useState } from "react";
import { MissionWithCost } from "@/types";
import { useMapContext } from "@/contexts/MapContext";
import { useUsers } from "./use-users";
import { useRescuers } from "./use-rescuers";
import { useObstacles } from "./use-obstacles";
import { Bracelets } from "@prisma/client";
import { COLOR_MAP, createRouteLayerGeoJSON, createRouteSource } from "@/utils/map";
import maplibregl from "maplibre-gl";
import { socket } from "@/socket/socket";
import { TASK_TO_RESCUER } from "@/lora/lora-tags";
import { calculateTeamAssignmentCosts, runHungarianAlgorithm } from "@/app/algorithm";

export const useAdmin = () => {
	// const { users, setUsers, teams, rescuers, setRescuers, obstacles } = useAppContext();
	const { mapRef, clearSourcesAndLayers } = useMapContext();
	const { users } = useUsers();
	const { teams } = useRescuers();
	const { obstacles } = useObstacles();

	const [monitorLocations, setMonitorLocations] = useState(false);
	const [automaticTaskAllocation, setAutomaticTaskAllocation] = useState(false);
	const [taskAllocationMessage, setTaskAllocationMessage] = useState("Run Task Allocation");
	const [missions, setMissions] = useState<MissionWithCost[]>([]);
	const [markers, setMarkers] = useState<maplibregl.Marker[]>([]);

	function toggleAutomaticTaskAllocation() {
		setAutomaticTaskAllocation(!automaticTaskAllocation);
	}

	function toggleMonitorLocations() {
		setMonitorLocations(!monitorLocations);
	}

	// async function saveNewLocationToDatabase({
	// 	braceletId,
	// 	latitude,
	// 	longitude,
	// 	rescuer,
	// }: {
	// 	braceletId: string;
	// 	latitude: number;
	// 	longitude: number;
	// 	rescuer: boolean;
	// }) {
	// 	await fetch("/api/bracelets/update-location", {
	// 		method: "PATCH",
	// 		body: JSON.stringify({ braceletId, latitude, longitude }),
	// 	});
	// 	if (rescuer) {
	// 		setRescuers(
	// 			// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// 			(prev) => (prev = rescuers.map((rescuer) => (rescuer.bracelet?.braceletId === braceletId ? { ...rescuer, latitude, longitude } : rescuer)))
	// 		);
	// 	} else {
	// 		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// 		setUsers((prev) => (prev = users.map((user) => (user.bracelet?.braceletId === braceletId ? { ...user, latitude, longitude } : user))));
	// 	}
	// }

	// function sendTransmitLocationSignalToBracelets() {
	// 	// Send the signal to monitor locations
	// 	socket.emit(START_LOCATION_TRANSMISSION_TO_TRU, START_LOCATION_TRANSMISSION_TO_TRU);

	// 	// Receive user location signal from py
	// 	socket.on(LOCATION_FROM_USER, async (data: LocationDataFromPy) => {
	// 		const { braceletId, latitude, longitude } = data;
	// 		const correctOwner = users.filter((user) => user.bracelet?.braceletId === braceletId);
	// 		if (correctOwner.length === 0) return;
	// 		// addUserPoint({ ...(correctOwner[0] as UserWithStatusIdentifier), latitude, longitude }, false, true);
	// 		await saveNewLocationToDatabase({ braceletId, latitude, longitude, rescuer: false });
	// 	});

	// 	// Receive rescuer location signal from py
	// 	socket.on(LOCATION_FROM_RESCUER, async (data: LocationDataFromPy) => {
	// 		const { braceletId, latitude, longitude } = data;
	// 		const correctOwner = rescuers.filter((user) => user.bracelet?.braceletId === braceletId);
	// 		if (correctOwner.length === 0) return;
	// 		// addRescuerPoint({ ...(correctOwner[0] as RescuerWithStatusIdentifier) }, false, true);
	// 		await saveNewLocationToDatabase({ braceletId, latitude, longitude, rescuer: true });
	// 	});
	// }

	// // Location Monitoring Code block - as long as monitorLocation is true this triggers
	// useEffect(() => {
	// 	if (!monitorLocations) {
	// 		socket.off(LOCATION_FROM_USER);
	// 		socket.off(LOCATION_FROM_RESCUER);
	// 		return;
	// 	}
	// 	sendTransmitLocationSignalToBracelets();
	// 	return () => {
	// 		socket.off(LOCATION_FROM_USER);
	// 		socket.off(LOCATION_FROM_RESCUER);
	// 	};
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [monitorLocations]);

	// function toggleMonitorLocations() {
	// 	setMonitorLocations(!monitorLocations);
	// }

	function sendTasksViaLoRa() {
		socket.emit(TASK_TO_RESCUER, missions);
	}

	useEffect(() => {
		if (automaticTaskAllocation) {
			runTaskAllocation();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [users, teams, automaticTaskAllocation, obstacles]);

	useEffect(() => {
		clearMarkers();
		missions.forEach((mission, index) => showRoute(index, mission));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [missions]);

	function clearMarkers() {
		markers.forEach((marker) => marker.remove());
		setMarkers([]);
	}

	function clearRoutes() {
		clearMarkers();
		clearSourcesAndLayers(`TASK-ROUTE`);
	}

	function showRoute(index: number, mission: MissionWithCost) {
		const rescuerBracelet = mission.team.rescuers.find((rescuer) => rescuer.bracelet)?.bracelet;
		const userBracelet = mission.user.bracelet;
		if (!rescuerBracelet || !userBracelet) return;
		if (!mission.coordinates) return;
		clearSourcesAndLayers(`TASK-ROUTE-${index}`);
		addRoute(index, mission.coordinates);
		addMarkers({ rescuer: rescuerBracelet!, user: userBracelet! });
	}

	function addRoute(index: number, coordinates: number[][]) {
		if (!mapRef.current) return;
		const tag = `TASK-ROUTE-${index}`;
		mapRef.current.addSource(tag, createRouteSource(coordinates));
		mapRef.current.addLayer(createRouteLayerGeoJSON(tag, tag));
	}

	function addMarkers({ rescuer, user }: { rescuer: Bracelets; user: Bracelets }) {
		if (!mapRef.current) return;
		if (!rescuer.latitude || !rescuer.longitude || !user.latitude || !user.longitude) return;
		const rescuerMarker = new maplibregl.Marker({
			color: COLOR_MAP["RESCUERS"],
		})
			.setLngLat([rescuer.longitude, rescuer.latitude])
			.addTo(mapRef.current);
		const userMarker = new maplibregl.Marker({
			color: COLOR_MAP["USERS"],
		})
			.setLngLat([user.longitude, user.latitude])
			.addTo(mapRef.current);
		setMarkers((prev) => [...prev, rescuerMarker, userMarker]);
	}

	async function runTaskAllocation() {
		setMissions([]);
		setTaskAllocationMessage("Running Task Allocation Algorithm...");
		if (users.length === 0 || teams.length === 0) return;

		let rescuerLocations = new Map<number, { lat: number; lon: number }>();
		let unassignedUsers = [...users.filter((user) => user.bracelet?.sos)]; // Copy users list to track unassigned ones
		const assignedUserIds = new Set<number>(); // Track already assigned users

		while (unassignedUsers.length > 0) {
			setTaskAllocationMessage(`Calculating Costs... (${unassignedUsers.length} users left)`);

			// 🔹 Step 1: Calculate Costs
			const costs = await calculateTeamAssignmentCosts(teams, obstacles, rescuerLocations, unassignedUsers);
			if (costs.length === 0) {
				console.warn("No valid assignments found. Exiting loop.");
				break; // Prevent infinite loop
			}

			// 🔹 Step 2: Assign Teams using Hungarian Algorithm
			const newAssignments = runHungarianAlgorithm(unassignedUsers, teams, costs, assignedUserIds);

			if (newAssignments.length === 0) {
				console.warn("No new assignments made. Stopping loop.");
				break;
			}

			setMissions((prevMissions) => [...prevMissions, ...newAssignments]);

			// 🔹 Step 3: Update rescuer locations
			rescuerLocations = updateRescuerLocations(newAssignments);

			// 🔹 Step 4: Mark users as assigned
			newAssignments.forEach((mission) => assignedUserIds.add(mission.userId));

			// 🔹 Step 5: Remove assigned users
			unassignedUsers = unassignedUsers.filter((user) => !assignedUserIds.has(user.userId));
		}

		setTaskAllocationMessage("Task Allocation Complete");
		setTimeout(() => {
			setTaskAllocationMessage("Run Task Allocation");
		}, 3000);
	}

	function updateRescuerLocations(assignments: MissionWithCost[]) {
		const rescuerLocations = new Map<number, { lat: number; lon: number }>();

		assignments.forEach(({ teamId, coordinates }) => {
			if (coordinates && coordinates.length > 0) {
				const lastCoord = coordinates[coordinates.length - 1];
				rescuerLocations.set(teamId, { lat: lastCoord[1], lon: lastCoord[0] });
			}
		});

		return rescuerLocations;
	}

	return {
		automaticTaskAllocation,
		toggleAutomaticTaskAllocation,
		runTaskAllocation,
		taskAllocationMessage,
		missions,
		sendTasksViaLoRa,
		monitorLocations,
		toggleMonitorLocations,
		clearRoutes,
	};
};
