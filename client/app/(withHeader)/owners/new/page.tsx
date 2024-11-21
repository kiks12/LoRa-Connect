import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { OwnerForm } from "../_components/OwnerForm";

export default function CreateOwnerPage() {
	return (
		<main>
			<ContainerWithTitleAndBackButton title="Register Owner" previousLink="/owners">
				<div className="mt-4 p-16">
					<OwnerForm />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
