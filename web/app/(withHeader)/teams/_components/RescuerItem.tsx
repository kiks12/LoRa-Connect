import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rescuers } from "@prisma/client";
import { Minus, Plus } from "lucide-react";

export default function RescuerItem({
	rescuer,
	withDelete = false,
	onAdd = () => {},
	onDelete = () => {},
}: {
	rescuer: Rescuers;
	withDelete?: boolean;
	onAdd?: (rescuer: Rescuers) => void;
	onDelete?: (rescuer: Rescuers) => void;
}) {
	return (
		<div>
			<Card className="mt-2 border border-neutral-100 cursor-pointer shadow-sm hover:shadow-md">
				<CardHeader className="">
					<div className="flex justify-between">
						<div className="flex">
							<div>
								<CardDescription>ID</CardDescription>
								<CardTitle className="font-medium mt-1">{rescuer.rescuerId}</CardTitle>
							</div>
							<div className="ml-4">
								<CardDescription>Name</CardDescription>
								<CardTitle className="font-medium mt-1">{rescuer.name}</CardTitle>
							</div>
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
