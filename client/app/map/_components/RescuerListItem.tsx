import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RescuerWithStatusIdentifier } from "@/types";
import ShowStatusIndicator from "./ShowStatusIndicator";

export default function RescuerListItem({ rescuer, onClick }: { rescuer: RescuerWithStatusIdentifier; onClick: () => void }) {
	return (
		<Card className="my-1 shadow-none hover:shadow-sm cursor-pointer">
			<CardHeader>
				<div className="flex items-center">
					<CardTitle className="hover:underline" onClick={onClick}>
						{rescuer.name}
					</CardTitle>
					<div className="mx-2">
						<ShowStatusIndicator show={rescuer.showing} />
					</div>
				</div>
				<CardDescription>Created At: {new Date(rescuer.createdAt).toDateString()}</CardDescription>
			</CardHeader>
		</Card>
	);
}
