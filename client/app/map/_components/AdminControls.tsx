import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMapContext } from "@/hooks/use-map";
import EvacuationCenterListItem from "./EvacuationCenterListItem";
import ObstacleListItem from "./ObstacleListItem";
import { useSidebarContext } from "@/hooks/use-sidebar";
import ObstacleForm from "./ObstacleForm";

export default function AdminControls() {
	const {
		monitorLocations,
		toggleMonitorLocations,
		evacuationCenters,
		showEvacuationCenters,
		toggleShowEvacuationCenters,
		obstacles,
		showObstacles,
		removeObstacle,
		toggleShowObstacles,
		toggleAddingObstacle,
		toggleObstacleOnMap,
		removeObstacleMarkerFromMap,
	} = useMapContext();
	const { toggleSidebar, setComponent, setCloseCallback } = useSidebarContext();

	function onAddObstacleClick() {
		toggleAddingObstacle();
		toggleSidebar();

		setComponent(<ObstacleForm />);
		setCloseCallback(["TOGGLE_ADDING_OBSTACLE"]);
	}

	return (
		<div className="pt-6 pb-2 h-full flex flex-col justify-between">
			<div>
				<div className="flex justify-between items-center my-2 border rounded-md p-3">
					<Label className="ml-3" htmlFor="monitorLocations">
						Monitor Bracelet Locations
					</Label>
					<Switch checked={monitorLocations} id="monitorLocations" onCheckedChange={toggleMonitorLocations} />
				</div>
				<div className="mt-2">
					<h2 className="text-lg font-medium">Obstacles</h2>
					<div className="flex justify-between items-center my-2 border rounded-md p-3">
						<Label className="ml-3" htmlFor="showObstacles">
							Show Obstacles
						</Label>
						<Switch checked={showObstacles} id="showObstacles" onCheckedChange={toggleShowObstacles} />
					</div>
					<div className="max-h-56 min-h-56 overflow-y-auto">
						{obstacles.length === 0 ? (
							<div className="text-center my-6">
								<Label>No Obstacles</Label>
							</div>
						) : (
							obstacles.map((obstacle, index) => {
								return (
									<ObstacleListItem
										obstacle={obstacle}
										key={index}
										onClick={toggleObstacleOnMap}
										onDelete={async () => {
											await removeObstacleMarkerFromMap(obstacle.obstacleId);
											removeObstacle(obstacle);
										}}
									/>
								);
							})
						)}
					</div>
					<div>
						<Button className="w-full mt-2" variant="secondary" onClick={onAddObstacleClick}>
							Add Obstacle
						</Button>
					</div>
				</div>
			</div>
			<div>
				<div className="mt-2">
					<h2 className="text-lg font-medium">Evacuation Centers</h2>
					<div className="flex justify-between items-center my-2 border rounded-md p-3">
						<Label className="ml-3" htmlFor="showEvacuationCenters">
							Show Evacuation Centers
						</Label>
						<Switch checked={showEvacuationCenters} id="showEvacuationCenters" onCheckedChange={toggleShowEvacuationCenters} />
					</div>
					<div className="max-h-54 min-h-56 overflow-y-auto">
						{evacuationCenters.map((evacuationCenter, index) => {
							return <EvacuationCenterListItem evacuationCenter={evacuationCenter} key={index} />;
						})}
					</div>
					<Button className="w-full mt-2">Send Evacuation Instruction</Button>
				</div>
			</div>
		</div>
	);
}
