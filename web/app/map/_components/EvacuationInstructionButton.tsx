import Spinner from "@/app/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { socket } from "@/socket/socket";
import { SEND_EVACUATION_INSTRUCTION_TO_BRACELETS } from "@/tags";
import { EvacuationInstruction } from "@/types";
import { useEffect, useMemo } from "react";

export default function EvacuationInstructionButton({
	calculatingEvacuationInstructions,
	evacuationCenterInstructions,
}: {
	calculatingEvacuationInstructions: boolean;
	evacuationCenterInstructions: EvacuationInstruction[];
	createEvacuationInstructions: () => void;
}) {
	useEffect(() => {
		console.log(evacuationCenterInstructions);
	}, [evacuationCenterInstructions]);

	function sendViaLoRa() {
		socket.emit(SEND_EVACUATION_INSTRUCTION_TO_BRACELETS, { evacuationCenterInstructions });
	}

	return (
		<Dialog>
			<DialogTrigger asChild className="w-full">
				<Button className="w-full">Send Evacuation Instructions</Button>
			</DialogTrigger>
			<DialogContent className="max-h-screen overflow-y-scoll">
				<DialogHeader>
					<DialogTitle>Send Evacuation Instructions</DialogTitle>
				</DialogHeader>
				{calculatingEvacuationInstructions ? (
					<div className="flex items-center justify-center w-full h-full">
						<Spinner />
					</div>
				) : (
					<div className="flex">
						<div className="max-h-[700px] overflow-scroll">
							{evacuationCenterInstructions.map((instruction, index) => {
								return <OwnerEvacuationCenterListItem instruction={instruction} key={index} />;
							})}
						</div>
					</div>
				)}
				<div>
					<Button onClick={sendViaLoRa} className="w-full">
						Send via LoRa
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function OwnerEvacuationCenterListItem({ instruction }: { instruction: EvacuationInstruction }) {
	const distance: number = useMemo(() => {
		return instruction.distance / 1000;
	}, [instruction]);
	const time: number = useMemo(() => {
		return instruction.time / 1000 / 60;
	}, [instruction]);
	return (
		<Card className="border-none shadow-none py-3 px-10">
			<CardHeader className="p-0">
				<CardTitle>
					{instruction.ownerId} - {instruction.ownerName}
				</CardTitle>
				<CardDescription className="flex">
					<Label>{instruction.evacuationCenterName}</Label>
					<Label className="mx-8">{instruction.distance > 1000 ? `${distance.toFixed(2)} km` : `${instruction.distance.toFixed(2)} m`}</Label>
					<Label>{instruction.time > 1000 * 60 ? `${time.toFixed(2)} mins.` : `${instruction.time} seconds`}</Label>
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
