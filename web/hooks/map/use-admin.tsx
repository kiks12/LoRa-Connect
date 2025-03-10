"use client";

import { useEffect, useState } from "react";
import {
	GraphHopperAPIResult,
	MissionWithCost,
	ObstacleWithStatusIdentifier,
	TeamAssignmentCost,
	TeamWithStatusIdentifier,
	UserWithStatusIdentifier,
} from "@/types";
import { useMapContext } from "@/contexts/MapContext";
import { minWeightAssign } from "munkres-algorithm";
import { createCustomModelObject, LatLng } from "@/utils/routing";
import { useUsers } from "./use-users";
import { useRescuers } from "./use-rescuers";
import { useObstacles } from "./use-obstacles";
import { Bracelets } from "@prisma/client";
import { COLOR_MAP, createRouteLayerGeoJSON, createRouteSource } from "@/utils/map";
import maplibregl from "maplibre-gl";
import { socket } from "@/socket/socket";
import { TASK_TO_RESCUER } from "@/lora/lora-tags";

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
		let unassignedUsers = [...users]; // Copy users list to track unassigned ones
		let assignedUserIds = new Set<number>(); // Track already assigned users

		while (unassignedUsers.length > 0) {
			setTaskAllocationMessage(`Calculating Costs... (${unassignedUsers.length} users left)`);

			// 🔹 Step 1: Calculate Costs
			let costs = await calculateTeamAssignmentCosts(rescuerLocations, unassignedUsers);
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

	async function calculateTeamAssignmentCosts(
		updatedRescuerLocations: Map<number, { lat: number; lon: number }>,
		unassignedUsers: UserWithStatusIdentifier[]
	): Promise<TeamAssignmentCost[]> {
		if (unassignedUsers.length === 0 || teams.length === 0) return [];

		const obstaclesCoordinates = obstacles.map((d: ObstacleWithStatusIdentifier) => [d.latitude, d.longitude] as LatLng);
		const customModelObject = createCustomModelObject(obstaclesCoordinates);

		const teamsCostsPromises = teams.flatMap((team) => {
			const rescuer = team.rescuers.find((rescuer) => rescuer.bracelet);
			if (!rescuer || !rescuer.bracelet) return [];

			// Get rescuer's last known location, or their initial position if not updated yet
			const rescuerStartLocation = updatedRescuerLocations.get(team.teamId) || {
				lat: rescuer.bracelet.latitude,
				lon: rescuer.bracelet.longitude,
			};

			return unassignedUsers.map(async (user) => {
				if (!user.bracelet || !user.bracelet.latitude || !user.bracelet.longitude) return null;

				const points = [
					[rescuerStartLocation.lon, rescuerStartLocation.lat], // Updated rescuer location
					[user.bracelet.longitude, user.bracelet.latitude], // User location
				];

				const res = await fetch(`http://localhost:8989/route`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(
						obstaclesCoordinates.length === 0
							? { points, points_encoded: false, profile: "car" }
							: { points, points_encoded: false, profile: "car", "ch.disable": true, custom_model: customModelObject }
					),
				});

				const json: GraphHopperAPIResult = await res.json();
				const minimumTime = json.paths.reduce((acc, curr) => (acc.time < curr.time ? acc : curr));

				return {
					userId: user.userId,
					teamId: team.teamId,
					coordinates: minimumTime.points.coordinates,
					distance: minimumTime.distance,
					time: minimumTime.time,
				} as TeamAssignmentCost;
			});
		});

		const resolvedCosts = await Promise.all(teamsCostsPromises);
		return resolvedCosts.filter(Boolean) as TeamAssignmentCost[];
	}

	// 🔹 Step 1: Hungarian Algorithm (Initial Assignment)
	function runHungarianAlgorithm(
		users: UserWithStatusIdentifier[],
		teams: TeamWithStatusIdentifier[],
		costs: TeamAssignmentCost[],
		assignedUsers: Set<number>,
		alpha: number = 0.5
	): MissionWithCost[] {
		const unassignedUsers = users.filter((user) => !assignedUsers.has(user.userId));
		const numUsers = unassignedUsers.length;
		const numTeams = teams.length;

		if (numUsers === 0 || numTeams === 0) return [];

		// Build cost matrix
		const costMatrix: number[][] = Array.from({ length: numUsers }, () => new Array(numTeams).fill(Infinity));

		costs.forEach(({ userId, teamId, distance, time }) => {
			const userIndex = unassignedUsers.findIndex((u) => u.userId === userId);
			const teamIndex = teams.findIndex((t) => t.teamId === teamId);

			if (userIndex !== -1 && teamIndex !== -1) {
				costMatrix[userIndex][teamIndex] = alpha * distance + (1 - alpha) * time;
			}
		});

		// 🔹 Solve Hungarian Algorithm
		const assignments = minWeightAssign(costMatrix);

		return assignments.assignments
			.map((teamIndex, userIndex) => {
				if (teamIndex === null) return null;

				const user = unassignedUsers[userIndex];
				const team = teams[teamIndex];

				const costEntry = costs.find((c) => c.userId === user.userId && c.teamId === team.teamId);

				return {
					userId: user.userId,
					user,
					teamId: team.teamId,
					team,
					coordinates: costEntry?.coordinates,
					distance: costEntry?.distance,
					time: costEntry?.time,
				};
			})
			.filter((assignment): assignment is MissionWithCost => assignment !== null);
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
		clearRoutes,
	};
};
