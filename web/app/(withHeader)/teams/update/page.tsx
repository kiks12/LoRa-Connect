import { getTeam } from "@/server/db/teams";
import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import TeamsForm from "../_components/TeamsForm";
import { TeamWithRescuer } from "@/types";

export default async function UpdateTeamsPage({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
	const teamId = searchParams?.teamId ? Number.parseInt(searchParams.teamId) : 0;
	const existingTeam: TeamWithRescuer | null = await getTeam({ teamId });

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Update Team" previousLink="/teams">
				<div className="mt-4 p-16">
					<TeamsForm existingTeam={existingTeam} type="UPDATE" />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
