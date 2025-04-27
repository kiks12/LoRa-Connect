"use client";

import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { useEffect, useState } from "react";
import { OperationsWithPayload } from "@/types";

export default function MissionPage() {
	const [operations, setOperations] = useState<OperationsWithPayload[]>([]);

	useEffect(() => {
		fetch("/api/operations")
			.then((res) => res.json())
			.then(({ operations }) => setOperations(operations))
			.catch((e) => alert(e));
	}, []);

	return (
		<main>
			<ContainerWithTitle title="Missions">
				<DataTable filter="status" columns={columns} data={operations} />
			</ContainerWithTitle>
		</main>
	);
}
