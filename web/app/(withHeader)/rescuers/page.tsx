"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "../../components/DataTable";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { columns } from "./columns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RescuerWithBracelet } from "@/types";

export default function RescuersPage() {
	const [rescuers, setRescuers] = useState<RescuerWithBracelet[]>([]);

	useEffect(() => {
		fetch("/api/rescuers")
			.then((res) => res.json())
			.then(({ rescuers }) => setRescuers(rescuers))
			.catch((e) => alert(e));
	}, []);

	return (
		<main>
			<ContainerWithTitle title="Rescuers">
				<DataTable filter="name" columns={columns} data={rescuers}>
					<Link href="/rescuers/new">
						<Button>Register Rescuer</Button>
					</Link>
				</DataTable>
			</ContainerWithTitle>
		</main>
	);
}
