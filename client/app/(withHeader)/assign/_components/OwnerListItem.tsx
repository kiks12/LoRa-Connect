import { isOwner } from "@/utils/typeGuards";
import { Owners, Rescuers } from "@prisma/client";

export function OwnerListItem({ owner, onClick }: { owner: Owners | Rescuers; onClick: (value: Owners | Rescuers) => void }) {
	return (
		<li className="cursor-pointer rounded-sm border hover:shadow-md p-4" onClick={() => onClick(owner)}>
			{isOwner(owner) ? (
				<>
					<div className="flex justify-between items-center">
						<p className="text-xs">{(owner as Owners).ownerId}</p>
						<div className="flex flex-col items-end">
							<p className="font-medium">{(owner as Owners).name}</p>
							<p className="text-xs">No. of Members in Family: {(owner as Owners).numberOfMembersInFamily}</p>
						</div>
					</div>
				</>
			) : (
				<>
					<div className="flex justify-between items-center">
						<p className="text-xs">{(owner as Rescuers).rescuerId}</p>
						<p className="font-medium">{(owner as Rescuers).name}</p>
					</div>
				</>
			)}
		</li>
	);
}
