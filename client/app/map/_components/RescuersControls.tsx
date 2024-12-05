import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMapContext } from "@/hooks/use-map";
import { RescuerWithBracelet } from "@/types";
import { RESCUER_SOURCE_BASE } from "@/utils/tags";
import { useEffect, useState } from "react";

export default function RescuersControls() {
	const { clearSourcesAndLayers, addRescuerPoint, addRescuerArea } = useMapContext();
	const [rescuers, setRescuers] = useState<RescuerWithBracelet[]>([]);
	const [showLocations, setShowLocations] = useState(false);
	const [monitorLocations, setMonitorLocations] = useState(false);

	useEffect(() => {
		async function getRescuers() {
			return (await fetch("/api/rescuers")).json();
		}

		getRescuers().then(({ rescuers }) => setRescuers(rescuers));
	}, []);

	useEffect(() => {
		if (!showLocations) {
			clearSourcesAndLayers(RESCUER_SOURCE_BASE);
			return;
		}
		rescuers.forEach((rescuer) => addRescuerPoint(rescuer, true));
	}, [addRescuerPoint, clearSourcesAndLayers, rescuers, showLocations]);

	function onRescuerItemClick(rescuer: RescuerWithBracelet) {
		addRescuerPoint(rescuer);
		addRescuerArea(rescuer);
	}

	return (
		<div className="py-6 h-full flex flex-col justify-content">
			<h2 className="text-md">Owners List</h2>
			<div className="flex-1 overflow-y-auto">
				<div>
					<Tabs defaultValue="ALL">
						<div className="flex justify-between">
							<TabsList>
								<TabsTrigger value="ALL">All</TabsTrigger>
								<TabsTrigger value="WITH-BRACELET">W/ Bracelet</TabsTrigger>
								<TabsTrigger value="WITHOUT-BRACELET">W/O Bracelet</TabsTrigger>
							</TabsList>
							<Button variant="outline" onClick={() => clearSourcesAndLayers()}>
								Clear
							</Button>
						</div>
						<TabsContent value="ALL">
							<ul className="h-[550px] overflow-y-auto">
								{rescuers.map((rescuer, index) => {
									return <RescuerListItem key={index} rescuer={rescuer} onClick={() => onRescuerItemClick(rescuer)} />;
								})}
							</ul>
						</TabsContent>
						<TabsContent value="WITH-BRACELET">
							<ul className="h-[550px] overflow-y-auto">
								{rescuers
									.filter((rescuer) => rescuer.bracelet)
									.map((rescuer, index) => {
										return <RescuerListItem key={index} rescuer={rescuer} onClick={() => onRescuerItemClick(rescuer)} />;
									})}
							</ul>
						</TabsContent>
						<TabsContent value="WITHOUT-BRACELET">
							<ul className="h-[550px] overflow-y-auto">
								{rescuers
									.filter((rescuer) => !rescuer.bracelet)
									.map((rescuer, index) => {
										return <RescuerListItem key={index} rescuer={rescuer} onClick={() => onRescuerItemClick(rescuer)} />;
									})}
							</ul>
						</TabsContent>
					</Tabs>
				</div>
			</div>
			<div>
				<div className="flex justify-between items-center my-2 border rounded-md p-3">
					<Label className="ml-3" htmlFor="showLocations">
						Show Locations
					</Label>
					<Switch id="showLocations" checked={showLocations} onCheckedChange={() => setShowLocations(!showLocations)} />
				</div>
				<div className="flex justify-between items-center my-2 border rounded-md p-3">
					<Label className="ml-3" htmlFor="monitorLocations">
						Monitor Owner Locations
					</Label>
					<Switch checked={monitorLocations} id="monitorLocations" onCheckedChange={() => setMonitorLocations(!monitorLocations)} />
				</div>
			</div>
		</div>
	);
}

function RescuerListItem({ rescuer, onClick }: { rescuer: RescuerWithBracelet; onClick: () => void }) {
	return (
		<Card className="my-1 shadow-none hover:shadow-sm cursor-pointer" onClick={onClick}>
			<CardHeader>
				<CardTitle>{rescuer.name}</CardTitle>
				<CardDescription>Created At: {new Date(rescuer.createdAt).toDateString()}</CardDescription>
			</CardHeader>
		</Card>
	);
}
