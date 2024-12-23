import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMapContext } from "@/hooks/use-map";

export default function AdminControls() {
	const { monitorLocations, toggleMonitorLocations } = useMapContext();

	return (
		<div className="py-6 h-full flex flex-col justify-content">
			<h2 className="text-md">Owners List</h2>
			<div>
				<div className="flex justify-between items-center my-2 border rounded-md p-3">
					<Label className="ml-3" htmlFor="monitorLocations">
						Monitor Locations
					</Label>
					<Switch checked={monitorLocations} id="monitorLocations" onCheckedChange={toggleMonitorLocations} />
				</div>
			</div>
		</div>
	);
}
