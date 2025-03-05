"use client";

import { ObstaclesProvider } from "@/contexts/ObstacleContext";
import { lazy } from "react";
const ObstacleControls = lazy(() => import("../_components/ObstacleControls"));

export default function ObstacleControlsPage() {
	return (
		<ObstaclesProvider>
			<ObstacleControls />
		</ObstaclesProvider>
	);
}
