"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Ban, ChevronLeft, Hospital, Printer, RefreshCcw } from "lucide-react";
import Link from "next/link";
import useDashboard from "@/hooks/use-dashboard";
import { Chart as ChartJs, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from "chart.js";
import { lazy } from "react";

const DataSection = lazy(() => import("./_components/DataSection"));
const UsersData = lazy(() => import("./_components/UsersData"));
const RescuersData = lazy(() => import("./_components/RescuersData"));
const DevicesData = lazy(() => import("./_components/BraceletsData"));
const MissionsData = lazy(() => import("./_components/MissionsData"));

ChartJs.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ArcElement, Tooltip, Legend);

export default function DashboardPage() {
	const {
		bracelets,
		users,
		usersDoughnut,
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
						<div className="mr-4 no-print">
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
					<div className="flex no-print">
						<Button variant="outline" onClick={refreshDashboard}>
							<RefreshCcw />
							Refresh
						</Button>
						<Button variant="default" className="ml-2" onClick={() => window.print()}>
							<Printer />
							Print
						</Button>
					</div>
				</div>
				<div className="mt-4">
					<DevicesData data={bracelets} />
				</div>
				<div className="flex flex-col lg:flex-row mt-4">
					<div className="flex-1 mr-2">
						<UsersData data={users} doughnutData={usersDoughnut} />
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
							title="Evacuation Centers Summary"
							description="Total Evacuation Centers"
							data={evacuationCenters.evacuationCenters.length}
						/>
					</div>
					<div className="flex-1 ml-2">
						<DataSection
							loading={obstacles.loading}
							title="Obstacles Summary"
							description="Total Obstacles"
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
