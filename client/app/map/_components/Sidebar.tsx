"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";
import OwnersControls from "./OwnersControls";
import TasksControls from "./TasksControls";
import AdminControls from "./AdminControls";
import RescuersControls from "./RescuersControls";

export type activeTab = "ADMIN" | "TASKS" | "OWNERS" | "RESCUERS";
const tabs: { [key: string]: ReactNode } = {
	ADMIN: <AdminControls />,
	TASKS: <TasksControls />,
	OWNERS: <OwnersControls />,
	RESCUERS: <RescuersControls />,
};

export function SideBar() {
	const [active, setActive] = useState<{ key: activeTab; controls: ReactNode }>({
		key: "ADMIN",
		controls: tabs["ADMIN"],
	});

	function onListClick(newActive: activeTab) {
		setActive({ key: newActive, controls: tabs[newActive] });
	}

	return (
		<div className="flex">
			<Card className="h-screen w-full p-6 shadow-none rounded-none flex flex-col">
				<div className="flex items-center">
					<Link href="/">
						<Button size="icon" variant="outline" className="rounded-full">
							<ArrowLeft />
						</Button>
					</Link>
					<h1 className="ml-2 text-xl font-semibold tracking-tight">Control Panel</h1>
				</div>
				<div className="flex-1">{active.controls}</div>
			</Card>
			<Card className="h-screen py-6 w-24 lg:w-36 shadow-none rounded-none">
				<ul>
					{Object.keys(tabs).map((tab, index) => {
						return (
							<li
								onClick={() => onListClick(tab as activeTab)}
								key={index}
								className={`flex justify-center items-center py-6 cursor-pointer hover:bg-neutral-100 ${active.key === tab ? "bg-neutral-100" : ""}`}
							>
								{tab}
							</li>
						);
					})}
				</ul>
			</Card>
		</div>
	);
}
