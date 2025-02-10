import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMapContext } from "@/hooks/use-map";
import { GraphHopperAPIResult } from "@/types";
import { Users } from "@prisma/client";
import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useEffect, useMemo, useState } from "react";

type listType = "RESCUERS" | "USERS" | "EVACUATION_CENTERS" | "OBSTACLES";
export type generalType = { name: string; type: listType; latitude: number | null; longitude: number | null };

export default function RoutingControls() {
	const [data, setData] = useState<GraphHopperAPIResult | null>(null);
	const [from, setFrom] = useState<generalType | null>(null);
	const [to, setTo] = useState<generalType | null>(null);
	const [list, setList] = useState<generalType[]>([]);
	const { users, rescuers, evacuationCenters, obstacles, createRoute, clearRoute } = useMapContext();
	const distance: null | number = useMemo(() => {
		if (!data) return null;
		const path = data?.paths[0];
		return path?.distance / 1000;
	}, [data]);
	const time: null | number = useMemo(() => {
		if (!data) return null;
		const path = data?.paths[0];
		return path.time / 1000 / 60;
	}, [data]);

	useEffect(() => {
		const mappedUsers: generalType[] = users.map((user: Users) => ({
			name: user.name,
			latitude: user.latitude,
			longitude: user.longitude,
			type: "USERS",
		}));
		const mappedRescuers: generalType[] = rescuers.map((rescuer) => ({
			name: rescuer.name,
			latitude: rescuer.latitude,
			longitude: rescuer.longitude,
			type: "RESCUERS",
		}));
		const mappedEvacuationCenters: generalType[] = evacuationCenters.map((evacuationCenter) => ({
			name: evacuationCenter.name,
			latitude: evacuationCenter.latitude,
			longitude: evacuationCenter.longitude,
			type: "EVACUATION_CENTERS",
		}));
		const mappedObstacles: generalType[] = obstacles.map((obstacle) => ({
			name: obstacle.name,
			latitude: obstacle.latitude,
			longitude: obstacle.longitude,
			type: "OBSTACLES",
		}));

		setList([...mappedUsers, ...mappedRescuers, ...mappedEvacuationCenters, ...mappedObstacles]);
	}, [users, rescuers, evacuationCenters, obstacles]);

	useEffect(() => {
		async function fetchGraphHopperAPI() {
			if (!from || !to) return;
			const res = await fetch(
				`http://localhost:8989/route?point=${from.latitude},${from.longitude}&point=${to.latitude},${to.longitude}&profile=car&points_encoded=false`
			);
			const json: GraphHopperAPIResult = await res.json();
			setData(json);
			createRoute(from, to, json);
		}

		fetchGraphHopperAPI();
	}, [createRoute, from, to]);

	function onFromListItemClick(obj: generalType) {
		setFrom(obj);
	}

	function onToListItemClick(obj: generalType) {
		setTo(obj);
	}

	function onClearRouteClick() {
		setFrom(null);
		setTo(null);
		setData(null);
		clearRoute();
	}

	return (
		<div>
			<div className="mt-4 flex justify-between items-center w-full">
				<div>
					<h2 className="text-lg font-medium">Create a route</h2>
					<Label className="text-neutral-500">Select start and destination</Label>
				</div>
				<Button variant="secondary" onClick={onClearRouteClick}>
					Clear Route
				</Button>
			</div>
			<div className="flex flex-col mt-4">
				<Label>From:</Label>
				<div className="w-full mt-2">
					<DropdownMenu>
						<DropdownMenuTrigger className="w-full">
							<Input value={from ? from?.name : ""} readOnly />
						</DropdownMenuTrigger>
						<DropdownMenuContent className="h-96 w-full overflow-auto">
							{list.map((item, index) =>
								!from?.name.toLowerCase().includes(item.name.toLowerCase()) ? (
									<ListItem key={index} obj={item} onClick={() => onFromListItemClick(item)} />
								) : (
									<div key={index}></div>
								)
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<div className="flex flex-col mt-4">
				<Label>To:</Label>
				<div className="w-full mt-2">
					<DropdownMenu>
						<DropdownMenuTrigger className="w-full">
							<Input value={to ? to?.name : ""} readOnly />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							{list.map((item, index) =>
								!from?.name.toLowerCase().includes(item.name.toLowerCase()) ? (
									<ListItem key={index} obj={item} onClick={() => onToListItemClick(item)} />
								) : (
									<div key={index}></div>
								)
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<div>
				<div className="flex items-center">
					{distance && (
						<Card className="border-0 shadow-none flex-1">
							<CardHeader className="p-0 py-6">
								<CardDescription>Distance</CardDescription>
								<CardTitle>{distance.toPrecision(2)} km</CardTitle>
							</CardHeader>
						</Card>
					)}
					{time && (
						<Card className="border-0 shadow-none flex-1">
							<CardHeader className="p-0">
								<CardDescription>Time</CardDescription>
								<CardTitle>{time.toPrecision(2)} mins.</CardTitle>
							</CardHeader>
						</Card>
					)}
				</div>
				<div className="flex flex-col max-h-[530px] overflow-auto ">
					{data &&
						data.paths[0].instructions.map((instruction, index) => {
							return (
								<Card className="mt-3 shadow-none" key={index}>
									<CardHeader>
										<CardDescription>{instruction.street_name}</CardDescription>
										<CardTitle>{instruction.text}</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex">
											<Label className="flex-1">{(instruction.distance / 1000).toPrecision(2)} km</Label>
											<Label className="flex-1">{(instruction.time / 1000 / 60).toPrecision(2)} mins.</Label>
										</div>
									</CardContent>
								</Card>
							);
						})}
				</div>
			</div>
		</div>
	);
}

function ListItem({ obj, onClick }: { obj: generalType; onClick: () => void }) {
	return (
		<DropdownMenuItem className="py-3 w-full" onClick={onClick}>
			<div className="flex flex-col">
				<Label className="text-xs text-neutral-400">{obj.type}</Label>
				<Label>{obj.name}</Label>
			</div>
		</DropdownMenuItem>
	);
}
