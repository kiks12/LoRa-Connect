import { getOperations } from "@/server/db/operations";
import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";

const operations = await getOperations();

export default function MissionPage() {
	return (
		<main>
			<ContainerWithTitle title="Missions">
				<DataTable filter="status" columns={columns} data={operations} />
			</ContainerWithTitle>
		</main>
	);
}
