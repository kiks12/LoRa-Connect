import { OperationStatus, RescueUrgency } from "@prisma/client";
import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import OperationsForm from "../_components/OperationsForm";

export default function MissionsUpdatePage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
	const operationId = searchParams.operationId ? Number.parseInt(searchParams.operationId) : 0;
	const evacuationCenterId = searchParams.evacuationCenterId ? Number.parseInt(searchParams.evacuationCenterId) : 0;
	const evacuationCenterName = searchParams.evacuationCenterName ?? "";
	const rescuerId = searchParams.rescuerId ? Number.parseInt(searchParams.rescuerId) : 0;
	const rescuerName = searchParams.rescuerName ?? "";
	const ownerId = searchParams.ownerId ? Number.parseInt(searchParams.ownerId) : 0;
	const ownerName = searchParams.ownerName ?? "";
	const numberOfRescuee = searchParams.numberOfRescuee ? Number.parseInt(searchParams.numberOfRescuee) : 0;
	const status = searchParams.operationStatus ?? "";
	const urgency = searchParams.urgency ?? "";

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Update Mission" previousLink="/missions">
				<div className="mt-4 p-16">
					<OperationsForm
						type="UPDATE"
						operationId={operationId}
						evacuationCenterId={evacuationCenterId}
						evacuationCenterName={evacuationCenterName}
						rescuerId={rescuerId}
						rescuerName={rescuerName}
						ownerId={ownerId}
						ownerName={ownerName}
						numberOfRescuee={numberOfRescuee}
						status={status as OperationStatus}
						urgency={urgency as RescueUrgency}
					/>
				</div>
			</ContainerWithTitleAndBackButton>
		</main>
	);
}