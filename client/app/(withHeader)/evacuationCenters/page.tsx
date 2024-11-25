import { Button } from "@/components/ui/button";
import { DataTable } from "../../components/DataTable";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { columns } from "./columns";
import { getEvacuationCenters } from "@/server/db/evacuationCenters";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function EvacuationCenterPage() {
	const evacuationCenters = await getEvacuationCenters();
	return (
		<main>
			<ContainerWithTitle title="Evacuation Centers">
				<DataTable filter="name" columns={columns} data={evacuationCenters}>
					<Link href="/evacuationCenters/new">
						<Button>
							<Plus />
							Create
						</Button>
					</Link>
				</DataTable>
			</ContainerWithTitle>
		</main>
	);
}
