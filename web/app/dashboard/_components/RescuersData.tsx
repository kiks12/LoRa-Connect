import { RescuerWithBracelet } from "@/types";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMemo } from "react";
import { Ambulance } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import Spinner from "@/app/components/Spinner";
import { Button } from "@/components/ui/button";

export default function RescuersData({
	data,
	doughnutData,
}: {
	data: { rescuers: RescuerWithBracelet[]; loading: boolean };
	doughnutData: { data: number[]; labels: string[] };
}) {
	const withBracelets = useMemo(() => {
		const count = data.rescuers.filter((o) => o.bracelet).length;
		const percentage = (count / data.rescuers.length) * 100;

		return { count, percentage };
	}, [data.rescuers]);

	const finalData = {
		labels: doughnutData.labels,
		datasets: [
			{
				data: doughnutData.data,
				backgroundColor: [
					"rgba(255, 99, 132, 0.2)",
					"rgba(54, 162, 235, 0.2)",
					"rgba(255, 206, 86, 0.2)",
					"rgba(75, 192, 192, 0.2)",
					"rgba(153, 102, 255, 0.2)",
					"rgba(255, 159, 64, 0.2)",
				],
				borderColor: [
					"rgba(255, 99, 132, 1)",
					"rgba(54, 162, 235, 1)",
					"rgba(255, 206, 86, 1)",
					"rgba(75, 192, 192, 1)",
					"rgba(153, 102, 255, 1)",
					"rgba(255, 159, 64, 1)",
				],
				borderWidth: 1,
			},
		],
	};

	return (
		<div>
			<div className="flex flex-col md:flex-row mt-2">
				<div className="flex-1 mr-1">
					<Card className="border-0 shadow-md flex">
						{data.loading ? (
							<div className="p-10 flex flex-1 items-center justify-center">
								<Spinner />
							</div>
						) : (
							<>
								<div className="flex-1">
									<CardHeader>
										<div className="flex ">
											<div>
												<div className="p-4 rounded-full bg-amber-100 border border-amber-300 mr-4">
													<Ambulance className="text-amber-700" />
												</div>
											</div>
											<div>
												<CardTitle className="text-3xl font-bold">{data.rescuers.length}</CardTitle>
												<CardDescription>TOTAL RESCUERS</CardDescription>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="">
											<div className="flex flex-col">
												<Label className="text-lg font-semibold">{isNaN(withBracelets.percentage) ? 0 : withBracelets.percentage}%</Label>
												<Label className="text-neutral-500 font-normal">With Bracelets ({withBracelets.count})</Label>
											</div>
											<div className="flex flex-col mt-4">
												<Label className="text-lg font-semibold">{isNaN(withBracelets.percentage) ? 0 : 100 - withBracelets.percentage}%</Label>
												<Label className="text-neutral-500 font-normal">Without Bracelets ({data.rescuers.length - withBracelets.count})</Label>
											</div>
										</div>
										<div className="mt-10">
											<Link href="/rescuers">
												<Button variant="outline">Manage Rescuers</Button>
											</Link>
										</div>
									</CardContent>
								</div>
								<div className="p-6 flex-1">
									<Doughnut
										data={finalData}
										options={{
											plugins: {
												legend: {
													position: "bottom" as const,
												},
											},
										}}
									/>
								</div>
							</>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
}
