import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RESCUER_SOURCE_BASE } from "@/utils/tags";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { RefreshCcw } from "lucide-react";
import Spinner from "@/app/components/Spinner";
import { useRescuers } from "@/hooks/map/use-rescuers";
import TeamItem from "@/app/(withHeader)/teams/_components/TeamItem";
import { useMapContext } from "@/contexts/MapContext";

export default function RescuersControls() {
	const { clearSourcesAndLayers } = useMapContext();
	const { teams, clearRescuerShowStatuses, clearTeamShowStatuses, refreshRescuers, rescuersLoading, onShowLocation } = useRescuers();
	const [search, setSearch] = useState("");

	function onClearClick() {
		clearSourcesAndLayers(RESCUER_SOURCE_BASE);
		clearRescuerShowStatuses();
		clearTeamShowStatuses();
	}

	function onChange(e: React.FormEvent<HTMLInputElement>) {
		setSearch(e.currentTarget.value);
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
					{/* <div className="flex justify-between items-center mt-2 border rounded-md p-3">
						<Label className="ml-3" htmlFor="showLocations">
							Show Locations
						</Label>
						<Switch id="showLocations" checked={showRescuersLocations} onCheckedChange={() => setShowRescuersLocations(!showRescuersLocations)} />
					</div> */}
					<div className="my-2">
						<Label>Search Rescuer</Label>
						<div className="flex">
							<Input className="flex-1" placeholder="Rescuer Name..." onChange={onChange} value={search} />
							<Button className="ml-2" variant="outline" onClick={onClearClick}>
								Clear
							</Button>
						</div>
					</div>

					{rescuersLoading ? (
						<div className="mt-10 flex items-center justify-center">
							<Spinner />
						</div>
					) : (
						<>
							<ul className="h-[550px] overflow-y-auto">
								{/* {rescuers.length > 0 ? (
											rescuers.map((rescuer, index) => {
												if (rescuer.name.toLowerCase().includes(search.toLowerCase()))
													return (
														<BraceletWithUserListItem
															key={index}
															name={rescuer.name}
															showing={rescuer.showing}
															onShowLocation={() => addRescuerPoint(rescuer)}
														/>
													);
											})
										) : (
											<p className="text-center mt-20">No Rescuers to show</p>
										)} */}
								{teams.length > 0 ? (
									teams
										.filter((team) => team.name?.includes(search.toLowerCase()))
										.map((team, index) => {
											return (
												<div className="mb-2" key={index}>
													<TeamItem team={team} forMap={true} onShowLocationOnMap={() => onShowLocation(team)} />
												</div>
											);
										})
								) : (
									<p className="text-center mt-20">No Teams to show</p>
								)}
							</ul>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
