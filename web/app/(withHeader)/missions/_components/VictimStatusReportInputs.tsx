import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { VictimStatus, VictimStatusReport } from "@prisma/client";
import { X } from "lucide-react";
import React, { ChangeEvent } from "react";

export default function VictimStatusReportInputs({
	index,
	victimStatusReport,
	setVictimStatusReports,
}: {
	index: number;
	victimStatusReport: VictimStatusReport;
	setVictimStatusReports: React.Dispatch<React.SetStateAction<VictimStatusReport[]>>;
}) {
	function onNameChange(e: ChangeEvent<HTMLInputElement>) {
		e.preventDefault();
		setVictimStatusReports((prev) => {
			return prev.map((v, idx) => {
				if (index === idx)
					return {
						...v,
						name: e.target.value,
					};
				return v;
			});
		});
	}

	function onAgeChange(e: ChangeEvent<HTMLInputElement>) {
		e.preventDefault();
		setVictimStatusReports((prev) => {
			return prev.map((v, idx) => {
				if (index === idx)
					return {
						...v,
						age: e.target.value === "" ? 0 : parseInt(e.target.value),
					};
				return v;
			});
		});
	}

	function onNotesChange(e: ChangeEvent<HTMLInputElement>) {
		e.preventDefault();
		setVictimStatusReports((prev) => {
			return prev.map((v, idx) => {
				if (index === idx)
					return {
						...v,
						notes: e.target.value,
					};
				return v;
			});
		});
	}

	function onDropdownSelect(value: string) {
		setVictimStatusReports((prev) => {
			return prev.map((v, idx) => {
				if (index === idx)
					return {
						...v,
						status: value as VictimStatus,
					};
				return v;
			});
		});
	}

	function deleteRow() {
		setVictimStatusReports((prev) => {
			return prev.filter((record, idx) => idx !== index);
		});
	}

	return (
		<div className="flex my-2">
			<div className="flex-1 mr-1">
				<Input value={victimStatusReport.name} onChange={onNameChange} />
			</div>
			<div className="flex-1 mx-1">
				<Input value={victimStatusReport.age} onChange={onAgeChange} />
			</div>
			<div className="flex-1 mx-1">
				<DropdownMenu>
					<DropdownMenuTrigger className="text-left" asChild>
						<Input value={victimStatusReport.status} readOnly />
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onClick={() => onDropdownSelect(VictimStatus.OKAY)}>OKAY</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onDropdownSelect(VictimStatus.MINOR_INJURY)}>MINOR_INJURY</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onDropdownSelect(VictimStatus.MODERATE_INJURY)}>MODERATE_INJURY</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onDropdownSelect(VictimStatus.SEVERE_INJURY)}>SEVERE_INJURY</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onDropdownSelect(VictimStatus.DECEASED)}>DECEASED</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="flex-1 ml-1">
				<Input value={victimStatusReport.notes} onChange={onNotesChange} />
			</div>
			<div className="ml-1 no-print">
				<Button type="button" size="icon" onClick={deleteRow}>
					<X />
				</Button>
			</div>
		</div>
	);
}
