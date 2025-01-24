"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft } from "lucide-react";
import Link from "next/link";
import TriDataSection from "./_components/TriDataSection";
import DataSection from "./_components/DataSection";
import useDashboard from "@/hooks/use-dashboard";
import DoughnutBreakdown from "./_components/DoughnutBreakdown";
import { Chart as ChartJs, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from "chart.js";
import { Line } from "react-chartjs-2";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Spinner from "../components/Spinner";

ChartJs.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ArcElement, Tooltip, Legend);

export default function DashboardPage() {
	const {
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
	} = useDashboard();

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
						<DataSection
							link="/evacuationCenters"
							loading={evacuationCenters.loading}
							title="Total Evacuation Centers"
							data={evacuationCenters.evacuationCenters.length}
						/>
					</div>
					<div className="flex-1 ml-1">
						<DataSection loading={obstacles.loading} title="Total Obstacles" data={obstacles.obstacles.length} />
					</div>
				</div>
				<div className="mt-4">
					<div>
						<Link href="/missions">
							<h2 className="text-xl font-medium hover:underline">Missions</h2>
						</Link>
					</div>
					<div className="mt-2 flex">
						<div className="flex-1 mr-1">
							<DataSection loading={operations.loading} title="LOW URGENCY" data={operationsBreakdown.low.length} />
						</div>
						<div className="flex-1 mx-1">
							<DataSection loading={operations.loading} title="MODERATE URGENCY" data={operationsBreakdown.moderate.length} />
						</div>
						<div className="flex-1 ml-1">
							<DataSection loading={operations.loading} title="SEVERE URGENCY" data={operationsBreakdown.severe.length} />
						</div>
					</div>
					<Card className="mt-2 shadow-md border-0">
						<CardContent className="p-4">
							<div>
								<DropdownMenu>
									<DropdownMenuTrigger>
										<Button variant="outline">
											{operationsLineChartData.option} <ChevronDown />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem onClick={() => onOperationsLineChartOptionChange("Last 7 Days")}>Last 7 Days</DropdownMenuItem>
										<DropdownMenuItem onClick={() => onOperationsLineChartOptionChange("Last 30 Days")}>Last 30 Days</DropdownMenuItem>
										<DropdownMenuItem onClick={() => onOperationsLineChartOptionChange("Last 60 Days")}>Last 60 Days</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div>
								{operationsLineChartData.loading ? (
									<div className="flex items-center justify-center">
										<Spinner />
									</div>
								) : (
									<Line
										options={{
											responsive: true,
											plugins: {
												legend: {
													position: "top" as const,
												},
											},
										}}
										data={{
											labels: operationsLineChartData.data.map((o) => new Date(o.date).toLocaleDateString()),
											datasets: [
												{
													label: "Operations",
													data: operationsLineChartData.data.map((o) => o.count),
													fill: true,
													borderColor: "rgba(75,192,192,1)", // Line color
													backgroundColor: "rgba(75,192,192,0.5)",
													tension: 0.1, // Smooth curves
												},
											],
										}}
									/>
								)}
							</div>
						</CardContent>
					</Card>

					<div className="flex mt-2 mb-10">
						<div className="flex-1 mr-1">
							<DataSection loading={operations.loading} title="ASSIGNED" data={operationsBreakdown.assigned.length} />
						</div>
						<div className="flex-1 mx-1">
							<DataSection loading={operations.loading} title="PENDING" data={operationsBreakdown.pending.length} />
						</div>
						<div className="flex-1 mx-1">
							<DataSection loading={operations.loading} title="CANCELED" data={operationsBreakdown.canceled.length} />
						</div>
						<div className="flex-1 mx-1">
							<DataSection loading={operations.loading} title="COMPLETE" data={operationsBreakdown.complete.length} />
						</div>
						<div className="flex-1 ml-1">
							<DataSection loading={operations.loading} title="FAILED" data={operationsBreakdown.failed.length} />
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
