import Spinner from "@/app/components/Spinner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Line } from "react-chartjs-2";

export default function LineChartWithDropdown({
	option,
	options,
	loading,
	labels,
	data,
}: {
	loading: boolean;
	option: string;
	options: { value: string; onClick: () => void }[];
	labels: string[];
	data: number[];
}) {
	return (
		<div>
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold">Missions Trends</h2>
				</div>
				<div>
					<DropdownMenu>
						<DropdownMenuTrigger>
							<div className="flex items-center p-2 px-4 border shadow-sm rounded-lg text-sm">
								{option} <ChevronDown className="ml-2" />
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							{options.map((o, index) => {
								return (
									<DropdownMenuItem onClick={o.onClick} key={index}>
										{o.value}
									</DropdownMenuItem>
								);
							})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<div className="flex items-center justify-center">
				{loading ? (
					<div className="flex items-center justify-center">
						<Spinner />
					</div>
				) : (
					<Line
						className="w-full"
						height={80}
						options={{
							responsive: true,
							plugins: {
								legend: {
									position: "top" as const,
								},
							},
						}}
						data={{
							labels: labels,
							datasets: [
								{
									label: "Operations",
									data: data,
									fill: true,
									borderColor: "rgba(75,192,192,1)", // Line color
									backgroundColor: "rgba(75,192,192,0.5)",
									tension: 0.5, // Smooth curves
								},
							],
						}}
					/>
				)}
			</div>
		</div>
	);
}
