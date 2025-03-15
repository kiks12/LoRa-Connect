"use client";

import { lazy, useMemo } from "react";
import { Container } from "./components/Container";
import HOME_LINKS from "./links";

const HomeCard = lazy(() => import("./_components/HomeCard"));

export default function Home() {
	const date = useMemo(() => {
		return new Date();
	}, []);

	return (
		<main className="bg-gradient-to-br from-white to-slate-300 min-h-screen bg-[url(/bg.jpg)] bg-cover">
			<div className="flex items-center justify-center min-h-screen min-w-screen bg-white/30 backdrop-blur-2xl">
				<Container className="pt-10 min-h-screen">
					<div className="flex justify-between items-end">
						<div className="">
							<h1 className="text-3xl font-semibold tracking-normal">LoRa-Connect</h1>
							<h2 className="text-xl font-medium">Control Center</h2>
						</div>
						<div className="flex flex-col justify-end items-end">
							<p>{date.toDateString()}</p>
							<p>{date.toTimeString()}</p>
						</div>
					</div>
					<div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
						{HOME_LINKS.map((value, index) => {
							return <HomeCard title={value.title} link={value.link} key={index} icon={value.icon} subtitle={value.subtitle} />;
						})}
					</div>
				</Container>
			</div>
		</main>
	);
}
