import { lazy } from "react";

import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { SideBar } from "./_components/Sidebar";
import { MapProvider } from "@/hooks/use-map";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/hooks/use-sidebar";

const MapView = lazy(() => import("./_components/Map"));

export default function MapPage() {
	return (
		<MapProvider>
			<SidebarProvider>
				<main className="flex relative">
					<div className="flex-1 relative">
						<div className="absolute w-screen flex justify-between p-2 z-50">
							<div></div>
							<Button size="icon" variant="outline" className="flex md:hidden">
								<MenuIcon />
							</Button>
						</div>
						<div className="flex items-center justify-center h-screen z-10 transition-transform transform">
							<MapView />
						</div>
					</div>
					<div className={`hidden md:block min-w-[512px] max-w-lg h-screen shadow-lg z-40`}>
						<SideBar />
					</div>
				</main>
				<Toaster />
			</SidebarProvider>
		</MapProvider>
	);
}
