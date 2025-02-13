import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import TeamsForm from "../_components/TeamsForm";

export default function NewTeamsPage() {
	return (
		<main>
			<ContainerWithTitleAndBackButton title="Create Team" previousLink="/teams">
				<div className="mt-4 p-16">
					<TeamsForm />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
