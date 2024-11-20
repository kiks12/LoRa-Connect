import { getOwners } from "@/server/db/owners";
import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";

const owners = await getOwners();

export default function OwnersPage() {
	return (
		<main>
			<ContainerWithTitle title="Owners">
				<DataTable filter="name" columns={columns} data={owners} />
			</ContainerWithTitle>
		</main>
	);
}
