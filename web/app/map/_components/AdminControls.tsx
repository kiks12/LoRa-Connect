import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import EvacuationCenterListItem from "./EvacuationCenterListItem";
import ObstacleListItem from "./ObstacleListItem";
import { useSidebarContext } from "@/hooks/use-sidebar";
import ObstacleForm from "./ObstacleForm";
import Spinner from "@/app/components/Spinner";
import { RefreshCcw } from "lucide-react";
import EvacuationInstructionButton from "./EvacuationInstructionButton";
import { useEffect, useState } from "react";
import { useUsers } from "@/hooks/map/use-users";
import { useEvacuations } from "@/hooks/map/use-evacuations";
import { useMap } from "@/hooks/map/use-map";

export default function AdminControls() {
	const { users } = useUsers();
	const {
		evacuationCenters,
		showEvacuationCenters,
		toggleShowEvacuationCenters,
		evacuationCentersLoading,
		refreshEvacuationCenters,
		evacuationInstructions,
		createEvacuationInstructions,
		calculatingEvacuationInstructions,
		setEvacuationInstructionMessage,
	} = useEvacuations();
	// const {} = useObstacles();
	const {
		monitorLocations,
		toggleMonitorLocations,
		obstacles,
		showObstacles,
		removeObstacle,
		toggleShowObstacles,
		toggleAddingObstacle,
		toggleObstacleOnMap,
		removeObstacleMarkerFromMap,
		refreshObstacles,
		obstaclesLoading,
	} = useMap();
	const { toggleSidebar, setComponent, setCloseCallback } = useSidebarContext();
	const [runEvacuationInstructionAlgorithm, setRunEvacuationInstructionAlgorithm] = useState(false);
	const [rerunEvacuationInstructionAlgorithm, setRerunEvacuationInstructionAlgorithm] = useState(false);

	function onAddObstacleClick() {
		toggleAddingObstacle();
		toggleSidebar();

		setComponent(<ObstacleForm />);
		setCloseCallback(["TOGGLE_ADDING_OBSTACLE"]);
	}

	useEffect(() => {
		if (rerunEvacuationInstructionAlgorithm) createEvacuationInstructions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rerunEvacuationInstructionAlgorithm]);

	useEffect(() => {
		if (runEvacuationInstructionAlgorithm && evacuationInstructions.length === 0) createEvacuationInstructions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [users, evacuationCenters, runEvacuationInstructionAlgorithm]);

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
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-medium">Obstacles</h2>
						<Button size="icon" variant="secondary" onClick={refreshObstacles}>
							<RefreshCcw />
						</Button>
					</div>
					<div className="flex justify-between items-center my-2 border rounded-md p-3">
						<Label className="ml-3" htmlFor="showObstacles">
							Show Obstacles
						</Label>
						<Switch checked={showObstacles} id="showObstacles" onCheckedChange={toggleShowObstacles} />
					</div>
					{obstaclesLoading ? (
						<div className="flex items-center justify-center mt-10">
							<Spinner />
						</div>
					) : (
						<div className="max-h-56 min-h-56 overflow-y-auto">
							{obstacles.length > 0 ? (
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
							) : (
								<div className="h-56 flex items-center justify-center my-10">
									<p>No Obstacles to show</p>
								</div>
							)}
						</div>
					)}
					<div>
						<Button className="w-full mt-2" variant="secondary" onClick={onAddObstacleClick}>
							Add Obstacle
						</Button>
					</div>
				</div>
			</div>
			<div>
				<div className="mt-2">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-medium">Evacuation Centers</h2>
						<Button size="icon" variant="secondary" onClick={refreshEvacuationCenters}>
							<RefreshCcw />
						</Button>
					</div>
					<div className="flex justify-between items-center my-2 border rounded-md p-3">
						<Label className="ml-3" htmlFor="showEvacuationCenters">
							Show Evacuation Centers
						</Label>
						<Switch checked={showEvacuationCenters} id="showEvacuationCenters" onCheckedChange={toggleShowEvacuationCenters} />
					</div>
					{evacuationCentersLoading ? (
						<div className="flex items-center justify-center mt-10">
							<Spinner />
						</div>
					) : (
						<div className="max-h-56 min-h-56 overflow-y-auto">
							{evacuationCenters && evacuationCenters.length > 0 ? (
								evacuationCenters.map((evacuationCenter, index) => {
									return <EvacuationCenterListItem evacuationCenter={evacuationCenter} key={index} />;
								})
							) : (
								<div className="h-56 flex items-center justify-center my-10">
									<p>No Evacuation Centers to show</p>
								</div>
							)}
						</div>
					)}
					<EvacuationInstructionButton
						onRerunClick={() => setRerunEvacuationInstructionAlgorithm(!rerunEvacuationInstructionAlgorithm)}
						onOpenChange={() => setRunEvacuationInstructionAlgorithm(!runEvacuationInstructionAlgorithm)}
						setMessage={setEvacuationInstructionMessage}
						calculatingEvacuationInstructions={calculatingEvacuationInstructions}
						evacuationCenterInstructions={evacuationInstructions}
						createEvacuationInstructions={createEvacuationInstructions}
					/>
				</div>
			</div>
		</div>
	);
}
