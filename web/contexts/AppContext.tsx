"use client";

import {
	LOCATION_FROM_RESCUER,
	LOCATION_FROM_USER,
	SOS_FROM_RESCUER,
	SOS_FROM_USER,
	TASK_ACKNOWLEDGEMENT_FROM_RESCUER,
	TASK_STATUS_UPDATE_FROM_RESCUER,
} from "@/lora/lora-tags";
import { socket } from "@/socket/socket";
import {
	MissionWithCost,
	ObstacleWithStatusIdentifier,
	OperationsWithPayload,
	RescuerWithStatusIdentifier,
	TeamWithRescuer,
	TeamWithStatusIdentifier,
	UserWithBracelet,
	UserWithStatusIdentifier,
} from "@/types";
import { NUMBER_TO_URGENCY, URGENCY_LORA_TO_DB, URGENCY_TO_NUMBER } from "@/utils/urgency";
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState, useMemo, useRef } from "react";
import { useMapContext } from "./MapContext";
import { createOwnerPointGeoJSON, createOwnerPointLayerGeoJSON, createRescuerPointGeoJSON, createRescuerPointLayerGeoJSON } from "@/utils/map";
import { LayerSpecification, SourceSpecification } from "maplibre-gl";
import { MISSION_STATUS_MAP } from "@/utils/taskStatus";
import { Obstacle, Operations, OperationStatus, RescueUrgency } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { fetchRoute } from "@/app/algorithm";

const AppContext = createContext<{
	users: UserWithStatusIdentifier[];
	setUsers: Dispatch<SetStateAction<UserWithStatusIdentifier[]>>;
	rescuers: RescuerWithStatusIdentifier[];
	setRescuers: Dispatch<SetStateAction<RescuerWithStatusIdentifier[]>>;
	teams: TeamWithStatusIdentifier[];
	setTeams: Dispatch<SetStateAction<TeamWithStatusIdentifier[]>>;
	obstacles: ObstacleWithStatusIdentifier[];
	setObstacles: Dispatch<SetStateAction<ObstacleWithStatusIdentifier[]>>;
	missions: MissionWithCost[];
	setMissions: Dispatch<SetStateAction<MissionWithCost[]>>;
	fetchUsersAPI: () => void;
	monitorLocations: boolean;
	setMonitorLocations: Dispatch<SetStateAction<boolean>>;
	timeIntervals: { max: number; time: number; title: string }[];
	setTimeIntervals: Dispatch<SetStateAction<{ max: number; time: number; title: string }[]>>;
	fetchTeams: () => void;
	packetId: number;
	setPacketId: Dispatch<SetStateAction<number>>;
	incrementPacketId: () => void;
	packetLogs: string[];
	setPacketLogs: Dispatch<SetStateAction<string[]>>;
} | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
	const { toast } = useToast();
	const [packetId, setPacketId] = useState(98);
	const [monitorLocations, setMonitorLocations] = useState(false);
	const [users, setUsers] = useState<UserWithStatusIdentifier[]>([]);
	const [usersLoading, setUsersLoading] = useState(true);
	const [rescuers, setRescuers] = useState<RescuerWithStatusIdentifier[]>([]);
	const [teams, setTeams] = useState<TeamWithStatusIdentifier[]>([]);
	const [teamsLoading, setTeamsLoading] = useState(true);
	const [obstacles, setObstacles] = useState<ObstacleWithStatusIdentifier[]>([]);
	const [missions, setMissions] = useState<MissionWithCost[]>([]);
	const missionsLookupRef = useRef<MissionWithCost[]>([]);
	const [timeIntervals, setTimeIntervals] = useState<{ max: number; time: number; title: string }[]>([]);
	const { mapRef, removeSourceAndLayer, styleLoaded } = useMapContext();
	const [packetLogs, setPacketLogs] = useState<string[]>([]);

	useEffect(() => {
		fetchUsersAPI();
	}, []);

	useEffect(() => {
		fetchTeams();
	}, []);

	async function fetchObstaclesAPI() {
		const { obstacles }: { obstacles: Obstacle[] } = await (await fetch("/api/obstacles")).json();
		const mappedObstacles = obstacles ? obstacles.map((obstacle) => ({ ...obstacle, showing: false })) : [];
		setObstacles(mappedObstacles);
	}

	// API FETCHING OF OBSTACLES
	useEffect(() => {
		fetchObstaclesAPI();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchMissionsToday = useCallback(async () => {
		const { operations }: { operations: OperationsWithPayload[] } = await (await fetch("/api/operations/today")).json();
		setMissions(
			await Promise.all(
				operations.map(async (operation) => {
					const rescuerBracelet = operation.Teams.rescuers.find((rescuer) => rescuer.bracelet).bracelet;
					const minimumTime = await fetchRoute({
						userLat: operation.user.bracelet.latitude,
						userLong: operation.user.bracelet.longitude,
						rescuerLat: rescuerBracelet.latitude,
						rescuerLong: rescuerBracelet.longitude,
						obstacles,
					});
					const newOperation = {
						...operation,
						userLat: operation.user.bracelet.latitude,
						userLong: operation.user.bracelet.longitude,
						userId: operation.usersUserId,
						teamId: operation.teamsTeamId,
						urgency: URGENCY_TO_NUMBER[operation.urgency],
						coordinates: minimumTime.points.coordinates,
						distance: minimumTime.distance,
						time: minimumTime.time,
					} as unknown as MissionWithCost;

					return newOperation;
				})
			)
		);
	}, [obstacles]);

	useEffect(() => {
		fetchMissionsToday();
	}, [fetchMissionsToday]);

	useEffect(() => {
		if (packetId > 99) {
			setPacketId(0);
		}
	}, [packetId]);

	useEffect(() => {
		missionsLookupRef.current = missions;
	}, [missions]);

	function incrementPacketId() {
		setPacketId((prev) => prev + 1);
	}

	async function fetchUsersAPI() {
		const { users }: { users: UserWithBracelet[] } = await (await fetch("/api/users")).json();
		const mappedUsers = users ? users.map((user) => ({ ...user, showing: false })) : [];
		setUsers(mappedUsers);
		setUsersLoading(false);
	}

	async function fetchTeams() {
		const { teams }: { teams: TeamWithRescuer[] } = await (await fetch("/api/teams")).json();
		const mappedTeams = teams.map((team) => ({ ...team, showing: false }));
		setTeams(mappedTeams);
		setTeamsLoading(false);
	}

	function addPacketToLogs(packet: string) {
		setPacketLogs((prev) => [...prev, packet]);
	}

	function createPacketLog(packet: string): string {
		const source = packet.substring(0, 4);
		const payload = packet.substring(12, packet.length);
		return `SOURCE: ${source}, PAYLOAD: ${payload}`;
	}

	const locationFromUser = useCallback(async ({ data }: { data: string }) => {
		addPacketToLogs(createPacketLog(data));
		const source = data.substring(0, 4);
		const payload = data.substring(12, data.length);
		const splitPayload = payload.split("-");
		const latitude = parseFloat(splitPayload[0]);
		const longitude = parseFloat(splitPayload[1]);
		const urgency = URGENCY_LORA_TO_DB[splitPayload[2]];
		await saveNewLocationToDatabase({ braceletId: source, latitude, longitude, rescuer: false });
		setUsers((prev) => {
			if (prev.length < 0) return prev;
			return prev.map((user) => {
				if (user.bracelet && user.bracelet.braceletId === source) {
					return {
						...user,
						bracelet: {
							...user.bracelet,
							latitude: latitude,
							longitude: longitude,
						},
					};
				}
				return user;
			});
		});
	}, []);

	const sosFromUser = useCallback(async ({ data }: { data: string }) => {
		addPacketToLogs(createPacketLog(data));
		const source = data.substring(0, 4);
		const payload = data.substring(12, data.length);
		const splitPayload = payload.split("-");
		const latitude = parseFloat(splitPayload[0]);
		const longitude = parseFloat(splitPayload[1]);
		const urgency = URGENCY_LORA_TO_DB[splitPayload[2]];
		await saveSosToDatabase({ braceletId: source, latitude, longitude, urgency, sos: true, rescuer: false });
		setUsers((prev) => {
			return prev.map((user) => {
				if (user.bracelet && user.bracelet.braceletId === source) {
					return {
						...user,
						bracelet: {
							...user.bracelet,
							latitude: latitude,
							longitude: longitude,
							sos: true,
							urgency: urgency,
						},
					};
				}
				return user;
			});
		});
	}, []);

	const locationFromRescuer = useCallback(async ({ data }: { data: string }) => {
		addPacketToLogs(createPacketLog(data));
		const source = data.substring(0, 4);
		const payload = data.substring(12, data.length);
		const splitPayload = payload.split("-");
		const latitude = parseFloat(splitPayload[0]);
		const longitude = parseFloat(splitPayload[1]);
		const urgency = URGENCY_LORA_TO_DB[splitPayload[2]];
		await saveNewLocationToDatabase({ braceletId: source, latitude, longitude, rescuer: true });
		setTeams((prev) => {
			return prev.map((team) => {
				const teamBracelet = team.rescuers.find((rescuer) => rescuer.bracelet);
				if (teamBracelet?.bracelet && teamBracelet.bracelet?.braceletId === source) {
					return {
						...team,
						rescuers: team.rescuers.map((rescuer) => {
							if (rescuer.bracelet && rescuer.bracelet.braceletId === source) {
								return {
									...rescuer,
									bracelet: {
										...rescuer.bracelet,
										latitude: latitude,
										longitude: longitude,
									},
								};
							}
							return rescuer;
						}),
					};
				}
				return team;
			});
		});
	}, []);

	const sosFromRescuer = useCallback(async ({ data }: { data: string }) => {
		addPacketToLogs(createPacketLog(data));
		const source = data.substring(0, 4);
		const payload = data.substring(12, data.length);
		const splitPayload = payload.split("-");
		const latitude = parseFloat(splitPayload[0]);
		const longitude = parseFloat(splitPayload[1]);
		const urgency = URGENCY_LORA_TO_DB[splitPayload[2]];
		await saveSosToDatabase({ braceletId: source, latitude, longitude, urgency, sos: true, rescuer: true });
		setTeams((prev) => {
			return prev.map((team) => {
				const teamBracelet = team.rescuers.find((rescuer) => rescuer.bracelet);
				if (teamBracelet?.bracelet && teamBracelet.bracelet?.braceletId === source) {
					return {
						...team,
						rescuers: team.rescuers.map((rescuer) => {
							if (rescuer.bracelet && rescuer.bracelet.braceletId === source) {
								return {
									...rescuer,
									bracelet: {
										...rescuer.bracelet,
										latitude: latitude,
										longitude: longitude,
										sos: true,
										urgency: urgency,
									},
								};
							}
							return rescuer;
						}),
					};
				}
				return team;
			});
		});
	}, []);

	function taskAcknowledgementFromRescuer({ data }: { data: string }) {
		addPacketToLogs(createPacketLog(data));
		const source = data.substring(0, 4);
		const payload = data.substring(12);
	}

	const taskStatusUpdateFromRescuer = useCallback(async ({ data }: { data: string }) => {
		addPacketToLogs(createPacketLog(data));
		const payload = data.substring(12);
		const [missionId, status] = payload.split("-");
		const mission = missionsLookupRef.current.find((mission) => mission.missionId === missionId);
		if (status === "5" && mission) {
			await saveSosToDatabase({
				braceletId: mission.userBraceletId,
				latitude: mission.userLat,
				longitude: mission.userLong,
				urgency: mission.urgency,
				sos: false,
				rescuer: false,
			});
			setUsers((prev) =>
				prev.map((user) => {
					if (user.bracelet.braceletId === mission.userBraceletId) {
						return {
							...user,
							bracelet: {
								...user.bracelet,
								sos: false,
							},
						};
					}
					return user;
				})
			);
		}
		setMissions((prev) =>
			prev.map((mission) => {
				if (mission.missionId === missionId) {
					return {
						...mission,
						status: MISSION_STATUS_MAP[payload] ?? OperationStatus.PENDING,
					};
				}
				return mission;
			})
		);
	}, []);

	useEffect(() => {
		if (usersLoading) return;

		socket.on(LOCATION_FROM_USER, locationFromUser);
		socket.on(SOS_FROM_USER, sosFromUser);

		return () => {
			socket.off(LOCATION_FROM_USER, locationFromUser);
			socket.off(SOS_FROM_USER, sosFromUser);
		};
	}, [locationFromUser, sosFromUser, usersLoading]);

	useEffect(() => {
		if (teamsLoading) return;

		socket.on(LOCATION_FROM_RESCUER, locationFromRescuer);
		socket.on(SOS_FROM_RESCUER, sosFromRescuer);

		return () => {
			socket.off(LOCATION_FROM_RESCUER, locationFromRescuer);
			socket.off(SOS_FROM_RESCUER, sosFromRescuer);
		};
	}, [locationFromRescuer, sosFromRescuer, teamsLoading]);

	useEffect(() => {
		socket.on(TASK_ACKNOWLEDGEMENT_FROM_RESCUER, taskAcknowledgementFromRescuer);
		socket.on(TASK_STATUS_UPDATE_FROM_RESCUER, taskStatusUpdateFromRescuer);

		return () => {
			socket.off(TASK_ACKNOWLEDGEMENT_FROM_RESCUER, taskAcknowledgementFromRescuer);
			socket.off(TASK_STATUS_UPDATE_FROM_RESCUER, taskStatusUpdateFromRescuer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [taskStatusUpdateFromRescuer]);

	useEffect(() => {
		if (styleLoaded) {
			users.forEach((user) => addUserPoint(user));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [users, styleLoaded]);

	useEffect(() => {
		if (styleLoaded) {
			teams.forEach((team) => addTeamPoint(team));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [teams, styleLoaded]);

	useEffect(() => {
		if (packetId > 99) {
			setPacketId(0);
		}
	}, [packetId]);

	useEffect(() => {
		if (missions.length > 0) {
			async function saveTasksAsMissionsToDatabase() {
				const tasks = missions.map(async (mission) => {
					const res = await fetch("/api/operations/new", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							...mission,
							status: OperationStatus.ASSIGNED,
							urgency: NUMBER_TO_URGENCY[mission.urgency] ?? RescueUrgency.MODERATE,
							numberOfRescuee: mission.user.numberOfMembersInFamily,
							usersUserId: mission.userId,
							teamsTeamId: mission.teamId,
						}),
					});

					if (res.status === 200) {
						toast({
							description: `Successfully saved mission ${mission.missionId}`,
						});
					} else {
						console.error(await res.json());
						toast({
							variant: "destructive",
							description: `There is an error saving mission ${mission.missionId}. It is possible the mission is already saved`,
						});
					}

					return Promise.resolve(res.status === 200);
				});

				return await Promise.all(tasks);
			}
			saveTasksAsMissionsToDatabase().then(() => {});
		}
	}, [missions, toast]);

	const addUserPoint = useCallback(
		({ bracelet, userId }: UserWithStatusIdentifier, showLocation: boolean = false, monitorLocation: boolean = true) => {
			if (!bracelet) return;
			if (bracelet && bracelet.latitude === null && bracelet.longitude === null) return;
			if (!mapRef.current) return;
			const { sourceId, data } = createOwnerPointGeoJSON({ userId, latitude: bracelet!.latitude!, longitude: bracelet!.longitude! });
			const mapRefSource = mapRef.current.getSource(sourceId);

			if (mapRefSource && showLocation) return;
			if (mapRefSource && !showLocation && !monitorLocation) return removePoint(sourceId);
			if (mapRefSource && monitorLocation) removePoint(sourceId);

			mapRef.current.addSource(sourceId, data as SourceSpecification);
			mapRef.current.addLayer(createOwnerPointLayerGeoJSON({ sourceId }) as LayerSpecification);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	function removePoint(sourceId: string) {
		removeSourceAndLayer(sourceId);
	}

	const addTeamPoint = useCallback(
		({ rescuers, teamId }: TeamWithStatusIdentifier, showLocation: boolean = false, monitorLocation: boolean = true) => {
			const { bracelet } = rescuers.filter((rescuer) => rescuer.bracelet !== null)[0];
			if (bracelet && bracelet.latitude === null && bracelet.longitude === null) return;
			if (!bracelet) return;
			if (!mapRef.current) return;
			const { sourceId, data } = createRescuerPointGeoJSON({ rescuerId: teamId, latitude: bracelet!.latitude!, longitude: bracelet!.longitude! });

			if (mapRef.current.getSource(sourceId) && showLocation) return;
			if (mapRef.current.getSource(sourceId) && !showLocation && !monitorLocation) return removePoint(sourceId);
			if (mapRef.current.getSource(sourceId) && monitorLocation) removePoint(sourceId);

			mapRef.current.addSource(sourceId, data as SourceSpecification);
			mapRef.current.addLayer(createRescuerPointLayerGeoJSON({ sourceId }) as LayerSpecification);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

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
			body: JSON.stringify({ braceletId, latitude, longitude, urgency: 1 }),
		});
		// if (rescuer) {
		// 	setRescuers(
		// 		(prev) => (prev = rescuers.map((rescuer) => (rescuer.bracelet?.braceletId === braceletId ? { ...rescuer, latitude, longitude } : rescuer)))
		// 	);
		// } else {
		// 	setUsers((prev) => (prev = users.map((user) => (user.bracelet?.braceletId === braceletId ? { ...user, latitude, longitude } : user))));
		// }
	}

	async function saveSosToDatabase({
		braceletId,
		latitude,
		longitude,
		urgency,
		sos,
		rescuer,
	}: {
		braceletId: string;
		latitude: number;
		longitude: number;
		urgency: number;
		sos: boolean;
		rescuer: boolean;
	}) {
		await fetch("/api/bracelets/update-sos", {
			method: "PATCH",
			body: JSON.stringify({ braceletId, latitude, longitude, urgency: urgency, sos }),
		});
		// if (rescuer) {
		// 	setRescuers(
		// 		(prev) => (prev = rescuers.map((rescuer) => (rescuer.bracelet?.braceletId === braceletId ? { ...rescuer, latitude, longitude } : rescuer)))
		// 	);
		// } else {
		// 	setUsers((prev) => (prev = users.map((user) => (user.bracelet?.braceletId === braceletId ? { ...user, latitude, longitude } : user))));
		// }
	}

	const providerValue = useMemo(() => {
		return {
			users,
			setUsers,
			rescuers,
			setRescuers,
			teams,
			setTeams,
			obstacles,
			setObstacles,
			missions,
			setMissions,

			fetchUsersAPI,
			fetchTeams,

			monitorLocations,
			setMonitorLocations,

			timeIntervals,
			setTimeIntervals,

			packetId,
			setPacketId,
			incrementPacketId,

			packetLogs,
			setPacketLogs,
		};
	}, [users, rescuers, teams, obstacles, missions, monitorLocations, timeIntervals, packetId, packetLogs]);

	return <AppContext.Provider value={providerValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
	const context = useContext(AppContext);
	if (context === null) throw new Error("App Context is null");
	return context;
};
