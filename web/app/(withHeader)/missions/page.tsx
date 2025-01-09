import { getOperationsCached } from "@/server/db/operations";
import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";

export default async function MissionPage() {
	const operations = await getOperationsCached();

	return (
		<main>
			<ContainerWithTitle title="Missions">
				<DataTable filter="status" columns={columns} data={operations} />
			</ContainerWithTitle>
		</main>
	);
}
