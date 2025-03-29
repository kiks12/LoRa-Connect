"use client";

import {
	LOCATION_FROM_RESCUER,
	LOCATION_FROM_USER,
	SOS_FROM_RESCUER,
	SOS_FROM_USER,
	TASK_ACKNOWLEDGEMENT_FROM_RESCUER,
	TASK_STATUS_UPDATE_FROM_RESCUER,
} from "@/lora/lora-tags";
import { updateBraceletLocation } from "@/server/db/bracelets";
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
import { URGENCY_LORA_TO_DB } from "@/utils/urgency";
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { useMapContext } from "./MapContext";
import { createOwnerPointGeoJSON, createOwnerPointLayerGeoJSON, createRescuerPointGeoJSON, createRescuerPointLayerGeoJSON } from "@/utils/map";
import { LayerSpecification, SourceSpecification } from "maplibre-gl";

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
} | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
	const [monitorLocations, setMonitorLocations] = useState(false);
	const [users, setUsers] = useState<UserWithStatusIdentifier[]>([]);
	const [rescuers, setRescuers] = useState<RescuerWithStatusIdentifier[]>([]);
	const [teams, setTeams] = useState<TeamWithStatusIdentifier[]>([]);
	const [obstacles, setObstacles] = useState<ObstacleWithStatusIdentifier[]>([]);
	const [missions, setMissions] = useState<MissionWithCost[]>([]);
	const [timeIntervals, setTimeIntervals] = useState<{ max: number; time: number; title: string }[]>([]);
	const { mapRef, removeSourceAndLayer } = useMapContext();
	const [styleLoaded, setStyleLoaded] = useState(false);

	mapRef.current?.on("load", () => setStyleLoaded(true));

	useEffect(() => {
		socket.on(LOCATION_FROM_USER, locationFromUser);
		socket.on(SOS_FROM_USER, sosFromUser);
		socket.on(LOCATION_FROM_RESCUER, locationFromRescuer);
		socket.on(SOS_FROM_RESCUER, sosFromRescuer);
		socket.on(TASK_ACKNOWLEDGEMENT_FROM_RESCUER, taskAcknowledgementFromRescuer);
		socket.on(TASK_STATUS_UPDATE_FROM_RESCUER, taskStatusUpdateFromRescuer);
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
		fetchUsersAPI();
		fetchTeams();
	}, []);

	async function fetchUsersAPI() {
		const { users }: { users: UserWithBracelet[] } = await (await fetch("/api/users")).json();
		const mappedUsers = users ? users.map((user) => ({ ...user, showing: false })) : [];
		setUsers(mappedUsers);
	}

	async function fetchTeams() {
		const { teams }: { teams: TeamWithRescuer[] } = await (await fetch("/api/teams")).json();
		const mappedTeams = teams.map((team) => ({ ...team, showing: false }));
		setTeams(mappedTeams);
	}

	const addUserPoint = useCallback(
		({ bracelet, userId }: UserWithStatusIdentifier, showLocation: boolean = false, monitorLocation: boolean = false) => {
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
		({ rescuers, teamId }: TeamWithStatusIdentifier, showLocation: boolean = false, monitorLocation: boolean = false) => {
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

	async function locationFromUser(data: string) {
		const source = data.substring(0, 4);
		const payload = data.substring(10, data.length);
		const splitPayload = payload.split("-");
		const latitude = parseFloat(splitPayload[0]);
		const longitude = parseFloat(splitPayload[1]);
		const urgency = URGENCY_LORA_TO_DB[splitPayload[2]];
		await updateBraceletLocation({ braceletId: source, latitude, longitude, urgency });
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

	async function sosFromUser(data: string) {
		const source = data.substring(0, 4);
		const payload = data.substring(10, data.length);
		const splitPayload = payload.split("-");
		const latitude = parseFloat(splitPayload[0]);
		const longitude = parseFloat(splitPayload[1]);
		const urgency = URGENCY_LORA_TO_DB[splitPayload[2]];
		await updateBraceletLocation({ braceletId: source, latitude, longitude, urgency });
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

	async function locationFromRescuer(data: string) {
		const source = data.substring(0, 4);
		const payload = data.substring(10, data.length);
		const splitPayload = payload.split("-");
		const latitude = parseFloat(splitPayload[0]);
		const longitude = parseFloat(splitPayload[1]);
		const urgency = URGENCY_LORA_TO_DB[splitPayload[2]];
		await updateBraceletLocation({ braceletId: source, latitude, longitude, urgency });
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

	async function sosFromRescuer(data: string) {
		const source = data.substring(0, 4);
		const payload = data.substring(10, data.length);
		const splitPayload = payload.split("-");
		const latitude = parseFloat(splitPayload[0]);
		const longitude = parseFloat(splitPayload[1]);
		const urgency = URGENCY_LORA_TO_DB[splitPayload[2]];
		await updateBraceletLocation({ braceletId: source, latitude, longitude, urgency });
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

	function taskAcknowledgementFromRescuer(data: string) {
		const source = data.substring(0, 4);
		const payload = data.substring(10, data.length);
		console.log(source, payload);
	}

	function taskStatusUpdateFromRescuer(data: string) {
		const source = data.substring(0, 4);
		const payload = data.substring(10, data.length);
		console.log(source, payload);
	}

	// Receive user location signal from py
	// socket.on(LOCATION_FROM_USER, async (data: LocationDataFromPy) => {
	// const { braceletId } = data;
	// const correctOwner = users.filter((user) => user.bracelet?.braceletId === braceletId);
	// console.log(correctOwner);
	// if (correctOwner.length === 0) return;
	// addUserPoint({ ...(correctOwner[0] as UserWithStatusIdentifier), latitude, longitude }, false, true);
	// await saveNewLocationToDatabase({ braceletId, latitude, longitude, rescuer: false });
	// });

	// Receive rescuer location signal from py
	// socket.on(LOCATION_FROM_RESCUER, async (data: LocationDataFromPy) => {
	// 	const { braceletId } = data;
	// 	const correctOwner = rescuers.filter((user) => user.bracelet?.braceletId === braceletId);
	// 	console.log(correctOwner);
	// 	if (correctOwner.length === 0) return;
	// 	// addRescuerPoint({ ...(correctOwner[0] as RescuerWithStatusIdentifier) }, false, true);
	// 	// await saveNewLocationToDatabase({ braceletId, latitude, longitude, rescuer: true });
	// });

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

	return (
		<AppContext.Provider
			value={{
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
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

export const useAppContext = () => {
	const context = useContext(AppContext);
	if (context === null) throw new Error("App Context is null");
	return context;
};
