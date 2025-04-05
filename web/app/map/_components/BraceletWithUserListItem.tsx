import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import ShowStatusIndicator from "./ShowStatusIndicator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UserWithStatusIdentifier } from "@/types";
import { AlertCircle } from "lucide-react";

export const URGENCY_MAP: {
	[key: number]: {
		text: string;
		color: string;
	};
} = {
	0: {
		text: "UNKNOWN",
		color: "neutral",
	},
	0.2: {
		text: "LOW",
		color: "yellow",
	},
	0.5: {
		text: "MODERATE",
		color: "orange",
	},
	1: {
		text: "SEVERE",
		color: "red",
	},
};

export default function BraceletWithUserListItem({ user, onShowLocation }: { user: UserWithStatusIdentifier; onShowLocation: () => void }) {
	return (
		<Card className={`my-1 shadow-none cursor-pointer border-0 rounded-none border-b ${user.bracelet && user.bracelet.sos ? `` : ""}`}>
			<CardHeader className="flex justify-between items-start">
				<div>
					<div className="flex items-center">
						<CardTitle className="font-normal">
							{user.givenName} {user.lastName}
						</CardTitle>
						{/* <div className="mx-2">
							<ShowStatusIndicator show={user.showing} />
						</div> */}
					</div>
				</div>
				{/* <div className="w-full flex mt-4">
					<div className="flex items-center">
						<Switch onCheckedChange={onShowLocation} />
						<Label className="ml-2">Hide Location</Label>
					</div>
				</div> */}
				{user.bracelet?.sos && (
					<div className="flex items-center mt-3">
						<AlertCircle className={`text`} />
						<p className={`ml-3`}>Urgency: {URGENCY_MAP[user.bracelet.urgency!].text}</p>
					</div>
				)}
			</CardHeader>
		</Card>
	);
}
