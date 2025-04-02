"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { Container } from "./components/Container";
import HOME_LINKS from "./links";
import Image from "next/image";
import { useAccountContext } from "@/contexts/AccountContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const HomeCard = lazy(() => import("./_components/HomeCard"));
const LoginForm = lazy(() => import("./_components/LoginForm"));

export default function Home() {
	const { toast } = useToast();
	const { account, setAccount } = useAccountContext();
	const [date, setDate] = useState<string | null>(null);

	useEffect(() => {
		// Run only on client after mount
		const updateDate = () => {
			setDate(new Date().toLocaleString()); // Use locale string to ensure proper formatting
		};
		updateDate(); // Set initial date
		const interval = setInterval(updateDate, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<>
			{account === null ? (
				<LoginForm />
			) : (
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
											<p>{date ?? "Loading..."}</p> {/* Prevent hydration mismatch */}
										</div>
									</Suspense>
									<div className="mt-2">
										<Button
											variant="outline"
											onClick={() => {
												toast({
													description: "You are now logged out",
												});
												setAccount(null);
											}}
										>
											Logout
										</Button>
									</div>
								</div>
							</div>
							<motion.div
								initial={{ scale: 0.75, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.2, ease: "easeOut" }}
								className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1"
							>
								{HOME_LINKS.map((value, index) => (
									<HomeCard title={value.title} link={value.link} key={index} icon={value.icon} subtitle={value.subtitle} />
								))}
							</motion.div>
						</Container>
					</div>
				</main>
			)}
		</>
	);
}
