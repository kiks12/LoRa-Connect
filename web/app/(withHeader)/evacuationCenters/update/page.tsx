"use server";

import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { EvacuationForm } from "../_components/EvacuationCenterForm";

export default async function UpdateEvacuationCenterPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
	const evacuationId = searchParams.evacuationId ? Number.parseInt(searchParams.evacuationId) : 0;
	const capacity = searchParams.capacity ? Number.parseInt(searchParams.capacity) : 0;
	const latitude = searchParams.latitude ? Number.parseInt(searchParams.latitude) : 0;
	const longitude = searchParams.longitude ? Number.parseInt(searchParams.longitude) : 0;
	const name = searchParams.name ?? "";

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Update Evacuation Center" previousLink="/evacuationCenters">
				<div className="mt-4 p-16">
					<EvacuationForm type="UPDATE" capacity={capacity} evacuationId={evacuationId} latitude={latitude} longitude={longitude} name={name} />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
