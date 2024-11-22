import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { RescuerForm } from "../_components/RescuerForm";

export default function CreateRescuerPage() {
	return (
		<main>
			<ContainerWithTitleAndBackButton title="Register Rescuer" previousLink="/rescuers">
				<div className="mt-4 p-16">
					<RescuerForm />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
