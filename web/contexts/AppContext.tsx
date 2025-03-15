"use client";

import {
	MissionWithCost,
	ObstacleWithStatusIdentifier,
	RescuerWithStatusIdentifier,
	TeamWithStatusIdentifier,
	UserWithStatusIdentifier,
} from "@/types";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

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
