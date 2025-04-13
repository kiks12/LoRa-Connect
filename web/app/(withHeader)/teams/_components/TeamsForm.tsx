"use client";

import { useEffect, useMemo, useState } from "react";
import RescuerItem from "./RescuerItem";
import { RescuerWithBracelet, TeamWithRescuer } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/app/components/Spinner";

export default function TeamsForm({ existingTeam, type = "CREATE" }: { existingTeam?: TeamWithRescuer | null; type?: "CREATE" | "UPDATE" }) {
	const { toast } = useToast();
	const [rescuers, setRescuers] = useState<RescuerWithBracelet[]>([]);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [team, setTeams] = useState<TeamWithRescuer>(
		existingTeam ?? {
			name: "",
			teamId: 0,
			createdAt: new Date(),
			rescuers: [],
		}
	);
	const loraBraceletEquipped = useMemo(() => {
		const withBracelet = team.rescuers.filter((rescuer) => rescuer.bracelet);
		return withBracelet.length > 0 ? withBracelet[0] : null;
	}, [team.rescuers]);

	useEffect(() => {
		async function fetchRescuers() {
			const result = await fetch("/api/rescuers/no-teams");
			const json = await result.json();
			return json;
		}

		fetchRescuers().then(({ rescuers }) => setRescuers(rescuers));
	}, []);

	function onSetTeamName(newVal: string) {
		setTeams((prev) => ({
			...prev,
			name: newVal,
		}));
	}

	function addRescuerToTeam(rescuer: RescuerWithBracelet) {
		const memberWithBracelet = team.rescuers.filter((d) => d.bracelet);
		if (memberWithBracelet.length > 0 && rescuer.bracelet) {
			const confirmResult = confirm("You already have a member with bracelet, do you wish to replace?");
			if (confirmResult) {
				setTeams((prev) => {
					return {
						...prev,
						rescuers: [...prev.rescuers.filter((d) => !d.bracelet), rescuer],
					};
				});
				setRescuers(
					(prev) =>
						[...prev.filter((prevRescuer) => rescuer.rescuerId !== prevRescuer.rescuerId), memberWithBracelet[0]].sort(
							(a, b) => a.rescuerId - b.rescuerId
						) as RescuerWithBracelet[]
				);
			}
			return;
		}

		setTeams((prev) => {
			return {
				...prev,
				rescuers: [...prev.rescuers, rescuer].sort((a, b) => a.rescuerId - b.rescuerId),
			};
		});
		setRescuers((prev) => prev.filter((prevRescuer) => rescuer.rescuerId !== prevRescuer.rescuerId));
	}

	function deleteRescuerFromTeam(rescuer: RescuerWithBracelet) {
		setTeams((prev) => {
			return {
				...prev,
				rescuers: prev.rescuers.filter((prevRescuer) => prevRescuer.rescuerId !== rescuer.rescuerId),
			};
		});
		setRescuers((prev) => [...prev, rescuer].sort((a, b) => a.rescuerId - b.rescuerId));
	}

	async function submit() {
		setSubmitLoading(true);
		if (team.rescuers.length <= 0) {
			toast({
				variant: "destructive",
				title: "Empty Roster",
				description: "Please select from the rescuers pool",
			});
			setSubmitLoading(false);
			return;
		}

		if (team.rescuers.length < 2) {
			toast({
				variant: "destructive",
				title: "Insufficient Members",
				description: "Please select at least 2 members for the team",
			});
			setSubmitLoading(false);
			return;
		}

		if (team.rescuers.filter((rescuer) => rescuer.bracelet).length === 0) {
			toast({
				variant: "destructive",
				title: "Team without bracelet",
				description: "Please select a rescuer with equipped with bracelet",
			});
			setSubmitLoading(false);
			return;
		}

		if (team.name === "") {
			toast({
				variant: "destructive",
				title: "Invalid Name",
				description: "Please enter a team name",
			});
			setSubmitLoading(false);
			return;
		}

		if (type === "CREATE") await onCreateSubmit();
		else await onUpdateSubmit();
		setSubmitLoading(false);
	}

	async function onCreateSubmit() {
		const res = await fetch("/api/teams/new", {
			method: "POST",
			body: JSON.stringify({ ...team }),
		});
		const { message } = await res.json();
		if (message.includes("Unique constraint failed on the constraint: `Teams_name_key`")) {
			toast({
				variant: "destructive",
				title: "Registration Failed",
				description: "Team name is already used",
			});
		} else {
			toast({
				variant: res.status === 200 ? "default" : "destructive",
				title: res.status === 200 ? "Successful Registration" : "Registration Failed",
				description: message,
			});
		}
	}

	async function onUpdateSubmit() {
		const res = await fetch(`/api/teams/update`, {
			method: "PUT",
			body: JSON.stringify({ existingTeam, newTeam: team }),
		});
		const { message } = await res.json();
		toast({
			variant: res.status === 200 ? "default" : "destructive",
			title: res.status === 200 ? "Successful Update" : "Error in Team Update",
			description: message,
		});
	}

	return (
		<>
			<div>
				<div>
					<div>
						<Label>Team Name</Label>
						<Input placeholder="Enter your team name" value={team.name!} onChange={(e) => onSetTeamName(e.target.value)} />
					</div>
				</div>
				<div className="flex mt-8">
					<div className="flex-1 mr-2">
						<div>
							<h2 className="text-xl font-medium">Rescuers Pool</h2>
							<p>Select from the available rescuers</p>
						</div>

						<div className="h-[500px] overflow-auto">
							<Tabs defaultValue="all">
								<TabsList className="w-full flex mt-4">
									<TabsTrigger className="flex-1" value="all">
										All
									</TabsTrigger>
									<TabsTrigger className="flex-1" value="withBracelet">
										W/ Bracelet
									</TabsTrigger>
									<TabsTrigger className="flex-1" value="withoutBracelet">
										W/O Bracelet
									</TabsTrigger>
								</TabsList>
								<TabsContent value="all">
									{rescuers.length !== 0 ? (
										rescuers.map((rescuer, index) => {
											return <RescuerItem rescuer={rescuer} key={index} onAdd={addRescuerToTeam} />;
										})
									) : (
										<></>
									)}
								</TabsContent>
								<TabsContent value="withBracelet">
									{rescuers.length !== 0 ? (
										rescuers
											.filter((rescuer) => rescuer.bracelet)
											.map((rescuer, index) => {
												return <RescuerItem rescuer={rescuer} key={index} onAdd={addRescuerToTeam} />;
											})
									) : (
										<></>
									)}
								</TabsContent>
								<TabsContent value="withoutBracelet">
									{rescuers.length !== 0 ? (
										rescuers
											.filter((rescuer) => !rescuer.bracelet)
											.map((rescuer, index) => {
												return <RescuerItem rescuer={rescuer} key={index} onAdd={addRescuerToTeam} />;
											})
									) : (
										<></>
									)}
								</TabsContent>
							</Tabs>
						</div>
					</div>
					<div className="flex-1 ml-2">
						<div>
							<h2 className="text-xl font-medium">Current Roster</h2>
							<p>This is the team members</p>
						</div>
						<div className="h-[500px] overflow-auto">
							<div className="mt-4">
								<p>LoRa Bracelet Equipped</p>
								{loraBraceletEquipped ? (
									<RescuerItem rescuer={loraBraceletEquipped as RescuerWithBracelet} />
								) : (
									<Card className="shadow-sm mt-2">
										<CardHeader>
											<CardDescription>No member equipped with LoRa Bracelet</CardDescription>
										</CardHeader>
									</Card>
								)}
							</div>
							<div className="mt-4">
								<p>Team Members</p>
								{team && team.rescuers.length > 0 ? (
									team.rescuers
										.filter((rescuer) => !rescuer.bracelet)
										.map((rescuer, index) => {
											return <RescuerItem key={index} rescuer={rescuer as RescuerWithBracelet} withDelete={true} onDelete={deleteRescuerFromTeam} />;
										})
								) : (
									<></>
								)}
							</div>
						</div>
					</div>
				</div>
				<div className="flex justify-end mt-12">
					<Button onClick={submit}>{submitLoading ? <Spinner /> : <p>Submit</p>}</Button>
				</div>
			</div>
			<Toaster />
		</>
	);
}
