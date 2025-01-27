import Spinner from "@/app/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Bracelets } from "@prisma/client";
import { Watch } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function BraceletsData({ data }: { data: { bracelets: Bracelets[]; loading: boolean } }) {
	const calculatedData = useMemo(() => {
		const withOwners = data.bracelets.filter((b) => b.ownerId || b.rescuerId).length;
		const withOwnersPercentage = (withOwners / data.bracelets.length) * 100;
		const withoutOwners = data.bracelets.length - withOwners;
		const withoutOwnersPercentage = (withoutOwners / data.bracelets.length) * 100;
		const forRescuers = data.bracelets.filter((b) => b.type === "RESCUER").length;
		const forRescuersPercentage = (forRescuers / data.bracelets.length) * 100;
		const forVictims = data.bracelets.length - forRescuers;
		const forVictimsPercentage = (forVictims / data.bracelets.length) * 100;

		return {
			withOwners,
			withOwnersPercentage,
			withoutOwners,
			withoutOwnersPercentage,
			forRescuers,
			forRescuersPercentage,
			forVictims,
			forVictimsPercentage,
		};
	}, [data.bracelets]);

	return (
		<div>
			<Card className="w-full border-0 shadow-md">
				{data.loading ? (
					<div className="flex items-center justify-center py-10">
						<Spinner />
					</div>
				) : (
					<>
						<CardHeader>
							<div className="flex">
								<div className="flex flex-1 items-center">
									<div>
										<div className="p-4 rounded-full bg-neutral-100 border border-neutral-500 mr-4">
											<Watch className="text-neutral-700" />
										</div>
									</div>
									<div>
										<CardTitle className="text-3xl font-bold">{data.bracelets.length}</CardTitle>
										<CardDescription>TOTAL BRACELETS</CardDescription>
									</div>
									<div className="flex ml-8">
										<div className="flex flex-col">
											<Label className="text-lg font-semibold">
												{isNaN(calculatedData.withOwnersPercentage) ? 0 : calculatedData.withOwnersPercentage.toFixed(2)}%
											</Label>
											<Label className="text-neutral-500 font-normal">With holders ({calculatedData.withOwners})</Label>
										</div>
										<div className="flex flex-col ml-4">
											<Label className="text-lg font-semibold">
												{isNaN(calculatedData.withoutOwnersPercentage) ? 0 : calculatedData.withoutOwnersPercentage.toFixed(2)}%
											</Label>
											<Label className="text-neutral-500 font-normal">Without holders ({calculatedData.withoutOwners})</Label>
										</div>
									</div>
								</div>
								<div className="flex flex-1 justify-between items-center">
									<div className="flex ml-8">
										<div className="flex flex-col">
											<Label className="text-lg font-semibold">
												{isNaN(calculatedData.forVictimsPercentage) ? 0 : calculatedData.forVictimsPercentage.toFixed(2)}%
											</Label>
											<Label className="text-neutral-500 font-normal">For Victims/Owners({calculatedData.forVictims})</Label>
										</div>
										<div className="flex flex-col ml-4">
											<Label className="text-lg font-semibold">
												{isNaN(calculatedData.forRescuersPercentage) ? 0 : calculatedData.forRescuersPercentage.toFixed(2)}%
											</Label>
											<Label className="text-neutral-500 font-normal">For Rescuers({calculatedData.forRescuers})</Label>
										</div>
									</div>
									<div>
										<Link href="/bracelets">
											<Button variant="outline">Manage Bracelets</Button>
										</Link>
									</div>
								</div>
							</div>
						</CardHeader>
					</>
				)}
			</Card>
		</div>
	);
}
