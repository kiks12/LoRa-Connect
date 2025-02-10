import Spinner from "@/app/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Bracelets } from "@prisma/client";
import { Watch } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function DevicesData({ data }: { data: { bracelets: Bracelets[]; loading: boolean } }) {
	const calculatedData = useMemo(() => {
		const deployed = data.bracelets.filter((b) => b.ownerId || b.rescuerId);
		const stock = data.bracelets.filter((b) => b.ownerId === null && b.rescuerId === null);
		const rescuerDevicesCount = data.bracelets.filter((b) => b.type === "RESCUER").length;
		const userDevicesCount = data.bracelets.length - rescuerDevicesCount;
		const stockRescuerDevicesCount = stock.filter((b) => b.type === "RESCUER").length;
		const stockUserDevicesCount = stock.length - rescuerDevicesCount;
		const deployedRescuerDevicesCount = deployed.filter((b) => b.type === "RESCUER").length;
		const deployedUserDevicesCount = deployed.length - deployedRescuerDevicesCount;

		return {
			deployed,
			stock,
			rescuerDevicesCount,
			userDevicesCount,
			stockRescuerDevicesCount,
			stockUserDevicesCount,
			deployedRescuerDevicesCount,
			deployedUserDevicesCount,
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
							<div className="flex flex-col">
								<div className="flex justify-between items-center">
									<div className="flex-1">
										<div className="flex flex-1 flex-col">
											<div className="flex items-center">
												<div>
													<div className="p-4 rounded-full bg-neutral-100 border border-neutral-500 mr-4">
														<Watch className="text-neutral-700" />
													</div>
												</div>
												<div>
													<CardTitle className="text-3xl font-bold">{data.bracelets.length}</CardTitle>
													<CardDescription>TOTAL DEVICES</CardDescription>
												</div>
											</div>
										</div>
										<div>
											<div className="mt-4 flex flex-1 items-center">
												<div className="flex flex-col">
													<Label className="text-xl font-semibold">{calculatedData.userDevicesCount}</Label>
													<Label className="text-neutral-500 font-normal">User Devices</Label>
												</div>
												<div className="flex flex-col ml-8">
													<Label className="text-xl font-semibold">{calculatedData.rescuerDevicesCount}</Label>
													<Label className="text-neutral-500 font-normal">Rescuer Devices</Label>
												</div>
											</div>
										</div>
									</div>

									<div className="flex-1">
										<div className="flex-1">
											<div>
												<CardTitle className="text-3xl font-bold">{calculatedData.deployed.length}</CardTitle>
												<CardDescription>TOTAL DEPLOYED</CardDescription>
											</div>
										</div>
										<div>
											<div className="mt-4 flex flex-1 items-center">
												<div className="flex flex-col">
													<Label className="text-xl font-semibold">{calculatedData.deployedUserDevicesCount}</Label>
													<Label className="text-neutral-500 font-normal">User Devices</Label>
												</div>
												<div className="flex flex-col ml-8">
													<Label className="text-xl font-semibold">{calculatedData.deployedRescuerDevicesCount}</Label>
													<Label className="text-neutral-500 font-normal">Rescuer Devices</Label>
												</div>
											</div>
										</div>
									</div>

									<div className="flex-1">
										<div className="flex-1">
											<div className="flex justify-between">
												<div>
													<CardTitle className="text-3xl font-bold">{calculatedData.stock.length}</CardTitle>
													<CardDescription>TOTAL STOCK</CardDescription>
												</div>
												<Link href="/bracelets">
													<Button variant="outline">Manage Devices</Button>
												</Link>
											</div>
										</div>
										<div>
											<div className="mt-4 flex flex-1 items-center">
												<div className="flex flex-col">
													<Label className="text-xl font-semibold">{calculatedData.stockUserDevicesCount}</Label>
													<Label className="text-neutral-500 font-normal">User Devices</Label>
												</div>
												<div className="flex flex-col ml-8">
													<Label className="text-xl font-semibold">{calculatedData.stockRescuerDevicesCount}</Label>
													<Label className="text-neutral-500 font-normal">Rescuer Devices</Label>
												</div>
											</div>
										</div>
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
