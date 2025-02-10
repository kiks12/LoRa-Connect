"use server";

import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { BraceletForm } from "../_components/BraceletForm";

export default async function UpdateBraceletPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
	const braceletId: string = searchParams.braceletId ?? "";
	const name: string = searchParams.name ?? "";
	const type: string = searchParams.type ?? "";

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
