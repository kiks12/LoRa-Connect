import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatName } from "@/lib/utils";
import { RescuerWithBracelet } from "@/types";
import { Minus, Plus } from "lucide-react";

export default function RescuerItem({
	rescuer,
	withDelete = false,
	onAdd = () => {},
	onDelete = () => {},
}: {
	rescuer: RescuerWithBracelet;
	withDelete?: boolean;
	onAdd?: (rescuer: RescuerWithBracelet) => void;
	onDelete?: (rescuer: RescuerWithBracelet) => void;
}) {
	return (
		<div>
			<Card className="mt-2 border border-neutral-200 cursor-pointer shadow-sm hover:shadow-md">
				<CardHeader className="">
					<div className="flex justify-between">
						<div>
							<div className="flex">
								<div>
									<CardDescription>ID</CardDescription>
									<CardTitle className="font-medium mt-1">{rescuer.rescuerId}</CardTitle>
								</div>
								<div className="ml-4">
									<CardDescription>Name</CardDescription>
									<CardTitle className="font-medium mt-1">
										{formatName(rescuer.givenName, rescuer.middleName, rescuer.lastName, rescuer.suffix)}
									</CardTitle>
								</div>
							</div>
							{rescuer.bracelet && (
								<div className="mt-2">
									<CardDescription className="text-blue-500">LoRa Bracelet Equipped</CardDescription>
								</div>
							)}
						</div>
						<div>
							{withDelete ? (
								<Button size="icon" variant="outline" className="text-red-500" onClick={() => onDelete(rescuer)}>
									<Minus />
								</Button>
							) : (
								<Button size="icon" variant="outline" onClick={() => onAdd(rescuer)}>
									<Plus />
								</Button>
							)}
						</div>
					</div>
				</CardHeader>
			</Card>
		</div>
	);
}
