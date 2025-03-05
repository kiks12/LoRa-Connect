import Spinner from "@/app/components/Spinner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useObstacles } from "@/hooks/map/use-obstacles";
import { RefreshCcw } from "lucide-react";
import ObstacleListItem from "./ObstacleListItem";
import ObstacleForm from "./ObstacleForm";
import { useState } from "react";

export default function ObstacleControls() {
	const {
		obstacles,
		showObstacles,
		removeObstacle,
		toggleShowObstacles,
		toggleAddingObstacle,
		toggleObstacleOnMap,
		removeObstacleMarkerFromMap,
		refreshObstacles,
		obstaclesLoading,
	} = useObstacles();
	const [showForm, setShowForm] = useState(false);

	function toggleShowForm() {
		toggleAddingObstacle();
		setShowForm(!showForm);
	}

	return (
		<div className="mt-2">
			{!showForm ? (
				<>
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
						<div className="max-h-96 min-h-96 overflow-y-auto">
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
						<Button className="w-full mt-2" variant="secondary" onClick={toggleShowForm}>
							Add Obstacle
						</Button>
					</div>
				</>
			) : (
				<>
					<ObstacleForm />
					<Button variant="ghost" onClick={toggleShowForm} className="w-full mt-2">
						Close
					</Button>
				</>
			)}
		</div>
	);
}
