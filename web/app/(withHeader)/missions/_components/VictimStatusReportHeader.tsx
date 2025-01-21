import { Label } from "@/components/ui/label";

export default function VictimStatusReportHeader() {
	return (
		<div className="flex border-t border-b py-2 mt-2">
			<div className="flex-1">
				<Label>Name</Label>
			</div>
			<div className="flex-1">
				<Label>Age</Label>
			</div>
			<div className="flex-1">
				<Label>Status</Label>
			</div>
			<div className="flex-1">
				<Label>Notes</Label>
			</div>
		</div>
	);
}
