"use client";

import { lazy } from "react";
const UsersControls = lazy(() => import("../_components/UsersControls"));

export default function UsersControLPage() {
	return <UsersControls />;
}
