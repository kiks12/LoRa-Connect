import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/contexts/AppContext";

export default function Timers() {
	const { timeIntervals } = useAppContext();

	function formatMillisecondsToMMSS(milliseconds: number): string {
		const minutes = Math.floor(milliseconds / 60000); // Convert to minutes
		const seconds = Math.floor((milliseconds % 60000) / 1000); // Remaining seconds

		// Ensure two-digit formatting
		const formattedMinutes = String(minutes).padStart(2, "0");
		const formattedSeconds = String(seconds).padStart(2, "0");

		return `${formattedMinutes}:${formattedSeconds}`;
	}

	return (
		<>
			{timeIntervals.length > 0 && (
				<>
					<Card>
						<CardHeader>
							{timeIntervals.map((time, index) => {
								return (
									<div key={index} className="mb-2">
										<p className="font-semibold">{time.title}</p>
										<p className="text-xs">{formatMillisecondsToMMSS(time.time)} Remaining</p>
										<Progress className="mt-2" value={100 - (time.time / time.max) * 100} />
									</div>
								);
							})}
						</CardHeader>
					</Card>
				</>
			)}
		</>
	);
}
