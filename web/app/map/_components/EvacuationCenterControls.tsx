import Spinner from "@/app/components/Spinner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RefreshCcw } from "lucide-react";
import EvacuationCenterListItem from "./EvacuationCenterListItem";
import EvacuationInstructionButton from "./EvacuationInstructionButton";
import { useEvacuations } from "@/hooks/map/use-evacuations";
import { useEffect, useState } from "react";
import { useUsers } from "@/hooks/map/use-users";

export default function EvacuationCenterControls() {
	const {
		evacuationCenters,
		showEvacuationCenters,
		toggleShowEvacuationCenters,
		evacuationCentersLoading,
		refreshEvacuationCenters,
		evacuationInstructions,
		createEvacuationInstructions,
		calculatingEvacuationInstructions,
		setEvacuationInstructionMessage,
	} = useEvacuations();
	const { users } = useUsers();
	const [runEvacuationInstructionAlgorithm, setRunEvacuationInstructionAlgorithm] = useState(false);
	const [rerunEvacuationInstructionAlgorithm, setRerunEvacuationInstructionAlgorithm] = useState(false);

	useEffect(() => {
		if (rerunEvacuationInstructionAlgorithm) createEvacuationInstructions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rerunEvacuationInstructionAlgorithm]);

	useEffect(() => {
		if (runEvacuationInstructionAlgorithm && evacuationInstructions.length === 0) createEvacuationInstructions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [users, evacuationCenters, runEvacuationInstructionAlgorithm]);

	return (
		<div className="mt-2">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-medium">Evacuation Centers</h2>
				<Button size="icon" variant="secondary" onClick={refreshEvacuationCenters}>
					<RefreshCcw />
				</Button>
			</div>
			<div className="flex justify-between items-center my-2 border rounded-md p-3">
				<Label className="ml-3" htmlFor="showEvacuationCenters">
					Show Evacuation Centers
				</Label>
				<Switch checked={showEvacuationCenters} id="showEvacuationCenters" onCheckedChange={toggleShowEvacuationCenters} />
			</div>
			{evacuationCentersLoading ? (
				<div className="flex items-center justify-center my-20">
					<Spinner />
				</div>
			) : (
				<div className="max-h-96 min-h-96 overflow-y-auto">
					{evacuationCenters && evacuationCenters.length > 0 ? (
						evacuationCenters.map((evacuationCenter, index) => {
							return <EvacuationCenterListItem evacuationCenter={evacuationCenter} key={index} />;
						})
					) : (
						<div className="h-56 flex items-center justify-center my-10">
							<p>No Evacuation Centers to show</p>
						</div>
					)}
				</div>
			)}
			<EvacuationInstructionButton
				onRerunClick={() => setRerunEvacuationInstructionAlgorithm(!rerunEvacuationInstructionAlgorithm)}
				onOpenChange={() => setRunEvacuationInstructionAlgorithm(!runEvacuationInstructionAlgorithm)}
				setMessage={setEvacuationInstructionMessage}
				calculatingEvacuationInstructions={calculatingEvacuationInstructions}
				evacuationCenterInstructions={evacuationInstructions}
				createEvacuationInstructions={createEvacuationInstructions}
			/>
		</div>
	);
}
