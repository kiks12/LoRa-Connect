import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { UserForm } from "../_components/OwnerForm";

export default function UpdateOwnerPage({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
	const ownerId = searchParams?.ownerId ? Number.parseInt(searchParams.ownerId) : 0;
	const name = searchParams?.name ?? "";
	const members = searchParams?.members ? Number.parseInt(searchParams.members) : 0;
	const braceletId = searchParams?.braceletId ?? "";
	const address = searchParams?.address ?? "";

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Update User" previousLink="/users">
				<div className="mt-4 p-16">
					<UserForm type="UPDATE" braceletId={braceletId} ownerId={ownerId} name={name} numberOfMembersInFamily={members} address={address} />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
