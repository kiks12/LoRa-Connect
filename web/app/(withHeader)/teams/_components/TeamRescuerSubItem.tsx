import { formatName } from "@/lib/utils";
import { RescuerWithBracelet } from "@/types";

export default function TeamRescuerSubItem({ rescuer }: { rescuer: RescuerWithBracelet }) {
	return (
		<div className="border-t p-3">
			<p>{formatName(rescuer.givenName, rescuer.middleName, rescuer.lastName, rescuer.suffix)}</p>
			{rescuer.bracelet && <p className="text-sm text-blue-500 mt-2">LoRa Bracelet Equipped</p>}
		</div>
	);
}
