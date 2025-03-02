import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import ShowStatusIndicator from "./ShowStatusIndicator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function BraceletWithUserListItem({ name, showing, onShowLocation }: { name: string; showing: boolean; onShowLocation: () => void }) {
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
				</div>
				<div>SOS</div>
			</CardHeader>
		</Card>
	);
}
