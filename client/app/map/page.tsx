import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import Map from "./_components/Map";
import { SideBar } from "./_components/Sidebar";
import { MapProvider } from "@/hooks/use-map";
import { Toaster } from "@/components/ui/toaster";

export default function MapPage() {
	return (
		<MapProvider>
			<main className="flex">
				<div className="w-full lg:w-2/3 md:w-1/2 relative">
					<div className="absolute w-screen flex justify-between p-2 z-50">
						<div></div>
						<Button size="icon" variant="outline" className="flex md:hidden">
							<MenuIcon />
						</Button>
					</div>
					<div className="flex items-center justify-center h-screen z-10">
						<Map />
					</div>
				</div>
				<div className="hidden md:block lg:w-1/3 md:w-1/2 h-screen">
					<SideBar />
				</div>
			</main>
			<Toaster />
		</MapProvider>
	);
}
