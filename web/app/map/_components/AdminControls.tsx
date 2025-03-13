import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdmin } from "@/hooks/map/use-admin";
import MissionItem from "./MissionItem";

export default function AdminControls() {
	const {
		monitorLocations,
		toggleMonitorLocations,
		automaticTaskAllocation,
		toggleAutomaticTaskAllocation,
		runTaskAllocation,
		missions,
		sendTasksViaLoRa,
		taskAllocationMessage,
		clearRoutes,
	} = useAdmin();

	return (
		<div className="pt-6 pb-2 h-full flex flex-col justify-between">
			<div>
				<div className="flex justify-between items-center my-2 border rounded-md p-3">
					<Label className="ml-3" htmlFor="monitorLocations">
						Monitor Bracelet Locations
					</Label>
					<Switch checked={monitorLocations} id="monitorLocations" onCheckedChange={toggleMonitorLocations} />
				</div>
				<div className="flex justify-between items-center my-2 border rounded-md p-3">
					<Label className="ml-3" htmlFor="automaticTaskAllocation">
						Automatic Task Allocation
					</Label>
					<Switch checked={automaticTaskAllocation} id="automaticTaskAllocation" onCheckedChange={toggleAutomaticTaskAllocation} />
				</div>
				<div>
					<Button className="w-full" onClick={runTaskAllocation}>
						{taskAllocationMessage}
					</Button>
					<Button className="w-full mt-2" variant="secondary" onClick={sendTasksViaLoRa}>
						Send Task via LoRa
					</Button>
				</div>
			</div>
			<div className="flex-1 flex flex-col mt-2 max-h-[600px] overflow-y-auto">
				<div className="flex w-full justify-between items-center">
					<h2 className="font-medium text-lg mt-2">Missions</h2>
					<Button className="ml-2" variant="outline" onClick={clearRoutes}>
						Clear Routes
					</Button>
				</div>
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
								<div key={index} className="mt-2">
									<MissionItem mission={mission} />
								</div>
							);
						})}
					</>
				)}
			</div>
		</div>
	);
}
