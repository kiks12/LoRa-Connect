"use client";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/contexts/AppContext";
import { MenuIcon } from "lucide-react";
import { MapProvider } from "@/contexts/MapContext";
import { ObstaclesProvider } from "@/contexts/ObstacleContext";
import { lazy } from "react";

const Map = lazy(() => import("./_components/Map"));
const SideBar = lazy(() => import("./_components/Sidebar"));
const SosModals = lazy(() => import("./_components/SosModals"));
const Timers = lazy(() => import("./_components/Timers"));

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<MapProvider>
			<AppProvider>
				<ObstaclesProvider>
					<main className="flex relative">
						<div className="flex-1 relative">
							<div className="absolute w-screen flex justify-between p-2 z-50">
								<div></div>
								<Button size="icon" variant="outline" className="flex md:hidden">
									<MenuIcon />
								</Button>
							</div>
							<div className="flex h-screen z-10 transition-transform transform">
								<Map key={"main-map"} />
								<div className="w-full absolute flex justify-between items-start">
									<div className="w-72 p-2">
										<SosModals />
									</div>
									<div className="w-72 p-2">
										<Timers />
									</div>
								</div>
							</div>
						</div>
						<div className={`hidden md:block min-w-[512px] max-w-lg h-screen shadow-lg z-40`}>
							<SideBar>{children}</SideBar>
						</div>
					</main>
				</ObstaclesProvider>
				<Toaster />
			</AppProvider>
		</MapProvider>
	);
}
