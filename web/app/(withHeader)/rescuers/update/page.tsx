import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { RescuerForm } from "../_components/RescuerForm";

interface PageProps {
	searchParams: Promise<Record<string, string | undefined>>;
}

export default async function UpdateRescuerPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const rescuerId = params?.rescuerId ? Number.parseInt(params.rescuerId) : 0;
	const name = params?.name ?? "";
	const braceletId = params?.braceletId ?? "";

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Update Owner" previousLink="/rescuers">
				<div className="mt-4 p-16">
					<RescuerForm type="UPDATE" braceletId={braceletId} rescuerId={rescuerId} name={name} />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
