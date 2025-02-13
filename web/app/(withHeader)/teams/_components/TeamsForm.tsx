"use client";

import { useEffect, useState } from "react";
import RescuerItem from "./RescuerItem";
import { TeamWithRescuer } from "@/types";
import { Rescuers } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function TeamsForm({ existingTeam, type = "CREATE" }: { existingTeam?: TeamWithRescuer | null; type?: "CREATE" | "UPDATE" }) {
	const { toast } = useToast();
	const [rescuers, setRescuers] = useState<Rescuers[]>([]);
	const [team, setTeams] = useState<TeamWithRescuer>(
		existingTeam ?? {
			teamId: 0,
			createdAt: new Date(),
			rescuers: [],
		}
	);

	useEffect(() => {
		async function fetchRescuers() {
			const result = await fetch("/api/rescuers/no-teams");
			const json = await result.json();
			return json;
		}

		fetchRescuers().then(({ rescuers }) => setRescuers(rescuers));
	}, []);

	function addRescuerToTeam(rescuer: Rescuers) {
		setTeams((prev) => {
			return {
				...prev,
				rescuers: [...prev.rescuers, rescuer].sort((a, b) => a.rescuerId - b.rescuerId),
			};
		});
		setRescuers((prev) => prev.filter((prevRescuer) => rescuer.rescuerId !== prevRescuer.rescuerId));
	}

	function deleteRescuerFromTeam(rescuer: Rescuers) {
		setTeams((prev) => {
			return {
				...prev,
				rescuers: prev.rescuers.filter((prevRescuer) => prevRescuer.rescuerId !== rescuer.rescuerId),
			};
		});
		setRescuers((prev) => [...prev, rescuer].sort((a, b) => a.rescuerId - b.rescuerId));
	}

	async function submit() {
		if (team.rescuers.length <= 0) {
			toast({
				variant: "destructive",
				title: "Empty Roster",
				description: "Please select from the rescuers pool",
			});
			return;
		}

		if (type === "CREATE") await onCreateSubmit();
		else onUpdateSubmit();
	}

	async function onCreateSubmit() {
		const res = await fetch("/api/teams/new", {
			method: "POST",
			body: JSON.stringify({ ...team }),
		});
		const { message } = await res.json();
		toast({
			variant: res.status === 200 ? "default" : "destructive",
			title: res.status === 200 ? "Successful Creation" : "Error in Creation",
			description: message,
		});
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
				<div className="flex">
					<div className="flex-1 mr-2">
						<h2>Rescuers Pool</h2>
						<div className="h-[500px] overflow-auto">
							{rescuers.length !== 0 ? (
								rescuers.map((rescuer, index) => {
									return <RescuerItem rescuer={rescuer} key={index} onAdd={addRescuerToTeam} />;
								})
							) : (
								<></>
							)}
						</div>
					</div>
					<div className="flex-1 ml-2">
						<h2>Current Roster</h2>
						<div className="h-[500px] overflow-auto">
							{team && team.rescuers.length > 0 ? (
								team.rescuers.map((rescuer, index) => {
									return <RescuerItem key={index} rescuer={rescuer} withDelete={true} onDelete={deleteRescuerFromTeam} />;
								})
							) : (
								<></>
							)}
						</div>
					</div>
				</div>
				<div className="flex justify-end mt-12">
					<Button onClick={submit}>Submit</Button>
				</div>
			</div>
			<Toaster />
		</>
	);
}
