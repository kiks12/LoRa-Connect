"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMapContext } from "@/hooks/use-map";
import { OwnerWithStatusIdentifier } from "@/types";
import { OWNER_SOURCE_BASE } from "@/utils/tags";
import OwnerListItem from "./OwnerListItem";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { RefreshCcw } from "lucide-react";

export default function OwnersControls() {
	const {
		addOwnerPoint,
		owners,
		showOwnerLocations,
		setShowOwnerLocations,
		clearSourcesAndLayers,
		addOwnerArea,
		clearOwnerShowStatuses,
		filterSearchOwner,
		refreshOwners,
	} = useMapContext();
	const [search, setSearch] = useState("");

	function onOwnerItemClick(owner: OwnerWithStatusIdentifier) {
		addOwnerPoint(owner);
		addOwnerArea(owner);
	}

	function onClearClick() {
		clearSourcesAndLayers(OWNER_SOURCE_BASE);
		clearOwnerShowStatuses();
	}

	function onChange(e: React.FormEvent<HTMLInputElement>) {
		setSearch(e.currentTarget.value);
		filterSearchOwner(e.currentTarget.value);
	}

	return (
		<div className="pt-6 pb-2 h-full flex flex-col justify-content">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-medium">Owners List</h2>
				<Button size="icon" variant="secondary" onClick={refreshOwners}>
					<RefreshCcw />
				</Button>
			</div>
			<div className="flex-1 overflow-y-auto">
				<div>
					<div className="flex justify-between items-center mt-2 border rounded-md p-3">
						<Label className="ml-3" htmlFor="showLocations">
							Show Locations
						</Label>
						<Switch id="showLocations" checked={showOwnerLocations} onCheckedChange={() => setShowOwnerLocations(!showOwnerLocations)} />
					</div>
					<div className="my-2">
						<Label>Search Owner</Label>
						<Input placeholder="Francis Tolentino..." onChange={onChange} value={search} />
					</div>
					<Tabs defaultValue="ALL">
						<div className="flex justify-between">
							<TabsList>
								<TabsTrigger value="ALL">All</TabsTrigger>
								<TabsTrigger value="WITH-BRACELET">W/ Bracelet</TabsTrigger>
								<TabsTrigger value="WITHOUT-BRACELET">W/O Bracelet</TabsTrigger>
							</TabsList>
							<Button variant="outline" onClick={onClearClick}>
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
				<Button className="w-full">Send Evacuation Instructions</Button>
			</div>
		</div>
	);
}
