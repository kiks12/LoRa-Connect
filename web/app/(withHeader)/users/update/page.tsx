import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { UserForm } from "../_components/UserForm";

interface PageProps {
	searchParams: Promise<Record<string, string | undefined>>;
}

export default async function UpdateOwnerPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const userId = params?.userId ? Number.parseInt(params.userId) : 0;
	const name = params?.name ?? "";
	const members = params?.members ? Number.parseInt(params.members) : 0;
	const braceletId = params?.braceletId ?? "";
	const address = params?.address ?? "";

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Update User" previousLink="/users">
				<div className="mt-4 p-16">
					<UserForm type="UPDATE" braceletId={braceletId} userId={userId} name={name} numberOfMembersInFamily={members} address={address} />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
