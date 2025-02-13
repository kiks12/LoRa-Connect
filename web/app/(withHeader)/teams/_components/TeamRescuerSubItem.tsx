import { Rescuers } from "@prisma/client";

export default function TeamRescuerSubItem({ rescuer }: { rescuer: Rescuers }) {
	return (
		<div className="border-t p-3">
			<p>{rescuer.name}</p>
		</div>
	);
}
