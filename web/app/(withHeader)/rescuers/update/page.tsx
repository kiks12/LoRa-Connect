import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { RescuerForm } from "../_components/RescuerForm";

interface PageProps {
	searchParams: Promise<Record<string, string | undefined>>;
}

export default async function UpdateRescuerPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const rescuerId = params?.rescuerId ? Number.parseInt(params.rescuerId) : 0;
	const givenName = params?.givenName ?? "";
	const middleName = params?.middleName ?? "";
	const lastName = params?.lastName ?? "";
	const suffix = params?.suffix ?? "";
	const braceletId = params?.braceletId ?? "";

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Update Rescuer" previousLink="/rescuers">
				<div className="mt-4 p-16">
					<RescuerForm
						type="UPDATE"
						braceletId={braceletId}
						rescuerId={rescuerId}
						givenName={givenName}
						middleName={middleName}
						lastName={lastName}
						suffix={suffix}
					/>
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
