"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { OperationsWithPayload } from "@/types";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<OperationsWithPayload>[] = [
	{
		accessorKey: "missionId",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Mission ID
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
	},
	{
		accessorKey: "dateTime",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Date Time
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Status
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
	},
	{
		accessorKey: "urgency",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Urgency
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
	},
	{
		accessorKey: "numberOfRescuee",
		header: "No. of victims",
	},
	{
		header: "User",
		cell: ({ row }) => {
			return <p>{row.original.user.name}</p>;
		},
	},
	{
		header: "Rescuer",
		cell: ({ row }) => {
			return <p>{row.original.rescuer.name}</p>;
		},
	},
	{
		header: "Evacuation ID",
		cell: ({ row }) => {
			return <p>{row.original.evacuationCenter.name}</p>;
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const {
				missionId,
				user,
				usersUserId,
				evacuationCenter,
				evacuationCentersEvacuationId,
				numberOfRescuee,
				rescuer,
				rescuersRescuerId,
				status,
				urgency,
			} = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<Card>
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<Link
								href={`/missions/update?operationId=${missionId}&userId=${usersUserId}&userName=${user.name}&rescuerId=${rescuersRescuerId}&rescuerName=${rescuer.name}&evacuationCenterId=${evacuationCentersEvacuationId}&evacuationCenterName=${evacuationCenter.name}&numberOfRescuee=${numberOfRescuee}&operationStatus=${status}&urgency=${urgency}`}
							>
								<DropdownMenuItem>Update</DropdownMenuItem>
							</Link>
							<Link href={`/missions/delete?operationId=${missionId}`}>
								<DropdownMenuItem>Delete</DropdownMenuItem>
							</Link>
						</Card>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
