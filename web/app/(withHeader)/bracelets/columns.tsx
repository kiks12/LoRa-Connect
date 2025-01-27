"use client";

import { DateCell } from "@/app/components/DateCell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bracelets } from "@prisma/client";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<Bracelets>[] = [
	{
		accessorKey: "braceletId",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Bracelet ID
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
		accessorKey: "type",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Type
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const { ownerId, rescuerId, braceletId, name, type } = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="icon" variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-36" align="end">
						<Card className="z-30">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{ownerId != null || rescuerId != null ? (
								<DropdownMenuItem disabled={true}>Assign Owner</DropdownMenuItem>
							) : (
								<Link href={`/assign?braceletId=${braceletId}&braceletName=${name}&previousLink=bracelets`}>
									<DropdownMenuItem>Assign Owner</DropdownMenuItem>
								</Link>
							)}
							<Link href={`/bracelets/update?braceletId=${braceletId}&name=${name}&type=${type}`}>
								<DropdownMenuItem>Update</DropdownMenuItem>
							</Link>
							<Link href={`/bracelets/delete?braceletId=${braceletId}&name=${name}`}>
								<DropdownMenuItem>Delete</DropdownMenuItem>
							</Link>
						</Card>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
