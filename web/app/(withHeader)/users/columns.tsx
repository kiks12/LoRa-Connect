"use client";

import { DateCell } from "@/app/components/DateCell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserWithBracelet } from "@/types";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<UserWithBracelet>[] = [
	{
		accessorKey: "userId",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					User ID
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
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
		accessorKey: "name",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
	},
	{
		accessorKey: "numberOfMembersInFamily",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Members of Family
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
	},
	{
		accessorKey: "address",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Address
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const { bracelet, userId, name, numberOfMembersInFamily, address } = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-36" align="end">
						<Card>
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{bracelet ? (
								<DropdownMenuItem disabled={true}>Assign Bracelet</DropdownMenuItem>
							) : (
								<Link href={`/assign?previousLink=users&userId=${userId}&ownerName=${name}`}>
									<DropdownMenuItem>Assign Bracelet</DropdownMenuItem>
								</Link>
							)}
							<Link
								href={`/users/update?userId=${userId}&name=${name}&members=${numberOfMembersInFamily}&braceletId=${
									bracelet?.braceletId ?? ""
								}&address=${address}`}
							>
								<DropdownMenuItem>Update</DropdownMenuItem>
							</Link>
							<Link href={`/users/delete?userId=${userId}&name=${name}`}>
								<DropdownMenuItem>Delete</DropdownMenuItem>
							</Link>
						</Card>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
