"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMapContext } from "@/hooks/use-map";
import { OwnerWithBracelet } from "@/types";
import { OWNER_SOURCE_BASE } from "@/utils/tags";

export default function OwnersControls() {
	const { addOwnerPoint, owners, showOwnerLocations, setShowOwnerLocations, clearSourcesAndLayers, addOwnerArea } = useMapContext();

	function onOwnerItemClick(owner: OwnerWithBracelet) {
		addOwnerPoint(owner);
		addOwnerArea(owner);
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
							<Button variant="outline" onClick={() => clearSourcesAndLayers(OWNER_SOURCE_BASE)}>
								Clear
							</Button>
						</div>
						<TabsContent value="ALL">
							<ul className="h-[550px] overflow-y-auto">
								{owners.map((owner, index) => {
									return <OwnerListItem key={index} owner={owner} onClick={() => onOwnerItemClick(owner)} />;
								})}
							</ul>
						</TabsContent>
						<TabsContent value="WITH-BRACELET">
							<ul className="h-[550px] overflow-y-auto">
								{owners
									.filter((owner) => owner.bracelet)
									.map((owner, index) => {
										return <OwnerListItem key={index} owner={owner} onClick={() => onOwnerItemClick(owner)} />;
									})}
							</ul>
						</TabsContent>
						<TabsContent value="WITHOUT-BRACELET">
							<ul className="h-[550px] overflow-y-auto">
								{owners
									.filter((owner) => !owner.bracelet)
									.map((owner, index) => {
										return <OwnerListItem key={index} owner={owner} onClick={() => onOwnerItemClick(owner)} />;
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
					<Switch id="showLocations" checked={showOwnerLocations} onCheckedChange={() => setShowOwnerLocations(!showOwnerLocations)} />
				</div>
				{/* <div className="flex justify-between items-center my-2 border rounded-md p-3">
					<Label className="ml-3" htmlFor="monitorLocations">
						Monitor Owner Locations
					</Label>
					<Switch checked={monitorLocations} id="monitorLocations" onCheckedChange={() => setMonitorLocations(!monitorLocations)} />
				</div> */}
			</div>
		</div>
	);
}

function OwnerListItem({ owner, onClick }: { owner: OwnerWithBracelet; onClick: () => void }) {
	return (
		<Card className="my-1 shadow-none hover:shadow-sm cursor-pointer" onClick={onClick}>
			<CardHeader>
				<CardTitle>{owner.name}</CardTitle>
				<CardDescription>Created At: {new Date(owner.createdAt).toDateString()}</CardDescription>
			</CardHeader>
		</Card>
	);
}
