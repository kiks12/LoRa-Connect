import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MissionWithCost } from "@/types";
import { AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { URGENCY_MAP } from "./BraceletWithUserListItem";
import { formatName } from "@/lib/utils";

export default function MissionItem({ mission }: { mission: MissionWithCost }) {
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
					<AlertCircle className={`text-${URGENCY_MAP[mission.urgency!].color}-500`} />
					<p className={`text-${URGENCY_MAP[mission.urgency!].color}-500 ml-3`}>Urgency: {URGENCY_MAP[mission.urgency!].text}</p>
				</div>
				<div className="flex justify-between items-start mt-10">
					<div>
						<CardDescription className="text-xs text-neutral-500">User</CardDescription>
						<CardDescription className="text-neutral-900 font-medium">
							{formatName(mission.user.givenName, mission.user.middleName, mission.user.lastName, mission.user.suffix)}
						</CardDescription>
						<CardDescription className="text-neutral-500 mt-0">No. of People: {mission.user.numberOfMembersInFamily}</CardDescription>
					</div>
					<div>
						<CardDescription className="text-neutral-50">Status: </CardDescription>
						<CardDescription className="text-xs text-neutral-900 font-medium">{mission.status.toString()}</CardDescription>
					</div>
					<div className="">
						<CardDescription className="text-xs text-neutral-500">Team</CardDescription>
						<CardDescription className="text-neutral-900 font-medium">{mission.team.name}</CardDescription>
					</div>
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
			</CardHeader>
		</Card>
	);
}
