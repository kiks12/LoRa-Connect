import { getTeam } from "@/server/db/teams";
import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import TeamsForm from "../_components/TeamsForm";
import { TeamWithRescuer } from "@/types";

interface PageProps {
	searchParams: Promise<Record<string, string | undefined>>;
}

export default async function UpdateTeamsPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const teamId = params?.teamId ? Number.parseInt(params.teamId) : 0;
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
