import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MissionWithCost } from "@/types";
import { useMemo } from "react";

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
				<div>
					<CardDescription className="text-neutral-500">User</CardDescription>
					<CardDescription className="text-neutral-900">{mission.user.name}</CardDescription>
					<CardDescription className="text-neutral-500 mt-0">No. of Members: {mission.user.numberOfMembersInFamily}</CardDescription>
				</div>
				<div className="">
					<CardDescription className="text-neutral-500">Team</CardDescription>
					<CardDescription className="text-neutral-900">{mission.team.name}</CardDescription>
				</div>
				<div className="flex mt-8">
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
