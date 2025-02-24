import Spinner from "@/app/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INSTRUCTION_TO_USER } from "@/lora/lora-tags";
import { socket } from "@/socket/socket";
import { EvacuationInstruction } from "@/types";
import { useMemo } from "react";

export default function EvacuationInstructionButton({
	onOpenChange,
	onRerunClick,
	setMessage,
	calculatingEvacuationInstructions,
	evacuationCenterInstructions,
}: {
	onOpenChange: () => void;
	onRerunClick: () => void;
	calculatingEvacuationInstructions: boolean;
	evacuationCenterInstructions: EvacuationInstruction[];
	createEvacuationInstructions: () => void;
	setMessage: (index: number, message: string) => void;
}) {
	function sendViaLoRa() {
		socket.emit(INSTRUCTION_TO_USER, { evacuationCenterInstructions });
	}

	return (
		<Dialog onOpenChange={onOpenChange}>
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
						<div className="max-h-[700px] overflow-scroll w-full">
							{evacuationCenterInstructions.map((instruction, index) => {
								return <OwnerEvacuationCenterListItem index={index} instruction={instruction} setMessage={setMessage} key={index} />;
							})}
						</div>
					</div>
				)}
				<div>
					<Button onClick={sendViaLoRa} className="w-full">
						Send via LoRa
					</Button>
					<Button variant={"secondary"} onClick={onRerunClick} className="w-full mt-4">
						Re-Run Algorithm
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function OwnerEvacuationCenterListItem({
	index,
	instruction,
	setMessage,
}: {
	index: number;
	instruction: EvacuationInstruction;
	setMessage: (index: number, message: string) => void;
}) {
	const distance: number = useMemo(() => {
		return instruction.distance / 1000;
	}, [instruction]);
	const time: number = useMemo(() => {
		return instruction.time / 1000 / 60;
	}, [instruction]);
	return (
		<Card className="border-none shadow-none py-3 px-10 w-full">
			<CardHeader className="p-0 w-full">
				<CardTitle>
					{instruction.ownerId} - {instruction.ownerName}
				</CardTitle>
				<CardDescription className="flex">
					<Label>{instruction.evacuationCenterName}</Label>
					<Label className="mx-8">{instruction.distance > 1000 ? `${distance.toFixed(2)} km` : `${instruction.distance.toFixed(2)} m`}</Label>
					<Label>{instruction.time > 1000 * 60 ? `${time.toFixed(2)} mins.` : `${instruction.time} seconds`}</Label>
				</CardDescription>
				<CardContent className="p-0">
					<div>
						<Label>Message {instruction.message.length}/10</Label>
						<Input className="w-full" maxLength={10} value={instruction.message} onChange={(e) => setMessage(index, e.target.value)} />
					</div>
				</CardContent>
			</CardHeader>
		</Card>
	);
}
