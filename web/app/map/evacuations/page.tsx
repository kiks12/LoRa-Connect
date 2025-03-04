"use client";

import { lazy } from "react";
const EvacuationCenterControls = lazy(() => import("../_components/EvacuationCenterControls"));

export default function EvacuationsControlsPage() {
	return <EvacuationCenterControls />;
}
