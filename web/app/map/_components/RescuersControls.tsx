import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMapContext } from "@/hooks/use-map";
import { RESCUER_SOURCE_BASE } from "@/utils/tags";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { RefreshCcw } from "lucide-react";
import Spinner from "@/app/components/Spinner";
import BraceletWithOwnerListItem from "./BraceletWithOwnerListItem";

export default function RescuersControls() {
	const {
		rescuers,
		showRescuersLocations,
		setShowRescuersLocations,
		clearSourcesAndLayers,
		addRescuerPoint,
		addRescuerArea,
		clearRescuerShowStatuses,
		filterSearchRescuer,
		refreshRescuers,
		rescuersLoading,
	} = useMapContext();
	const [search, setSearch] = useState("");

	function onClearClick() {
		clearSourcesAndLayers(RESCUER_SOURCE_BASE);
		clearRescuerShowStatuses();
	}

	function onChange(e: React.FormEvent<HTMLInputElement>) {
		setSearch(e.currentTarget.value);
		filterSearchRescuer(e.currentTarget.value);
	}

	return (
		<div className="py-6 h-full flex flex-col justify-content">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-medium">Rescuers List</h2>
				<Button size="icon" variant="secondary" onClick={refreshRescuers}>
					<RefreshCcw />
				</Button>
			</div>
			<div className="flex-1 overflow-y-auto">
				<div>
					<div className="flex justify-between items-center mt-2 border rounded-md p-3">
						<Label className="ml-3" htmlFor="showLocations">
							Show Locations
						</Label>
						<Switch id="showLocations" checked={showRescuersLocations} onCheckedChange={() => setShowRescuersLocations(!showRescuersLocations)} />
					</div>
					<div className="my-2">
						<Label>Search Rescuer</Label>
						<Input placeholder="Rescuer Name..." onChange={onChange} value={search} />
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
						{rescuersLoading ? (
							<div className="mt-10 flex items-center justify-center">
								<Spinner />
							</div>
						) : (
							<>
								<TabsContent value="ALL">
									<ul className="h-[550px] overflow-y-auto">
										{rescuers.length > 0 ? (
											rescuers.map((rescuer, index) => {
												return (
													<BraceletWithOwnerListItem
														key={index}
														name={rescuer.name}
														showing={rescuer.showing}
														onShowArea={() => addRescuerArea(rescuer)}
														onShowLocation={() => addRescuerPoint(rescuer)}
													/>
												);
											})
										) : (
											<p className="text-center mt-20">No Rescuers to show</p>
										)}
									</ul>
								</TabsContent>
								<TabsContent value="WITH-BRACELET">
									<ul className="h-[550px] overflow-y-auto">
										{rescuers.length > 0 ? (
											rescuers
												.filter((rescuer) => rescuer.bracelet)
												.map((rescuer, index) => {
													return (
														<BraceletWithOwnerListItem
															key={index}
															name={rescuer.name}
															showing={rescuer.showing}
															onShowArea={() => addRescuerArea(rescuer)}
															onShowLocation={() => addRescuerPoint(rescuer)}
														/>
													);
												})
										) : (
											<p className="text-center mt-20">No Rescuers to show</p>
										)}
									</ul>
								</TabsContent>
								<TabsContent value="WITHOUT-BRACELET">
									<ul className="h-[550px] overflow-y-auto">
										{rescuers.length > 0 ? (
											rescuers
												.filter((rescuer) => !rescuer.bracelet)
												.map((rescuer, index) => {
													return (
														<BraceletWithOwnerListItem
															key={index}
															name={rescuer.name}
															showing={rescuer.showing}
															onShowArea={() => addRescuerArea(rescuer)}
															onShowLocation={() => addRescuerPoint(rescuer)}
														/>
													);
												})
										) : (
											<p className="text-center mt-20">No Rescuers to show</p>
										)}
									</ul>
								</TabsContent>
							</>
						)}
					</Tabs>
				</div>
			</div>
		</div>
	);
}
