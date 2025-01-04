import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import ShowStatusIndicator from "./ShowStatusIndicator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function BraceletWithOwnerListItem({
	name,
	showing,
	onShowArea,
	onShowLocation,
}: {
	name: string;
	showing: boolean;
	onShowLocation: () => void;
	onShowArea: () => void;
}) {
	return (
		<Card className="my-1 shadow-none cursor-pointer hover:border-primary">
			<CardHeader className="flex justify-between items-start">
				<div>
					<div className="flex items-center">
						<CardTitle className="">{name}</CardTitle>
						<div className="mx-2">
							<ShowStatusIndicator show={showing} />
						</div>
					</div>
				</div>
				<div className="w-full flex mt-4">
					<div className="flex items-center">
						<Switch onCheckedChange={onShowLocation} />
						<Label className="ml-2">Show Location</Label>
					</div>
					<div className="flex items-center ml-4">
						<Switch onCheckedChange={onShowArea} />
						<Label className="ml-2">Show Area</Label>
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
