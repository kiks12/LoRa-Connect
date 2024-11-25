"use server";

import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { EvacuationForm } from "../_components/EvacuationCenterForm";

export default async function NewEvacuationCenterPage() {
	return (
		<main>
			<ContainerWithTitleAndBackButton title="Create Evacuation Center" previousLink="/evacuationCenters">
				<div className="mt-4 p-16">
					<EvacuationForm />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
