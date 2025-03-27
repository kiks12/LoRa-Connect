"use server";

import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { BraceletForm } from "../_components/BraceletForm";

interface PageProps {
	searchParams: Promise<Record<string, string | undefined>>;
}

export default async function UpdateBraceletPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const braceletId: string = params.braceletId ?? "";
	const name: string = params.name ?? "";
	const type: string = params.type ?? "";

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Update Device" previousLink="/bracelets">
				<div className="mt-4 p-16">
					<BraceletForm formType="UPDATE" braceletId={braceletId} name={name} type={type} />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
