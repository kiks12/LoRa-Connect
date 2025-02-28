import { isOwner } from "@/utils/typeGuards";
import { Users, Rescuers } from "@prisma/client";

export function OwnerListItem({ owner, onClick }: { owner: Users | Rescuers; onClick: (value: Users | Rescuers) => void }) {
	return (
		<li className="mt-1 cursor-pointer rounded-sm border hover:shadow-md p-4" onClick={() => onClick(owner)}>
			{isOwner(owner) ? (
				<>
					<div className="flex justify-between items-center">
						<p className="text-xs">{(owner as Users).userId}</p>
						<div className="flex flex-col items-end">
							<p className="font-medium">{(owner as Users).name}</p>
							<p className="text-xs">No. of Members in Family: {(owner as Users).numberOfMembersInFamily}</p>
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
