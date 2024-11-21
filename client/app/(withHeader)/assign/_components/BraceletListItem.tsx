import { Bracelets } from "@prisma/client";

export function BraceletListItem({ bracelet, onClick }: { bracelet: Bracelets; onClick: (bracelet: Bracelets) => void }) {
	return (
		<li className="mt-1 cursor-pointer rounded-sm border hover:shadow-md p-4" onClick={() => onClick(bracelet)}>
			<p className="font-medium">{bracelet.braceletId}</p>
			<p className="text-xs">{bracelet.name}</p>
		</li>
	);
}
