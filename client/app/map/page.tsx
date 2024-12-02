import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MenuIcon } from "lucide-react";
import Link from "next/link";
import Map from "./_components/Map";

export default function MapPage() {
	return (
		<main className="flex">
			<div className="w-full relative">
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
			<div className="hidden md:block w-1/4 md:w-1/3 h-screen">
				<Card className="h-screen p-6 shadow-none rounded-none">
					<div className="flex items-center">
						<Link href="/">
							<Button size="icon" variant="outline" className="rounded-full">
								<ArrowLeft />
							</Button>
						</Link>
						<h1 className="ml-2 text-xl font-semibold tracking-tight">Control Panel</h1>
					</div>
				</Card>
			</div>
		</main>
	);
}
