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
	RescuerWithStatusIdentifier,
	TeamWithRescuer,
	TeamWithStatusIdentifier,
	UserWithBracelet,
	UserWithStatusIdentifier,
} from "@/types";
import { NUMBER_TO_URGENCY, URGENCY_LORA_TO_DB } from "@/utils/urgency";
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState, useMemo, use, useRef } from "react";
import { useMapContext } from "./MapContext";
import { createOwnerPointGeoJSON, createOwnerPointLayerGeoJSON, createRescuerPointGeoJSON, createRescuerPointLayerGeoJSON } from "@/utils/map";
import { LayerSpecification, SourceSpecification } from "maplibre-gl";
import { MISSION_STATUS_MAP } from "@/utils/taskStatus";
import { OperationStatus } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

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
	const { mapRef, removeSourceAndLayer } = useMapContext();
	const [styleLoaded, setStyleLoaded] = useState(false);

	mapRef.current?.on("load", () => setStyleLoaded(true));

	useEffect(() => {
		fetchUsersAPI();
	}, []);

	useEffect(() => {
		fetchTeams();
	}, []);

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

	useEffect(() => {
		if (usersLoading) return;

		socket.on(LOCATION_FROM_USER, locationFromUser);
		socket.on(SOS_FROM_USER, sosFromUser);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [usersLoading]);

	useEffect(() => {
		if (teamsLoading) return;

		socket.on(LOCATION_FROM_RESCUER, locationFromRescuer);
		socket.on(SOS_FROM_RESCUER, sosFromRescuer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [teamsLoading]);

	useEffect(() => {
		// socket.on(LOCATION_FROM_USER, locationFromUser);
		// socket.on(SOS_FROM_USER, sosFromUser);
		// socket.on(LOCATION_FROM_RESCUER, locationFromRescuer);
		// socket.on(SOS_FROM_RESCUER, sosFromRescuer);
		socket.on(TASK_ACKNOWLEDGEMENT_FROM_RESCUER, taskAcknowledgementFromRescuer);
		socket.on(TASK_STATUS_UPDATE_FROM_RESCUER, taskStatusUpdateFromRescuer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
			console.log(missions);
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
							urgency: NUMBER_TO_URGENCY[mission.urgency],
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

	async function locationFromUser({ data }: { data: string }) {
		const source = data.substring(0, 4);
		const payload = data.substring(12, data.length);
		const splitPayload = payload.split("-");
		const latitude = parseFloat(splitPayload[0]);
		const longitude = parseFloat(splitPayload[1]);
		const urgency = URGENCY_LORA_TO_DB[splitPayload[2]];
		await saveNewLocationToDatabase({ braceletId: source, latitude, longitude, rescuer: false });
		if (users.length > 0) {
			setUsers((prev) => {
				return prev.map((user) => {
					if (user.bracelet && user.bracelet.braceletId === source) {
						return {
							...user,
							bracelet: {
								...user.bracelet,
								latitude: latitude,
								longitude: longitude,
								sos: user.bracelet.sos,
								urgency: urgency,
							},
						};
					}
					return user;
				});
			});
		}
	}

	async function sosFromUser({ data }: { data: string }) {
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
	}

	async function locationFromRescuer({ data }: { data: string }) {
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
	}

	async function sosFromRescuer({ data }: { data: string }) {
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
	}

	function taskAcknowledgementFromRescuer({ data }: { data: string }) {
		const source = data.substring(0, 4);
		const payload = data.substring(12);
		console.log(source, payload);
	}

	const taskStatusUpdateFromRescuer = useCallback(
		async ({ data }: { data: string }) => {
			const payload = data.substring(12);
			const [missionId, status] = payload.split("-");
			console.log(missionId, status);
			const mission = missionsLookupRef.current.find((mission) => mission.missionId === missionId);
			console.log(mission);
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
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[missions, users, saveSosToDatabase]
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
		if (rescuer) {
			setRescuers(
				(prev) => (prev = rescuers.map((rescuer) => (rescuer.bracelet?.braceletId === braceletId ? { ...rescuer, latitude, longitude } : rescuer)))
			);
		} else {
			setUsers((prev) => (prev = users.map((user) => (user.bracelet?.braceletId === braceletId ? { ...user, latitude, longitude } : user))));
		}
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
		if (rescuer) {
			setRescuers(
				(prev) => (prev = rescuers.map((rescuer) => (rescuer.bracelet?.braceletId === braceletId ? { ...rescuer, latitude, longitude } : rescuer)))
			);
		} else {
			setUsers((prev) => (prev = users.map((user) => (user.bracelet?.braceletId === braceletId ? { ...user, latitude, longitude } : user))));
		}
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
		};
	}, [users, rescuers, teams, obstacles, missions, monitorLocations, timeIntervals, packetId]);

	return <AppContext.Provider value={providerValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
	const context = useContext(AppContext);
	if (context === null) throw new Error("App Context is null");
	return context;
};
