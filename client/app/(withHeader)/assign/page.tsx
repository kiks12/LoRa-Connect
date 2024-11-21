import { createPathFromPrevious } from "@/utils/url";
import { ContainerWithTitleAndBackButton } from "../_components/ContainerWithTitleAndBackButton";
import { AssignForm } from "./_components/AssignForm";

export default function AssignPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
	const previousLink: string = searchParams.previousLink ?? "";
	const braceletId: string = searchParams.braceletId ?? "";

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Assign Bracelet" previousLink={createPathFromPrevious(previousLink)}>
				<AssignForm braceletId={braceletId} />
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
