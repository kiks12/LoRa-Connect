import Spinner from "@/app/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
			<Card className="mt-2 shadow-md border-0">
				<CardContent className="p-4">
					<div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<div>
									<Button variant="outline">
										{option} <ChevronDown />
									</Button>
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
					<div>
						{loading ? (
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
									labels: labels,
									datasets: [
										{
											label: "Operations",
											data: data,
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
		</div>
	);
}
