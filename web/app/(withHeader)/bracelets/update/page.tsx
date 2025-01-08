"use server";

import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { BraceletForm } from "../_components/BraceletForm";

export default async function UpdateBraceletPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
	const braceletId: string = searchParams.braceletId ?? "";
	const name: string = searchParams.name ?? "";

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Update Bracelet" previousLink="/bracelets">
				<div className="mt-4 p-16">
					<BraceletForm type="UPDATE" braceletId={braceletId} name={name} />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
