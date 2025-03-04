"use client";

import { lazy } from "react";
const RoutingControls = lazy(() => import("../_components/RoutingControls"));

export default function RoutingControlPage() {
	return <RoutingControls />;
}
