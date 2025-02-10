"use client";

import AdminControls from "@/app/map/_components/AdminControls";
import UsersControls from "@/app/map/_components/UsersControls";
import RescuersControls from "@/app/map/_components/RescuersControls";
import TasksControls from "@/app/map/_components/TasksControls";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { useMapContext } from "./use-map";
import RoutingControls from "@/app/map/_components/RoutingControls";

export type activeTab = "ADMIN" | "TASKS" | "OWNERS" | "RESCUERS" | "ROUTING";
export const SIDEBAR_TABS: { [key: string]: ReactNode } = {
	ADMIN: <AdminControls />,
	TASKS: <TasksControls />,
	OWNERS: <UsersControls />,
	RESCUERS: <RescuersControls />,
	ROUTING: <RoutingControls />,
};
type CLOSE_COMPONENT_CALLBACK = "TOGGLE_ADDING_OBSTACLE";

const SidebarContext = createContext<{
	open: boolean;
	active: { key: activeTab; controls: ReactNode };
	onListClick: (newActive: activeTab) => void;
	toggleSidebar: () => void;
	component: ReactNode | null;
	setComponent: React.Dispatch<React.SetStateAction<ReactNode>>;
	setCloseCallback: React.Dispatch<React.SetStateAction<CLOSE_COMPONENT_CALLBACK[]>>;
} | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(true);
	const [active, setActive] = useState<{ key: activeTab; controls: ReactNode }>({
		key: "ADMIN",
		controls: SIDEBAR_TABS["ADMIN"],
	});
	const [component, setComponent] = useState<ReactNode>(null);
	const [closeCallback, setCloseCallback] = useState<CLOSE_COMPONENT_CALLBACK[]>([]);
	const { toggleAddingObstacle } = useMapContext();

	function onListClick(newActive: activeTab) {
		setActive({ key: newActive, controls: SIDEBAR_TABS[newActive] });
	}

	function callbackSwitch(callback: CLOSE_COMPONENT_CALLBACK) {
		switch (callback) {
			case "TOGGLE_ADDING_OBSTACLE":
				toggleAddingObstacle();
				break;
			default:
				break;
		}
	}

	function toggleSidebar() {
		closeCallback.forEach((callback) => callbackSwitch(callback));
		setOpen(!open);
		setCloseCallback([]);
		if (!open) setComponent(null);
	}

	return (
		<SidebarContext.Provider
			value={{
				open,
				active,
				onListClick,
				toggleSidebar,
				component,
				setComponent,
				setCloseCallback,
			}}
		>
			{children}
		</SidebarContext.Provider>
	);
}

export const useSidebarContext = () => {
	const context = useContext(SidebarContext);
	if (context === null) throw new Error("Use Map Context is null, must be used within MapProvider");
	return context;
};
