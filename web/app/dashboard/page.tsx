"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import TriDataSection from "./_components/TriDataSection";
import DataSection from "./_components/DataSection";
import useDashboard from "@/hooks/use-dashboard";
import DoughnutBreakdown from "./_components/DoughnutBreakdown";
import { Chart as ChartJs, ArcElement, Tooltip, Legend } from "chart.js";

ChartJs.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
	const { owners, ownersDoughnut, rescuers, rescuersDoughnut, evacuationCenters, obstacles } = useDashboard();

	return (
		<main className="min-w-screen min-h-screen bg-neutral-50">
			<div className="max-w-7xl mx-auto pt-10">
				<div className="flex items-center">
					<div className="mr-4">
						<Link href="/">
							<Button variant="outline" size="icon">
								<ChevronLeft />
							</Button>
						</Link>
					</div>
					<div>
						<h1 className="text-2xl font-semibold">LoRa-Connect Dashboard</h1>
						<Label>{new Date().toDateString()}</Label>
					</div>
				</div>
				<div className="flex flex-col lg:flex-row mt-4">
					<div className="flex-1 mr-1">
						<div>
							<Link href="/owners">
								<h2 className="text-xl font-medium hover:underline">Owners</h2>
							</Link>
						</div>
						<div className="flex flex-col md:flex-row mt-2">
							<div className="flex-1 mr-1">
								<TriDataSection
									loading={owners.loading}
									firstTitle="Total Owners"
									firstData={owners.owners.length}
									secondTitle="Owners w/ Bracelets"
									secondData={owners.owners.filter((o) => o.bracelet).length}
									thirdTitle="Owners w/o Bracelets"
									thirdData={owners.owners.filter((o) => !o.bracelet).length}
								/>
							</div>
							<div className="ml-1">
								<DoughnutBreakdown data={ownersDoughnut.data} labels={ownersDoughnut.labels} />
							</div>
						</div>
					</div>
					<div className="flex-1 ml-1">
						<div>
							<Link href="/rescuers">
								<h2 className="text-xl font-medium hover:underline">Rescuers</h2>
							</Link>
						</div>
						<div className="flex flex-col md:flex-row mt-2">
							<div className="mr-1">
								<DoughnutBreakdown data={rescuersDoughnut.data} labels={rescuersDoughnut.labels} />
							</div>
							<div className="flex-1 ml-1">
								<TriDataSection
									loading={rescuers.loading}
									firstTitle="Total Rescuers"
									firstData={rescuers.rescuers.length}
									secondTitle="Rescuers w/ Bracelets"
									secondData={rescuers.rescuers.filter((r) => r.bracelet).length}
									thirdTitle="Rescuers w/o Bracelets"
									thirdData={rescuers.rescuers.filter((r) => !r.bracelet).length}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="mt-4 flex">
					<div className="flex-1 mr-1">
						<DataSection loading={evacuationCenters.loading} title="Total Evacuation Centers" data={evacuationCenters.evacuationCenters.length} />
					</div>
					<div className="flex-1 ml-1">
						<DataSection loading={obstacles.loading} title="Total Obstacles" data={obstacles.obstacles.length} />
					</div>
				</div>
			</div>
		</main>
	);
}
