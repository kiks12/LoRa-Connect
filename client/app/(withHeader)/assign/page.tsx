import { createPathFromPrevious } from "@/utils/url";
import { ContainerWithTitleAndBackButton } from "../_components/ContainerWithTitleAndBackButton";
import { AssignForm } from "./_components/AssignForm";

export default function AssignPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
	const previousLink: string = searchParams.previousLink ?? "";
	const braceletId: string = searchParams.braceletId ?? "";
	const braceletName: string = searchParams.braceletName ?? "";
	const ownerId: number = searchParams.ownerId ? Number.parseInt(searchParams.ownerId as string) : 0;
	const ownerName: string = searchParams.ownerName ?? "";
	const rescuerId: number = searchParams.rescuerId ? Number.parseInt(searchParams.rescuerId as string) : 0;
	const rescuerName: string = searchParams.rescuerName ?? "";

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Assign Bracelet" previousLink={createPathFromPrevious(previousLink)}>
				<AssignForm
					rescuerId={rescuerId}
					rescuerName={rescuerName}
					braceletId={braceletId}
					ownerId={ownerId}
					ownerName={ownerName}
					braceletName={braceletName}
				/>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
