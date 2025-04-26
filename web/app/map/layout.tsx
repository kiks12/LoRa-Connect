"use client";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/contexts/AppContext";
import { MapProvider } from "@/contexts/MapContext";
import { ObstaclesProvider } from "@/contexts/ObstacleContext";
import { Ban, Home, MenuIcon } from "lucide-react";
import { lazy, useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { useRouter } from "next/navigation";

const Map = lazy(() => import("./_components/Map"));
const SideBar = lazy(() => import("./_components/Sidebar"));
const SosModals = lazy(() => import("./_components/SosModals"));
const Timers = lazy(() => import("./_components/Timers"));
const MapLegend = lazy(() => import("./_components/MapLegend"));
const PacketLogs = lazy(() => import("./_components/PacketLogs"));

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const [graphhopperConnected, setGraphhopperConnected] = useState(false);
	const [graphhopperLoading, setGraphhopperLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		setGraphhopperLoading(true);
		fetch("http://localhost:8989")
			.then((res) => {
				if (res.status === 200) setGraphhopperConnected(true);
				else setGraphhopperConnected(false);
			})
			.catch((e) => console.error(e))
			.finally(() => setGraphhopperLoading(false));
	}, []);

	return (
		<>
			{graphhopperLoading ? (
				<Spinner />
			) : (
				<>
					{graphhopperConnected ? (
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
													<div className="w-full p-2">
														<SosModals />
													</div>
													<div className="w-72 p-2">
														<Timers />
													</div>
												</div>
												<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
													<MapLegend />
												</div>
											</div>
										</div>
										<div className={`hidden md:block min-w-[512px] max-w-lg h-screen shadow-lg z-40`}>
											<SideBar>{children}</SideBar>
										</div>
									</main>
									<PacketLogs />
									<Toaster />
								</ObstaclesProvider>
							</AppProvider>
						</MapProvider>
					) : (
						<main className="h-screen w-screen display flex items-center justify-center flex-col">
							<Ban size={150} />
							<h1 className="text-3xl font-semibold my-4">GraphHopper Routing Engine Error</h1>
							<p>
								Cannot connect to Graphhopper Routing Engine.{" "}
								<Button variant="link" onClick={() => location.reload()}>
									Click here to refresh page
								</Button>
							</p>

							<Button className="mt-4" onClick={() => router.push("/")}>
								<Home /> Home
							</Button>
						</main>
					)}
				</>
			)}
		</>
	);
}
