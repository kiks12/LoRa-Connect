import { RescuerWithBracelet } from "@/types";

export default function TeamRescuerSubItem({ rescuer }: { rescuer: RescuerWithBracelet }) {
	return (
		<div className="border-t p-3">
			<p>{rescuer.name}</p>
			{rescuer.bracelet && <p className="text-sm text-blue-500 mt-2">LoRa Bracelet Equipped</p>}
		</div>
	);
}
