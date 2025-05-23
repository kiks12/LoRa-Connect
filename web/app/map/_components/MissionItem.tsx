import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MissionWithCost } from "@/types";
import { AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { URGENCY_MAP } from "./BraceletWithUserListItem";
import { formatName } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function MissionItem({
	mission,
	completeMission,
}: {
	mission: MissionWithCost;
	completeMission: (mission: MissionWithCost) => Promise<void>;
}) {
	const distance: null | number = useMemo(() => {
		if (!mission) return null;
		if (typeof mission.distance === "undefined") return null;
		return mission?.distance / 1000;
	}, [mission]);
	const time: null | number = useMemo(() => {
		if (!mission) return null;
		if (typeof mission.time === "undefined") return null;
		return mission.time / 1000 / 60;
	}, [mission]);

	return (
		<Card className="shadow-none hover:shadow-sm ">
			<CardHeader>
				<div className="flex items-center">
					<AlertCircle />
					<p className={`ml-3`}>Urgency: {mission.urgency ? URGENCY_MAP[mission.urgency].text : "No urgency"}</p>
				</div>
				<div className="flex justify-between items-start mt-10">
					<div>
						<CardDescription className="text-xs text-neutral-500">User</CardDescription>
						<CardDescription className="text-neutral-900 font-medium">
							{formatName(mission.user.givenName, mission.user.middleName, mission.user.lastName, mission.user.suffix)}
						</CardDescription>
						<CardDescription className="text-neutral-500 mt-0">No. of People: {mission.user.numberOfMembersInFamily}</CardDescription>
					</div>
					<div className="">
						<CardDescription className="text-xs text-neutral-500">Team</CardDescription>
						<CardDescription className="text-neutral-900 font-medium">{mission.Teams.name}</CardDescription>
					</div>
				</div>
				<div className="mt-4 flex items-center ">
					<CardDescription className="text-neutral-500">Status: </CardDescription>
					<CardDescription className="text-xs ml-2 text-neutral-900 font-medium">{mission.status.toString()}</CardDescription>
				</div>
				<div className="flex mt-10">
					<div className="flex-1">
						<CardDescription>Distance</CardDescription>
						<CardTitle>{distance?.toPrecision(2)} km</CardTitle>
					</div>
					<div className="flex-1">
						<CardDescription>Time</CardDescription>
						<CardTitle>{time?.toPrecision(2)} mins.</CardTitle>
					</div>
				</div>
				<div>
					<Button className="w-full mt-2" onClick={() => completeMission(mission)}>
						Complete
					</Button>
				</div>
			</CardHeader>
		</Card>
	);
}
