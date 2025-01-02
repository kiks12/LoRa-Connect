import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OwnerWithStatusIdentifier } from "@/types";
import ShowStatusIndicator from "./ShowStatusIndicator";

export default function OwnerListItem({ owner, onClick }: { owner: OwnerWithStatusIdentifier; onClick: () => void }) {
	return (
		<Card className="my-1 shadow-none cursor-pointer hover:border-primary">
			<CardHeader>
				<div className="flex items-center">
					<CardTitle className="hover:underline" onClick={onClick}>
						{owner.name}
					</CardTitle>
					<div className="mx-2">
						<ShowStatusIndicator show={owner.showing} />
					</div>
				</div>
				<CardDescription>Created At: {new Date(owner.createdAt).toDateString()}</CardDescription>
			</CardHeader>
		</Card>
	);
}
