import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EvacuationCenters } from "@prisma/client";

export default function EvacuationCenterListItem({ evacuationCenter }: { evacuationCenter: EvacuationCenters }) {
	return (
		<Card className="my-1 shadow-none hover:shadow-sm cursor-pointer">
			<CardHeader>
				<CardTitle>{evacuationCenter.name}</CardTitle>
				<CardDescription>Capacity: {evacuationCenter.capacity}</CardDescription>
			</CardHeader>
		</Card>
	);
}
