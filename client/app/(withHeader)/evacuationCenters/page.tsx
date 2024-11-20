import { DataTable } from "../../components/DataTable";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { columns } from "./columns";
import { getEvacuationCenters } from "@/server/db/evacuationCenters";

const evacuationCenters = await getEvacuationCenters();

export default function EvacuationCenterPage() {
	return (
		<main>
			<ContainerWithTitle title="Evacuation Centers">
				<DataTable filter="name" columns={columns} data={evacuationCenters} />
			</ContainerWithTitle>
		</main>
	);
}
