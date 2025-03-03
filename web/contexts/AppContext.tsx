"use client";

import { ObstacleWithStatusIdentifier, RescuerWithStatusIdentifier, UserWithStatusIdentifier } from "@/types";
import { createContext, Dispatch, MutableRefObject, ReactNode, RefObject, SetStateAction, useContext, useRef, useState } from "react";

const AppContext = createContext<{
	mapRef: MutableRefObject<maplibregl.Map | null>;
	mapContainerRef: RefObject<HTMLDivElement>;
	mapLoading: boolean;
	setMapLoading: Dispatch<SetStateAction<boolean>>;
	location: { latitude: number; longitude: number };
	setLocation: Dispatch<SetStateAction<{ latitude: number; longitude: number }>>;
	users: UserWithStatusIdentifier[];
	setUsers: Dispatch<SetStateAction<UserWithStatusIdentifier[]>>;
	rescuers: RescuerWithStatusIdentifier[];
	setRescuers: Dispatch<SetStateAction<RescuerWithStatusIdentifier[]>>;
	obstacles: ObstacleWithStatusIdentifier[];
	setObstacles: Dispatch<SetStateAction<ObstacleWithStatusIdentifier[]>>;
} | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
		latitude: 15.0794,
		longitude: 120.62,
	});
	const [mapLoading, setMapLoading] = useState(true);
	const [users, setUsers] = useState<UserWithStatusIdentifier[]>([]);
	const [rescuers, setRescuers] = useState<RescuerWithStatusIdentifier[]>([]);
	const [obstacles, setObstacles] = useState<ObstacleWithStatusIdentifier[]>([]);

	return (
		<AppContext.Provider
			value={{
				mapRef,
				mapContainerRef,
				mapLoading,
				setMapLoading,
				location,
				setLocation,
				users,
				setUsers,
				rescuers,
				setRescuers,
				obstacles,
				setObstacles,
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
