import { createPathFromPrevious } from "@/utils/url";
import { ContainerWithTitleAndBackButton } from "../_components/ContainerWithTitleAndBackButton";
import { AssignForm } from "./_components/AssignForm";
import { BraceletType } from "@prisma/client";

interface PageProps {
	searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AssignPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const previousLink: string = (await params.previousLink) ?? "";
	const braceletId: string = (await params.braceletId) ?? "";
	const braceletName: string = (await params.braceletName) ?? "";
	const userId: number = (await params.userId) ? Number.parseInt(params.userId as string) : 0;
	const ownerName: string = (await params.ownerName) ?? "";
	const rescuerId: number = (await params.rescuerId) ? Number.parseInt(params.rescuerId as string) : 0;
	const rescuerName: string = (await params.rescuerName) ?? "";
	const type: BraceletType = (await params.type) as BraceletType;

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Assign Device" previousLink={createPathFromPrevious(previousLink)}>
				<AssignForm
					rescuerId={rescuerId}
					rescuerName={rescuerName}
					braceletId={braceletId}
					userId={userId}
					userName={ownerName}
					braceletName={braceletName}
					type={type}
				/>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
