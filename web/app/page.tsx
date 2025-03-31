"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { Container } from "./components/Container";
import HOME_LINKS from "./links";
import Image from "next/image";

const HomeCard = lazy(() => import("./_components/HomeCard"));

export default function Home() {
	const [date, setDate] = useState<Date | null>(null);

	useEffect(() => {
		setInterval(() => setDate(new Date()), 1000);
	}, []);

	return (
		<main className="min-h-screen bg-[url(/bg.jpg)] bg-cover">
			<div className="flex items-center justify-center min-h-screen min-w-screen bg-white/50 backdrop-blur-xl">
				<Container className="pt-10 min-h-screen">
					<div className="flex justify-between items-center">
						<div className="flex flex-col">
							<Image src="/logos/single-line-transparent.png" height={10} width={300} alt="Logo" />
							<h2 className="text-2xl font-medium">Control Center</h2>
						</div>
						<div className="flex flex-col justify-end items-end">
							<Suspense>
								<div>
									<p>{date && date.toDateString()}</p>
								</div>
								<div>
									<p>{date && date.toTimeString()}</p>
								</div>
							</Suspense>
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
