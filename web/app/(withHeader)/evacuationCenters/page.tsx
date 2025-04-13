"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "../../components/DataTable";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { columns } from "./columns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EvacuationCenters } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

export default function EvacuationCenterPage() {
	const { toast } = useToast();
	const [evacuationCenters, setEvacuationCenters] = useState<EvacuationCenters[]>([]);

	useEffect(() => {
		fetch("/api/evacuation-centers")
			.then(async (res) => {
				const { evacuationCenters } = await res.json();
				setEvacuationCenters(evacuationCenters);
			})
			.catch((e) =>
				toast({
					description: e,
				})
			);
	}, [toast]);

	return (
		<main>
			<ContainerWithTitle title="Evacuation Centers">
				<DataTable filter="name" columns={columns} data={evacuationCenters}>
					<Link href="/evacuationCenters/new">
						<Button>
							<Plus />
							Add
						</Button>
					</Link>
				</DataTable>
			</ContainerWithTitle>
		</main>
	);
}
