import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdmin } from "@/hooks/map/use-admin";

export default function AdminControls() {
	const { monitorLocations, runTaskAllocation, missions, taskAllocationMessage } = useAdmin();

	return (
		<div className="pt-6 pb-2 h-full flex flex-col justify-between">
			<div>
				<div className="flex justify-between items-center my-2 border rounded-md p-3">
					<Label className="ml-3" htmlFor="monitorLocations">
						Monitor Bracelet Locations
					</Label>
					<Switch checked={monitorLocations} id="monitorLocations" onCheckedChange={() => {}} />
				</div>
				<div>
					<Button className="w-full" onClick={runTaskAllocation}>
						{taskAllocationMessage}
					</Button>
				</div>
			</div>
			<div className="flex-1 flex flex-col">
				<h2 className="font-medium text-lg mt-2">Missions</h2>
				{missions.length === 0 ? (
					<>
						<div className="flex items-center justify-center h-56">
							<p>No Missions to Show</p>
						</div>
					</>
				) : (
					<>
						{missions.map((mission, index) => {
							return (
								<Card key={index} className="shadow-none hover:shadow-sm ">
									<CardHeader>
										<div>
											<CardDescription className="text-neutral-500">User</CardDescription>
											<CardDescription className="text-neutral-900">{mission.user.name}</CardDescription>
											<CardDescription className="text-neutral-500 mt-0">No. of Members: {mission.user.numberOfMembersInFamily}</CardDescription>
										</div>
										<div className="">
											<CardDescription className="text-neutral-500">Team</CardDescription>
											<CardDescription className="text-neutral-900">{mission.team.name}</CardDescription>
										</div>
										<div className="flex mt-8">
											<div className="flex-1">
												<CardDescription>Distance</CardDescription>
												<CardTitle>{mission.distance.toPrecision(2)} km</CardTitle>
											</div>
											<div className="flex-1">
												<CardDescription>Time</CardDescription>
												<CardTitle>{mission.time.toPrecision(2)} mins.</CardTitle>
											</div>
										</div>
									</CardHeader>
								</Card>
							);
						})}
					</>
				)}
			</div>
		</div>
	);
}
