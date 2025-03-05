"use client";

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

const ObstaclesContext = createContext<{
	currentObstacleMarkerLatLng: { lat: number; lng: number } | null;
	setCurrentObstacleMarkerLatLng: Dispatch<SetStateAction<{ lat: number; lng: number } | null>>;
} | null>(null);

export const ObstaclesProvider = ({ children }: { children: ReactNode }) => {
	const [currentObstacleMarkerLatLng, setCurrentObstacleMarkerLatLng] = useState<{ lat: number; lng: number } | null>(null);
	return <ObstaclesContext.Provider value={{ currentObstacleMarkerLatLng, setCurrentObstacleMarkerLatLng }}>{children}</ObstaclesContext.Provider>;
};

export const useObstaclesContext = () => {
	const context = useContext(ObstaclesContext);
	if (context === null) throw new Error("Obstacle Context is null");
	return context;
};
