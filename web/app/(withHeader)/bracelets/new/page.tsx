"use server";

import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { BraceletForm } from "../_components/BraceletForm";

export default async function NewBraceletPage() {
	return (
		<main>
			<ContainerWithTitleAndBackButton title="Register a Device" previousLink="/bracelets">
				<div className="mt-4 p-16">
					<BraceletForm />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
