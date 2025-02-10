"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Ban, ChevronLeft, Hospital, RefreshCcw } from "lucide-react";
import Link from "next/link";
import DataSection from "./_components/DataSection";
import useDashboard from "@/hooks/use-dashboard";
import { Chart as ChartJs, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from "chart.js";
import UsersData from "./_components/UsersData";
import RescuersData from "./_components/RescuersData";
import DevicesData from "./_components/BraceletsData";
import MissionsData from "./_components/MissionsData";

ChartJs.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ArcElement, Tooltip, Legend);

export default function DashboardPage() {
	const {
		bracelets,
		owners,
		ownersDoughnut,
		rescuers,
		rescuersDoughnut,
		evacuationCenters,
		obstacles,
		operationsBreakdown,
		operations,
		operationsLineChartData,
		onOperationsLineChartOptionChange,
		refreshDashboard,
	} = useDashboard();

	return (
		<main className="min-w-screen min-h-screen bg-neutral-50">
			<div className="max-w-7xl mx-auto pt-10">
				<div className="flex items-center justify-between">
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
					<div className="flex">
						<Button variant="outline" onClick={refreshDashboard}>
							<RefreshCcw />
							Refresh
						</Button>
					</div>
				</div>
				<div className="mt-4">
					<DevicesData data={bracelets} />
				</div>
				<div className="flex flex-col lg:flex-row mt-4">
					<div className="flex-1 mr-2">
						<UsersData data={owners} doughnutData={ownersDoughnut} />
					</div>
					<div className="flex-1 ml-2">
						<RescuersData data={rescuers} doughnutData={rescuersDoughnut} />
					</div>
				</div>
				<div className="mt-8 flex">
					<div className="flex-1 mr-2">
						<DataSection
							icon={
								<div className="p-4 rounded-full bg-blue-100 border border-blue-300 ">
									<Hospital className="text-blue-700" />
								</div>
							}
							link="/evacuationCenters"
							loading={evacuationCenters.loading}
							title="Total Evacuation Centers"
							data={evacuationCenters.evacuationCenters.length}
						/>
					</div>
					<div className="flex-1 ml-2">
						<DataSection
							loading={obstacles.loading}
							title="Total Obstacles"
							data={obstacles.obstacles.length}
							icon={
								<div className="p-4 rounded-full bg-red-100 border border-red-300 ">
									<Ban className="text-red-700" />
								</div>
							}
						/>
					</div>
				</div>
				<div className="mt-8">
					<MissionsData
						data={operations}
						dataBreakdown={operationsBreakdown}
						lineChartData={operationsLineChartData}
						onLineChartOptionChange={onOperationsLineChartOptionChange}
					/>
				</div>
			</div>
		</main>
	);
}
