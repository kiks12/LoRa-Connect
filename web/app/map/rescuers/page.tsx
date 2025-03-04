"use client";

import { lazy } from "react";
const RescuersControls = lazy(() => import("../_components/RescuersControls"));

export default function RescuersControlPage() {
	return <RescuersControls />;
}
