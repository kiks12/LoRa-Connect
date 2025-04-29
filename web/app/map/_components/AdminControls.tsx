import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdmin } from "@/hooks/map/use-admin";
import MissionItem from "./MissionItem";
import { useAppContext } from "@/contexts/AppContext";

export default function AdminControls() {
	const { monitorLocations } = useAppContext();
	const {
		toggleMonitorLocations,
		automaticTaskAllocation,
		toggleAutomaticTaskAllocation,
		runTaskAllocation,
		missions,
		taskAllocationMessage,
		clearRoutes,
		sendTasksViaLoRa,
		saveTasksAsMissionsToDatabase,
		setShowRoutes,
	} = useAdmin();

	return (
		<div className="pt-6 pb-2 h-full flex flex-col justify-between">
			<div>
				<div className="flex justify-between items-center my-2 border rounded-md p-3">
					<Label className="ml-3" htmlFor="monitorLocations">
						Monitor Device Locations
					</Label>
					<Switch checked={monitorLocations} id="monitorLocations" onCheckedChange={toggleMonitorLocations} />
				</div>
				<div className="my-2 border rounded-md p-3">
					<div className="flex justify-between items-center">
						<Label className="ml-3" htmlFor="automaticTaskAllocation">
							Automatic Task Allocation
						</Label>
						<Switch checked={automaticTaskAllocation} id="automaticTaskAllocation" onCheckedChange={toggleAutomaticTaskAllocation} />
					</div>
					<div>
						<Label className="ml-3 text-xs font-light text-neutral-500 font-italic">This will run and send the task automatically</Label>
					</div>
				</div>
				<div>
					<Button className="w-full" onClick={runTaskAllocation}>
						{taskAllocationMessage}
					</Button>
					<Button className="w-full mt-2" variant="secondary" onClick={() => sendTasksViaLoRa(false)} disabled={missions.length === 0}>
						Send Task via LoRa
					</Button>
					<Button className="w-full mt-2" variant="secondary" disabled={missions.length === 0} onClick={saveTasksAsMissionsToDatabase}>
						Save to Database
					</Button>
				</div>
			</div>
			<div className="flex-1 flex flex-col mt-2 max-h-[600px] overflow-y-auto">
				<div className="flex w-full justify-between items-center">
					<h2 className="font-medium text-lg mt-2">Missions</h2>
					<div>
						<Button className="ml-2" variant="outline" onClick={() => setShowRoutes((prev) => !prev)}>
							Show Routes
						</Button>
						<Button className="ml-2" variant="outline" onClick={clearRoutes}>
							Clear Routes
						</Button>
					</div>
				</div>
				{missions.length === 0 ? (
					<>
						<div className="flex items-center justify-center h-56">
							<p>No Missions to Show</p>
						</div>
					</>
				) : (
					<>
						{missions
							.filter((mission) => mission.urgency === 1)
							.map((mission, index) => {
								return (
									<div key={index} className="mt-2">
										<MissionItem mission={mission} />
									</div>
								);
							})}
						{missions
							.filter((mission) => mission.urgency === 0.5)
							.map((mission, index) => {
								return (
									<div key={index} className="mt-2">
										<MissionItem mission={mission} />
									</div>
								);
							})}
						{missions
							.filter((mission) => mission.urgency === 0.2)
							.map((mission, index) => {
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
