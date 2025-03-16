import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import OperationsForm from "../_components/OperationsForm";

export default function MissionsUpdatePage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
	const missionId = searchParams.missionId ?? "";

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Update Mission" previousLink="/missions">
				<div className="mt-4 p-16">
					<OperationsForm type="UPDATE" missionId={missionId} />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
