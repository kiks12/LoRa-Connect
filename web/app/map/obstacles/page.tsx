"use client";

import { lazy } from "react";
const ObstacleControls = lazy(() => import("../_components/ObstacleControls"));

export default function ObstacleControlsPage() {
	return <ObstacleControls />;
}
