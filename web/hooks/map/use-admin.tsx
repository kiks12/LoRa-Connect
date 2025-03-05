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
		clearSourcesAndLayers(`TASK-ROUTE`);
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
		setTaskAllocationMessage("Running Task Allocation Algorithm...");
		if (users.length === 0 || teams.length === 0) return;
		setTaskAllocationMessage("Calculating Costs...");
		const costs = await calculateTeamAssignmentCosts();
		setTaskAllocationMessage("Assigning Teams...");
		assignTeams(
			users.filter((user) => user.bracelet),
			teams,
			costs
		);
		setTaskAllocationMessage("Task Allocation Complete");
		setTimeout(() => {
			setTaskAllocationMessage("Run Task Allocation");
		}, 3000);
	}

	async function calculateTeamAssignmentCosts(): Promise<TeamAssignmentCost[]> {
		if (users.length === 0 || teams.length === 0) return [];
		const obstaclesCoordinates = obstacles.map((d: ObstacleWithStatusIdentifier) => [d.latitude, d.longitude] as LatLng);
		const customModelObject = createCustomModelObject(obstaclesCoordinates);

		// Map through the teams & flatten users within each team
		const teamsCostsPromises = teams.flatMap((team) => {
			if (!team.rescuers.some((rescuer) => rescuer.bracelet)) return;
			// Get rescuer with bracelet
			const rescuer = team.rescuers.find((rescuer) => rescuer.bracelet);
			if (!rescuer || !rescuer.bracelet) return []; // No valid rescuer/bracelet
			const rescuerBracelet = rescuer.bracelet;

			// Map through users and create API requests
			return users.map(async (user) => {
				if (
					!user.bracelet ||
					user.bracelet.latitude === null ||
					user.bracelet.longitude === null ||
					rescuerBracelet === null ||
					rescuerBracelet.longitude === null ||
					rescuerBracelet.latitude === null
				)
					return null; // skip users without bracelets

				const userBracelet = user.bracelet;
				const points = [
					[rescuerBracelet?.longitude, rescuerBracelet?.latitude],
					[userBracelet?.longitude, userBracelet?.latitude],
				];

				const res = await fetch(`http://localhost:8989/route`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(
						obstaclesCoordinates.length === 0
							? {
									points: points,
									points_encoded: false,
									profile: "car",
							  }
							: {
									points: points,
									points_encoded: false,
									profile: "car",
									"ch.disable": true,
									custom_model: customModelObject,
							  }
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
		return resolvedCosts.filter(Boolean) as TeamAssignmentCost[]; // Remove skipped users
	}

	function assignTeams(users: UserWithStatusIdentifier[], teams: TeamWithStatusIdentifier[], costs: TeamAssignmentCost[], alpha: number = 0.5) {
		const numUsers = users.length;
		const numTeams = teams.length;

		// Step 1: Build the Cost Matrix
		const costMatrix: number[][] = Array.from({ length: numUsers }, () => new Array(numTeams).fill(Infinity));

		costs.forEach(({ userId, teamId, distance, time }) => {
			const userIndex = users.findIndex((u) => u.userId === userId);
			const teamIndex = teams.findIndex((t) => t.teamId === teamId);

			if (userIndex !== -1 && teamIndex !== -1) {
				// Compute weighted cost: Adjust alpha to control the importance of distance vs time
				costMatrix[userIndex][teamIndex] = alpha * distance + (1 - alpha) * time;
			}
		});

		// Step 2: Run Hungarian Algorithm
		const assignments = minWeightAssign(costMatrix);

		const final = assignments.assignments
			.map((teamIndex, userIndex) => {
				const user = users[userIndex];
				const team = teams[teamIndex!];

				// Find the corresponding cost object
				const costEntry = costs.find((c) => c.userId === user.userId && c.teamId === team.teamId);

				return {
					userId: user.userId,
					user: user, // Ensure valid user
					teamId: team.teamId,
					team: team, // Ensure valid team
					coordinates: costEntry?.coordinates,
					distance: costEntry?.distance,
					time: costEntry?.time,
				};
			})
			.filter(({ userId, teamId }) => userId !== undefined && teamId !== undefined); // Remove any invalid assignments
		setMissions(final);
	}

	return {
		automaticTaskAllocation,
		toggleAutomaticTaskAllocation,
		runTaskAllocation,
		taskAllocationMessage,
		missions,

		monitorLocations,
		clearRoutes,
	};
};
