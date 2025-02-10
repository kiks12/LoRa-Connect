import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { UserForm } from "../_components/OwnerForm";

export default function CreateOwnerPage() {
	return (
		<main>
			<ContainerWithTitleAndBackButton title="Register User" previousLink="/users">
				<div className="mt-4 p-16">
					<UserForm />
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}
