import { Container } from "./components/Container";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const LINKS = [
	{ title: "Home", link: "/" },
	{ title: "Map", link: "/map" },
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Missions", link: "/missions" },
	{ title: "Bracelets", link: "/bracelets" },
	{ title: "Users", link: "/users" },
	{ title: "Rescuers", link: "/rescuers" },
	{ title: "Evacuation Centers", link: "/evacuationCenters" },
];

export default function Home() {
	return (
		<main>
			<Container>
				<h1 className="text-2xl mt-10 font-semibold tracking-tight">LoRa-Connect Control Center</h1>
				<div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{LINKS.map((value, index) => {
						return <HomeCard title={value.title} link={value.link} key={index} />;
					})}
				</div>
			</Container>
		</main>
	);
}

const HomeCard = ({ title, link }: { title: string; link: string }) => {
	return (
		<Link href={link}>
			<Card className="border-l-4 border-l-neutral-950 flex shadow-none justify-center items-center px-4 py-8 hover:shadow-md">
				<CardContent>
					<h2 className="text-xl">{title}</h2>
				</CardContent>
			</Card>
		</Link>
	);
};
