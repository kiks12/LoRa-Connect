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
	TeamWithStatusIdentifier,
	UserWithStatusIdentifier,
} from "@/types";
import { URGENCY_LORA_TO_DB } from "@/utils/urgency";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";

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
} | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
	const [users, setUsers] = useState<UserWithStatusIdentifier[]>([]);
	const [rescuers, setRescuers] = useState<RescuerWithStatusIdentifier[]>([]);
	const [teams, setTeams] = useState<TeamWithStatusIdentifier[]>([]);
	const [obstacles, setObstacles] = useState<ObstacleWithStatusIdentifier[]>([]);
	const [missions, setMissions] = useState<MissionWithCost[]>([]);

	useEffect(() => {
		socket.on(LOCATION_FROM_USER, locationFromUser);
		socket.on(SOS_FROM_USER, sosFromUser);
		socket.on(LOCATION_FROM_RESCUER, locationFromRescuer);
		socket.on(SOS_FROM_RESCUER, sosFromRescuer);
		socket.on(TASK_ACKNOWLEDGEMENT_FROM_RESCUER, taskAcknowledgementFromRescuer);
		socket.on(TASK_STATUS_UPDATE_FROM_RESCUER, taskStatusUpdateFromRescuer);
	}, []);

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
