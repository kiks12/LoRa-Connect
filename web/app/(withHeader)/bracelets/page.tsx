"use client";

import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Bracelets } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function BraceletsPages() {
	const { toast } = useToast();
	const [devices, setDevices] = useState<Bracelets[]>([]);
	const [type, setType] = useState("ALL");

	useEffect(() => {
		fetch("/api/bracelets")
			.then(async (res) => {
				const { bracelets } = await res.json();
				setDevices(bracelets);
			})
			.catch((e) =>
				toast({
					description: e,
				})
			);
	}, [toast]);

	return (
		<main>
			<ContainerWithTitle title="Devices">
				<DataTable filter="name" columns={columns} data={devices.filter((device) => device.type === type || type === "ALL")}>
					<div className="flex items-end">
						<div className="flex flex-col">
							<div>
								<p className="text-xs">Device Type:</p>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild={true}>
									<Button className="mr-2 w-32" variant="outline">
										<div className="w-full flex items-center justify-between">
											<p>ALL</p>
											<ChevronDown />
										</div>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem onClick={() => setType("ALL")}>ALL</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setType("USER")}>USER</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setType("RESCUER")}>RESCUER</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<Link href="/bracelets/new">
							<Button>
								<Plus />
								Add
							</Button>
						</Link>
					</div>
				</DataTable>
			</ContainerWithTitle>
			<Toaster />
		</main>
	);
}
