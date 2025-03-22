"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { TeamWithRescuer, TeamWithStatusIdentifier } from "@/types";
import { AlertCircle, ChevronDown, ChevronUp, Edit, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import TeamRescuerSubItem from "./TeamRescuerSubItem";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { URGENCY_MAP } from "@/app/map/_components/BraceletWithUserListItem";

export default function TeamItem({
	team,
	forMap = false,
	onShowLocationOnMap = () => {},
}: {
	team: TeamWithRescuer | TeamWithStatusIdentifier;
	forMap?: boolean;
	onShowLocationOnMap?: () => void;
}) {
	const { toast } = useToast();
	const [open, setOpen] = useState(false);
	const rescuerWithBracelet = useMemo(() => {
		return team.rescuers.find((rescuer) => rescuer.bracelet);
	}, [team]);

	function toggleOpen() {
		setOpen(!open);
	}

	async function deleteTeam() {
		const res = await fetch("/api/teams/delete", {
			method: "DELETE",
			body: JSON.stringify({ teamId: team.teamId }),
		});
		const { message } = await res.json();
		toast({
			variant: res.status === 200 ? "default" : "destructive",
			title: res.status === 200 ? "Successful Delete" : "Error in deleting record",
			description: message,
		});
	}

	function isTeamWithStatusIndicator(team: TeamWithRescuer | TeamWithStatusIdentifier): team is TeamWithStatusIdentifier {
		return "showing" in team;
	}

	return (
		<Card className="p-4 border-0 border-b rounded-none shadow-sm">
			<div>
				<div className="flex justify-between items-center">
					<div className="flex flex-1">
						<div className="flex-1">
							<div className="flex items-center">
								{/* {isTeamWithStatusIndicator(team) && (
									<div className="mx-2">
										<ShowStatusIndicator show={team.showing} />
									</div>
								)} */}
								<CardDescription className="text-xs">Team ID: {team.teamId}</CardDescription>
							</div>
							<CardTitle className="font-medium mt-2">{team.name}</CardTitle>
						</div>
						{!forMap && (
							<>
								<div className="flex-1">
									<CardDescription className="text-xs">Created At</CardDescription>
									<CardTitle className="font-medium mt-2">{new Date(team.createdAt).toDateString()}</CardTitle>
								</div>
							</>
						)}
						<div className="flex-1">
							<CardDescription className="text-xs">Members</CardDescription>
							<CardTitle className="font-medium mt-2">Count ({team.rescuers.length})</CardTitle>
						</div>
					</div>
					<div className="flex">
						{!forMap && (
							<>
								<Link href={`/teams/update?teamId=${team.teamId}`}>
									<Button variant="ghost" size="icon" className="text-blue-500">
										<Edit />
									</Button>
								</Link>
								<Dialog>
									<DialogTrigger asChild>
										<Button variant="ghost" size="icon" className="text-red-500" onClick={toggleOpen}>
											<Trash />
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Delete Confirmation</DialogTitle>
										</DialogHeader>
										<div>
											<p>Are you sure you want to delete this team?</p>
											<div className="mt-8 flex justify-end">
												<DialogTrigger asChild>
													<Button className="mr-2">Cancel</Button>
												</DialogTrigger>
												<DialogTrigger asChild>
													<Button className="" onClick={deleteTeam} variant="outline">
														Confirm
													</Button>
												</DialogTrigger>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</>
						)}
						<Button variant="ghost" size="icon" onClick={toggleOpen}>
							{open ? <ChevronUp /> : <ChevronDown />}
						</Button>
					</div>
				</div>
				{/* {isTeamWithStatusIndicator(team) && (
					<div className="mt-4">
						<div className="flex items-center">
							<Switch onCheckedChange={onShowLocationOnMap} />
							<Label className="ml-2">Show Location</Label>
						</div>
					</div>
				)} */}
			</div>
			{forMap && isTeamWithStatusIndicator(team) && rescuerWithBracelet?.bracelet?.sos && (
				<div className="flex items-center mt-3">
					<AlertCircle className={`text-${URGENCY_MAP[rescuerWithBracelet.bracelet.urgency!].color}-500`} />
					<p className={`text-${URGENCY_MAP[rescuerWithBracelet.bracelet.urgency!].color}-500 ml-3`}>
						Urgency: {URGENCY_MAP[rescuerWithBracelet.bracelet.urgency!].text}
					</p>
				</div>
			)}
			{open && (
				<div className="mt-4">
					{team.rescuers
						.filter((rescuer) => rescuer.bracelet)
						.map((rescuer, index) => {
							return <TeamRescuerSubItem rescuer={rescuer} key={index} />;
						})}
					{team.rescuers
						.filter((rescuer) => !rescuer.bracelet)
						.map((rescuer, index) => {
							return <TeamRescuerSubItem rescuer={rescuer} key={index} />;
						})}
				</div>
			)}
		</Card>
	);
}
