"use client";

import { lazy } from "react";
import { Container } from "./components/Container";
import HOME_LINKS from "./links";

const HomeCard = lazy(() => import("./_components/HomeCard"));

export default function Home() {
	return (
		<main className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
			<Container className="pt-10">
				<h1 className="text-2xl font-semibold tracking-tight">LoRa-Connect Control Center</h1>
				<div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{HOME_LINKS.map((value, index) => {
						return <HomeCard title={value.title} link={value.link} key={index} icon={value.icon} subtitle={value.subtitle} />;
					})}
				</div>
			</Container>
		</main>
	);
}
