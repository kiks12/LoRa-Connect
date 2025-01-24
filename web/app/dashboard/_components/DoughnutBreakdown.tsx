import { Card, CardContent } from "@/components/ui/card";
import { Doughnut } from "react-chartjs-2";

export default function DoughnutBreakdown({ data, labels }: { data: number[]; labels: string[] }) {
	const finalData = {
		labels: labels,
		datasets: [
			{
				data: data,
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
		<Card className="border-0 shadow-md">
			<CardContent className="p-4">
				<div className="w-full flex items-center justify-center">
					<Doughnut data={finalData} />
				</div>
			</CardContent>
		</Card>
	);
}
