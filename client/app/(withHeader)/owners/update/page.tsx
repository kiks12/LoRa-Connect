import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { OwnerForm } from "../_components/OwnerForm";

export default function UpdateOwnerPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
	const ownerId = searchParams.ownerId ? Number.parseInt(searchParams.ownerId) : 0;
	const name = searchParams.name ?? "";
	const members = searchParams.members ? Number.parseInt(searchParams.members) : 0;
	const braceletId = searchParams.braceletId ?? "";

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Update Owner" previousLink="/owners">
				<div className="mt-4 p-16">
					<OwnerForm type="UPDATE" braceletId={braceletId} ownerId={ownerId} name={name} numberOfMembersInFamily={members} />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
