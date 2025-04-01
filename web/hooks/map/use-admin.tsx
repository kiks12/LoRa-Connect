"use client";

import { useEffect, useState } from "react";
import { MissionWithCost } from "@/types";
import { useMapContext } from "@/contexts/MapContext";
import { useUsers } from "./use-users";
import { useRescuers } from "./use-rescuers";
import { useObstacles } from "./use-obstacles";
import { Bracelets, OperationStatus } from "@prisma/client";
import { COLOR_MAP, createRouteLayerGeoJSON, createRouteSource } from "@/utils/map";
import maplibregl from "maplibre-gl";
import { socket } from "@/socket/socket";
import { START_LOCATION_TRANSMISSION_TO_TRU, TASK_TO_RESCUER } from "@/lora/lora-tags";
import { calculateTeamAssignmentCosts, runHungarianAlgorithm } from "@/app/algorithm";
import { NUMBER_TO_URGENCY } from "@/utils/urgency";
import { useAppContext } from "@/contexts/AppContext";
import { triggerFunctionWithTimerUsingTimeout2 } from "@/lib/utils";
import useTimeUpdater from "./use-timeUpdater";
import { useToast } from "../use-toast";

export const useAdmin = () => {
	const { mapRef, clearSourcesAndLayers } = useMapContext();
	const { missions, setMissions, monitorLocations, setMonitorLocations, timeIntervals } = useAppContext();
	const { updateTime } = useTimeUpdater();
	const { users } = useUsers();
	const { teams } = useRescuers();
	const { toast } = useToast();
	const { obstacles } = useObstacles();

	const [automaticTaskAllocation, setAutomaticTaskAllocation] = useState(false);
	const [taskAllocationMessage, setTaskAllocationMessage] = useState("Run Task Allocation");
	const [markers, setMarkers] = useState<maplibregl.Marker[]>([]);

	function toggleAutomaticTaskAllocation() {
		setAutomaticTaskAllocation(!automaticTaskAllocation);
	}

	function toggleMonitorLocations() {
		if (timeIntervals.some((time) => time.title === "Monitor Locations")) {
			toast({
				variant: "destructive",
				description: "Monitor Locations timer currently running",
			});
		} else {
			setMonitorLocations(!monitorLocations);
		}
	}

	function sendTransmitLocationSignalToBracelets() {
		socket.emit(START_LOCATION_TRANSMISSION_TO_TRU, START_LOCATION_TRANSMISSION_TO_TRU);
	}

	// Location Monitoring Code block - as long as monitorLocation is true this triggers
	useEffect(() => {
		if (monitorLocations) {
			if (timeIntervals.some((time) => time.title === "Monitor Locations")) {
				toast({
					variant: "destructive",
					description: "Monitor Locations timer currently running",
				});
			} else {
				triggerFunctionWithTimerUsingTimeout2(
					"Monitor Locations",
					() => {
						sendTransmitLocationSignalToBracelets();
					},
					updateTime
				);
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [monitorLocations]);

	async function saveTasksAsMissionsToDatabase() {
		const tasks = missions.map(async (mission) => {
			const res = await fetch("/api/operations/new", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					missionId: mission.missionId,
					distance: mission.distance,
					eta: mission.time,

					userId: mission.user.userId,
					userBraceletId: mission.userBraceletId,
					status: OperationStatus.ASSIGNED,
					urgency: NUMBER_TO_URGENCY[mission.urgency],
					numberOfRescuee: mission.user.numberOfMembersInFamily,

					teamId: mission.teamId,
					teamBraceletId: mission.teamBraceletId,
				}),
			});

			if (res.status === 200) {
				toast({
					description: `Successfully saved mission ${mission.missionId}`,
				});
			} else {
				toast({
					variant: "destructive",
					description: `There is an error saving mission ${mission.missionId}. It is possible the mission is already saved`,
				});
			}

			return Promise.resolve(res.status === 200);
		});

		return await Promise.all(tasks);
	}

	function sendTasksViaLoRa() {
		if (timeIntervals.some((time) => time.title === "Send Tasks Via LoRa")) {
			toast({
				variant: "destructive",
				description: "Tasks Sender timer is currently working",
			});
		} else {
			triggerFunctionWithTimerUsingTimeout2(
				"Send Tasks Via LoRa",
				() => {
					socket.emit(TASK_TO_RESCUER, missions);
				},
				updateTime
			);
		}
	}

	useEffect(() => {
		if (automaticTaskAllocation) {
			runTaskAllocation();
			sendTasksViaLoRa();
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
		saveTasksAsMissionsToDatabase,
		toggleMonitorLocations,
		clearRoutes,
	};
};
