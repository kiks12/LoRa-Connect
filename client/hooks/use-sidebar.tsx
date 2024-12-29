"use client";

import AdminControls from "@/app/map/_components/AdminControls";
import OwnersControls from "@/app/map/_components/OwnersControls";
import RescuersControls from "@/app/map/_components/RescuersControls";
import TasksControls from "@/app/map/_components/TasksControls";
import { createContext, ReactNode, useContext, useState } from "react";

export type activeTab = "ADMIN" | "TASKS" | "OWNERS" | "RESCUERS";
export const SIDEBAR_TABS: { [key: string]: ReactNode } = {
	ADMIN: <AdminControls />,
	TASKS: <TasksControls />,
	OWNERS: <OwnersControls />,
	RESCUERS: <RescuersControls />,
};

const SidebarContext = createContext<{
	open: boolean;
	active: { key: activeTab; controls: ReactNode };
	onListClick: (newActive: activeTab) => void;
	toggleSidebar: () => void;
	component: ReactNode | null;
	setComponent: React.Dispatch<React.SetStateAction<ReactNode>>;
	closeComponentCallback: () => void;
	setCloseComponentCallback: React.Dispatch<React.SetStateAction<() => void>>;
} | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(true);
	const [active, setActive] = useState<{ key: activeTab; controls: ReactNode }>({
		key: "ADMIN",
		controls: SIDEBAR_TABS["ADMIN"],
	});
	const [component, setComponent] = useState<ReactNode>(null);
	const [closeComponentCallback, setCloseComponentCallback] = useState<() => void>(() => () => {});

	function onListClick(newActive: activeTab) {
		setActive({ key: newActive, controls: SIDEBAR_TABS[newActive] });
	}

	function toggleSidebar() {
		closeComponentCallback();
		setOpen(!open);
		setCloseComponentCallback(() => () => {});
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
				closeComponentCallback,
				setCloseComponentCallback,
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
