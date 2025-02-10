import { Container } from "./components/Container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Ambulance, HomeIcon, Hospital, LayoutDashboard, Map, Target, Users, Watch } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export const LINKS = [
	{ title: "Home", link: "/", icon: <HomeIcon size={32} />, subtitle: "Overview of your system" },
	{ title: "Map", link: "/map", icon: <Map size={32} />, subtitle: "Navigate your connected ecosystem" },
	{ title: "Dashboard", link: "/dashboard", icon: <LayoutDashboard size={32} />, subtitle: "Analyze performance and trends" },
	{ title: "Missions", link: "/missions", icon: <Target size={32} />, subtitle: "Track active and completed missions" },
	{ title: "Devices", link: "/bracelets", icon: <Watch size={36} />, subtitle: "Manage and assign tracking units" },
	{ title: "Users", link: "/users", icon: <Users size={34} />, subtitle: "View registered individuals" },
	{ title: "Rescuers", link: "/rescuers", icon: <Ambulance size={34} />, subtitle: "View registered rescuers" },
	{ title: "Evacuation Centers", link: "/evacuationCenters", icon: <Hospital size={32} />, subtitle: "Manage emergency accommodations" },
];

export default function Home() {
	return (
		<main className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
			<Container className="pt-10">
				<h1 className="text-2xl font-semibold tracking-tight">LoRa-Connect Control Center</h1>
				<div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{LINKS.map((value, index) => {
						return <HomeCard title={value.title} link={value.link} key={index} icon={value.icon} subtitle={value.subtitle} />;
					})}
				</div>
			</Container>
		</main>
	);
}

const HomeCard = ({ subtitle, title, link, icon }: { subtitle?: string; title: string; link: string; icon?: ReactNode }) => {
	return (
		<Link href={link}>
			<Card className="shadow-md hover:shadow-lg border-none justify-center items-center px-4 py-8 min-h-[215px]">
				<CardContent className="pt-4">
					<div className="flex flex-col items-center justify-center">
						{icon && <div>{icon}</div>}
						<h2 className="text-xl font-medium mt-4">{title}</h2>
						<p className="text-xs mt-2">{subtitle}</p>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
};
