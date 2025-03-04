"use client";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/contexts/AppContext";
import { MenuIcon } from "lucide-react";
import { SideBar } from "./_components/Sidebar";
import Map from "./_components/Map";
import { MapProvider } from "@/contexts/MapContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<MapProvider>
			<AppProvider>
				<main className="flex relative">
					<div className="flex-1 relative">
						<div className="absolute w-screen flex justify-between p-2 z-50">
							<div></div>
							<Button size="icon" variant="outline" className="flex md:hidden">
								<MenuIcon />
							</Button>
						</div>
						<div className="flex items-center justify-center h-screen z-10 transition-transform transform">
							<Map key={"main-map"} />
						</div>
					</div>
					<div className={`hidden md:block min-w-[512px] max-w-lg h-screen shadow-lg z-40`}>
						<SideBar>{children}</SideBar>
					</div>
				</main>
				<Toaster />
			</AppProvider>
		</MapProvider>
	);
}
