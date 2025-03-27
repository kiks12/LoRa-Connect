"use server";

import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { EvacuationForm } from "../_components/EvacuationCenterForm";

interface PageProps {
	searchParams: Promise<Record<string, string | undefined>>;
}

export default async function UpdateEvacuationCenterPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const evacuationId = params.evacuationId ? Number.parseInt(params.evacuationId) : 0;
	const capacity = params.capacity ? Number.parseInt(params.capacity) : 0;
	const latitude = params.latitude ? Number.parseInt(params.latitude) : 0;
	const longitude = params.longitude ? Number.parseInt(params.longitude) : 0;
	const name = params.name ?? "";

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
