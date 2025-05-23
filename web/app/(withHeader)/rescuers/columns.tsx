"use client";

import { DateCell } from "@/app/components/DateCell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatName, formatRescuerId } from "@/lib/utils";
import { RescuerWithBracelet } from "@/types";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<RescuerWithBracelet>[] = [
	{
		accessorKey: "rescuerId",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Rescuer ID
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const { rescuerId } = row.original;
			return <p>{formatRescuerId(rescuerId)}</p>;
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Created At
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: DateCell,
	},
	{
		id: "name",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const { givenName, middleName, lastName, suffix } = row.original;
			return <p>{formatName(givenName, middleName, lastName, suffix)}</p>;
		},
	},
	{
		id: "Team",
		header: () => {
			return <Button variant="ghost">Team</Button>;
		},
		cell: ({ row }) => {
			const { Teams } = row.original;
			return <p>{Teams ? Teams.name : "No Team"}</p>;
		},
	},
	{
		id: "Device ID",
		header: () => {
			return <Button variant="ghost">Device ID</Button>;
		},
		cell: ({ row }) => {
			const { bracelet } = row.original;
			return (
				<div>
					<p>{bracelet ? bracelet.braceletId : "No Device"}</p>
				</div>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const { rescuerId, givenName, middleName, lastName, suffix } = row.original;

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
								href={`/rescuers/update?rescuerId=${rescuerId}&givenName=${givenName}&middleName=${middleName}&lastName=${lastName}&suffix=${suffix}`}
							>
								<DropdownMenuItem>Update</DropdownMenuItem>
							</Link>
							<Link href={`/rescuers/delete?rescuerId=${rescuerId}&name=${formatName(givenName, middleName, lastName, suffix)}`}>
								<DropdownMenuItem>Delete</DropdownMenuItem>
							</Link>
						</Card>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
