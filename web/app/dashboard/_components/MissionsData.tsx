import { Operations } from "@prisma/client";
import LineChartWithDropdown from "./LineChartWithDropdown";
import { OperationsWithPayload } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Minus, Target } from "lucide-react";
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Doughnut } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MissionsData({
	data,
	lineChartData,
	dataBreakdown,
	onLineChartOptionChange,
}: {
	data: { operations: Operations[]; loading: boolean };
	dataBreakdown: {
		assigned: OperationsWithPayload[];
		complete: OperationsWithPayload[];
		failed: OperationsWithPayload[];
		pending: OperationsWithPayload[];
		canceled: OperationsWithPayload[];
		severe: OperationsWithPayload[];
		moderate: OperationsWithPayload[];
		low: OperationsWithPayload[];
	};
	lineChartData: {
		data: { date: Date; count: number }[];
		loading: boolean;
		option: "Last 7 Days" | "Last 30 Days" | "Last 60 Days";
	};
	onLineChartOptionChange: (value: "Last 7 Days" | "Last 30 Days" | "Last 60 Days") => void;
}) {
	const percentages = useMemo(() => {
		const lowPercentage = (dataBreakdown.low.length / data.operations.length) * 100;
		const moderatePercentage = (dataBreakdown.moderate.length / data.operations.length) * 100;
		const severePercentage = (dataBreakdown.severe.length / data.operations.length) * 100;
		const assignedPercentage = (dataBreakdown.assigned.length / data.operations.length) * 100;
		const completePercentage = (dataBreakdown.complete.length / data.operations.length) * 100;
		const failedPercentage = (dataBreakdown.failed.length / data.operations.length) * 100;
		const canceledPercentage = (dataBreakdown.canceled.length / data.operations.length) * 100;
		const pendingPercentage = (dataBreakdown.pending.length / data.operations.length) * 100;

		return {
			lowPercentage,
			moderatePercentage,
			severePercentage,
			assignedPercentage,
			completePercentage,
			failedPercentage,
			canceledPercentage,
			pendingPercentage,
		};
	}, [
		data.operations.length,
		dataBreakdown.assigned.length,
		dataBreakdown.canceled.length,
		dataBreakdown.complete.length,
		dataBreakdown.failed.length,
		dataBreakdown.low.length,
		dataBreakdown.moderate.length,
		dataBreakdown.pending.length,
		dataBreakdown.severe.length,
	]);

	const urgencyFinalData = {
		labels: ["Low Urgency", "Moderate Urgency", "High Urgency"],
		datasets: [
			{
				data: [dataBreakdown.low.length, dataBreakdown.moderate.length, dataBreakdown.severe.length],
				backgroundColor: ["rgba(75, 192, 116, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(255, 99, 132, 0.2)"],
				borderColor: ["rgba(75, 192, 116, 1)", "rgba(255, 206, 86, 1)", "rgba(255, 99, 132, 1)"],
				borderWidth: 1,
			},
		],
	};

	const statusFinalData = {
		labels: ["Assigned", "Pending", "Cancelled", "Failed", "Complete"],
		datasets: [
			{
				data: [
					dataBreakdown.assigned.length,
					dataBreakdown.pending.length,
					dataBreakdown.canceled.length,
					dataBreakdown.failed.length,
					dataBreakdown.complete.length,
				],
				backgroundColor: [
					"rgba(75, 143, 192, 0.2)",
					"rgba(255, 238, 86, 0.2)",
					"rgba(255, 190, 99, 0.2)",
					"rgba(192, 75, 75, 0.2)",
					"rgba(75, 192, 97, 0.2)",
				],
				borderColor: ["rgba(75, 143, 192, 1)", "rgba(255, 238, 86, 1)", "rgba(255, 190, 99, 1)", "rgba(192, 75, 75, 1)", "rgba(75, 192, 97, 1)"],
				borderWidth: 1,
			},
		],
	};

	return (
		<div>
			<Card className="border-0 shadow-md">
				<CardHeader>
					<div className="mb-4">
						<h2 className="text-xl font-semibold">Missions Summary</h2>
					</div>
					<div className="flex">
						<div className="flex-1 flex">
							<div className="flex flex-col">
								<div className="flex">
									<div>
										<div className="p-4 rounded-full bg-neutral-100 border border-neutral-500 mr-4">
											<Target className="text-neutral-700" />
										</div>
									</div>
									<div>
										<CardTitle className="text-3xl font-bold">{data.operations.length}</CardTitle>
										<CardDescription>TOTAL MISSIONS</CardDescription>
									</div>
								</div>
								<div>
									<div className="flex items-center mt-4">
										<div className="p-1 rounded-full flex items-center justify-center bg-green-100 border border-green-500">
											<ChevronDown className="text-green-700" size={12} />
										</div>
										<div className="flex flex-col ml-2">
											<Label className="text-lg font-semibold">{isNaN(percentages.lowPercentage) ? 0 : percentages.lowPercentage.toFixed(2)}%</Label>
											<Label className="text-neutral-500 font-normal">Low Urgency ({dataBreakdown.low.length})</Label>
										</div>
									</div>
									<div className="flex items-center mt-4">
										<div className="p-1 rounded-full flex items-center justify-center bg-yellow-100 border border-yellow-500">
											<Minus className="text-yellow-700" size={12} />
										</div>
										<div className="flex flex-col ml-2">
											<Label className="text-lg font-semibold">
												{isNaN(percentages.moderatePercentage) ? 0 : percentages.moderatePercentage.toFixed(2)}%
											</Label>
											<Label className="text-neutral-500 font-normal">Moderate Urgency ({dataBreakdown.moderate.length})</Label>
										</div>
									</div>
									<div className="flex items-center mt-4">
										<div className="p-1 rounded-full flex items-center justify-center bg-red-100 border border-red-500">
											<ChevronUp className="text-red-700" size={12} />
										</div>
										<div className="flex flex-col ml-2">
											<Label className="text-lg font-semibold">
												{isNaN(percentages.severePercentage) ? 0 : percentages.severePercentage.toFixed(2)}%
											</Label>
											<Label className="text-neutral-500 font-normal">Severe Urgency ({dataBreakdown.severe.length})</Label>
										</div>
									</div>
									<div className="mt-10">
										<Link href="/missions">
											<Button variant="outline">Manage Missions</Button>
										</Link>
									</div>
								</div>
							</div>
							<div className="flex-1 flex items-center justify-center">
								<div className="h-[250px]">
									<Doughnut
										data={urgencyFinalData}
										options={{
											plugins: {
												legend: {
													display: false,
													position: "bottom" as const,
												},
											},
										}}
									/>
								</div>
							</div>
						</div>
						<div className="flex-1 flex">
							<div className="flex flex-col">
								<div>
									<div className="flex items-center">
										<div className="p-2 rounded-full flex items-center justify-center bg-blue-100 border border-blue-500"></div>
										<div className="flex flex-col ml-2">
											<Label className="text-lg font-semibold">
												{isNaN(percentages.assignedPercentage) ? 0 : percentages.assignedPercentage.toFixed(2)}%
											</Label>
											<Label className="text-neutral-500 font-normal">Assigned ({dataBreakdown.assigned.length})</Label>
										</div>
									</div>
									<div className="flex items-center mt-4">
										<div className="p-2 rounded-full flex items-center justify-center bg-yellow-100 border border-yellow-500"></div>
										<div className="flex flex-col ml-2">
											<Label className="text-lg font-semibold">
												{isNaN(percentages.pendingPercentage) ? 0 : percentages.pendingPercentage.toFixed(2)}%
											</Label>
											<Label className="text-neutral-500 font-normal">Pending ({dataBreakdown.pending.length})</Label>
										</div>
									</div>
									<div className="flex items-center mt-4">
										<div className="p-2 rounded-full flex items-center justify-center bg-orange-100 border border-orange-500"></div>
										<div className="flex flex-col ml-2">
											<Label className="text-lg font-semibold">
												{isNaN(percentages.canceledPercentage) ? 0 : percentages.canceledPercentage.toFixed(2)}%
											</Label>
											<Label className="text-neutral-500 font-normal">Cancelled ({dataBreakdown.canceled.length})</Label>
										</div>
									</div>
									<div className="flex items-center mt-4">
										<div className="p-2 rounded-full flex items-center justify-center bg-red-100 border border-red-500"></div>
										<div className="flex flex-col ml-2">
											<Label className="text-lg font-semibold">
												{isNaN(percentages.failedPercentage) ? 0 : percentages.failedPercentage.toFixed(2)}%
											</Label>
											<Label className="text-neutral-500 font-normal">Failed ({dataBreakdown.failed.length})</Label>
										</div>
									</div>
									<div className="flex items-center mt-4">
										<div className="p-2 rounded-full flex items-center justify-center bg-green-100 border border-green-500"></div>
										<div className="flex flex-col ml-2">
											<Label className="text-lg font-semibold">
												{isNaN(percentages.completePercentage) ? 0 : percentages.completePercentage.toFixed(2)}%
											</Label>
											<Label className="text-neutral-500 font-normal">Complete ({dataBreakdown.complete.length})</Label>
										</div>
									</div>
								</div>
							</div>
							<div className="flex-1 flex items-center justify-center">
								<div className="h-[250px]">
									<Doughnut
										data={statusFinalData}
										options={{
											plugins: {
												legend: {
													display: false,
													position: "bottom" as const,
												},
											},
										}}
									/>
								</div>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div>
						<LineChartWithDropdown
							labels={lineChartData.data.map((o) => new Date(o.date).toLocaleDateString())}
							data={lineChartData.data.map((o) => o.count)}
							option={lineChartData.option}
							loading={lineChartData.loading}
							options={[
								{ value: "Last 7 Days", onClick: () => onLineChartOptionChange("Last 7 Days") },
								{ value: "Last 30 Days", onClick: () => onLineChartOptionChange("Last 30 Days") },
								{ value: "Last 60 Days", onClick: () => onLineChartOptionChange("Last 60 Days") },
							]}
						/>
					</div>
					<div className="flex mt-2 mb-10"></div>
				</CardContent>
			</Card>
		</div>
	);
}
