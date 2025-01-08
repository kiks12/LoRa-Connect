"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { activeTab, SIDEBAR_TABS, useSidebarContext } from "@/hooks/use-sidebar";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";

export function SideBar() {
	const { active, onListClick, toggleSidebar, open, component } = useSidebarContext();

	return (
		<>
			{open ? (
				<div className="flex w-full justify-between">
					<Card className="h-screen w-full p-6 shadow-none rounded-none flex flex-col">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<Link href="/">
									<Button size="icon" variant="outline" className="rounded-full">
										<ArrowLeft />
									</Button>
								</Link>
								<h1 className="ml-2 text-xl font-semibold tracking-tight">Control Panel</h1>
							</div>
							<div>
								<Button size="icon" variant="ghost" onClick={toggleSidebar}>
									<ChevronRight />
								</Button>
							</div>
						</div>
						<div className="flex-1">{active.controls}</div>
					</Card>
					<Card className="h-screen py-6 w-24 lg:w-36 shadow-none rounded-none">
						<ul>
							{Object.keys(SIDEBAR_TABS).map((tab, index) => {
								return (
									<li
										onClick={() => onListClick(tab as activeTab)}
										key={index}
										className={`flex justify-center items-center py-6 cursor-pointer hover:bg-neutral-100 ${
											active.key === tab ? "bg-neutral-100" : ""
										}`}
									>
										{tab}
									</li>
								);
							})}
						</ul>
					</Card>
				</div>
			) : (
				<Card className="flex flex-col w-full h-full items-end shadow-none rounded-none p-6">
					<div className="flex justify-end">
						<Button size="icon" variant="outline" onClick={toggleSidebar}>
							{component !== null ? <X /> : <ChevronLeft />}
						</Button>
					</div>
					{component}
				</Card>
			)}
		</>
	);
}
