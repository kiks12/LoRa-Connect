import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { RescuerForm } from "../_components/RescuerForm";

export default function UpdateRescuerPage({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
	const rescuerId = searchParams?.rescuerId ? Number.parseInt(searchParams.rescuerId) : 0;
	const name = searchParams?.name ?? "";
	const braceletId = searchParams?.braceletId ?? "";

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
