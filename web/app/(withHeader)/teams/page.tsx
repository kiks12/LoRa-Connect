import { getTeams } from "@/server/db/teams";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { TeamWithRescuer } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import TeamItem from "./_components/TeamItem";
import { Toaster } from "@/components/ui/toaster";

export default async function TeamsPage() {
	const teams: TeamWithRescuer[] = await getTeams();

	return (
		<>
			<main>
				<ContainerWithTitle title="Teams">
					<div className="flex justify-between">
						<div></div>
						<div>
							<Link href="/teams/new">
								<Button>Create Team</Button>
							</Link>
						</div>
					</div>
					<div>
						{teams && teams.length > 0 ? (
							teams.map((team, index) => {
								return (
									<div key={index} className="mt-4">
										<TeamItem team={team} />
									</div>
								);
							})
						) : (
							<></>
						)}
					</div>
				</ContainerWithTitle>
			</main>
			<Toaster />
		</>
	);
}
