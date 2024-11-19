import { getOwners } from "@/server/db/owners";
import { Container } from "../components/Container";
import { DataTable } from "../components/DataTable";
import { columns } from "./columns";

const owners = await getOwners();

export default function OwnersPage() {
	return (
		<main>
			<Container>
				<DataTable columns={columns} data={owners} />
			</Container>
		</main>
	);
}
