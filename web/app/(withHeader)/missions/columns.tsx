"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatName } from "@/lib/utils";
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
					ID
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
		cell: ({ row }) => {
			const date = new Date(row.original.dateTime);
			return (
				<p>
					{date.toDateString()} {date.toLocaleTimeString()}
				</p>
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
		header: "Distance",
		cell: ({ row }) => {
			return <p>{(row.original.distance / 1000).toFixed(2)} km</p>;
		},
	},
	{
		header: "ETA",
		cell: ({ row }) => {
			return <p>{(row.original.eta / 1000).toFixed(2)} s</p>;
		},
	},
	{
		header: "User",
		cell: ({ row }) => {
			const { givenName, middleName, lastName, suffix } = row.original.user;
			return <p>{formatName(givenName, middleName, lastName, suffix)}</p>;
		},
	},
	{
		header: "Team",
		cell: ({ row }) => {
			return <p>{row.original.Teams?.name}</p>;
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const { missionId } = row.original;

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
							<Link href={`/missions/update?missionId=${missionId}`}>
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
