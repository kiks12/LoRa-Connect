"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ambulance, ArrowLeft, Ban, Hospital, Route, Shield, Users } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

const SIDEBAR_TABS: { [key: string]: { route: string; icon: ReactNode } } = {
	ADMIN: {
		route: "",
		icon: <Shield />,
	},
	USERS: {
		route: "users",
		icon: <Users />,
	},
	RESCUERS: {
		route: "rescuers",
		icon: <Ambulance />,
	},
	ROUTING: {
		route: "routing",
		icon: <Route />,
	},
	OBSTACLES: {
		route: "obstacles",
		icon: <Ban />,
	},
	EVACUATIONS: {
		route: "evacuations",
		icon: <Hospital />,
	},
};

export default function SideBar({ children }: { children: ReactNode }) {
	return (
		<>
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
					</div>
					<div className="flex-1">{children}</div>
				</Card>
				<Card className="h-screen py-6 w-36 shadow-none rounded-none">
					<ul>
						{Object.keys(SIDEBAR_TABS).map((tab, index) => {
							return (
								<Link href={`/map/${SIDEBAR_TABS[tab].route}`} key={index}>
									<li key={index} className={`flex flex-col justify-center items-center py-6 cursor-pointer hover:bg-neutral-100`}>
										{SIDEBAR_TABS[tab].icon}
										<p className="text-xs">{tab}</p>
									</li>
								</Link>
							);
						})}
					</ul>
				</Card>
			</div>
		</>
	);
}
