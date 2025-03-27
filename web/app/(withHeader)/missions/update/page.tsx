import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import OperationsForm from "../_components/OperationsForm";

interface PageProps {
	searchParams: Promise<Record<string, string | undefined>>;
}

export default async function MissionsUpdatePage({ searchParams }: PageProps) {
	const missionId = (await searchParams).missionId ?? "";

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
