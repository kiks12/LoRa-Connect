import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EvacuationCenterWithStatusIdentifier } from "@/types";
import ShowStatusIndicator from "./ShowStatusIndicator";

export default function EvacuationCenterListItem({ evacuationCenter }: { evacuationCenter: EvacuationCenterWithStatusIdentifier }) {
	return (
		<Card className="my-1 shadow-none hover:border-primary cursor-pointer">
			<CardHeader>
				<div className="flex items-center">
					<CardTitle className="">{evacuationCenter.name}</CardTitle>
					<div className="mx-2">
						<ShowStatusIndicator show={evacuationCenter.showing} />
					</div>
				</div>
				<CardDescription>Capacity: {evacuationCenter.capacity}</CardDescription>
			</CardHeader>
		</Card>
	);
}
