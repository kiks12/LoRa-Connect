import { getOperations } from "@/server/db/operations";
import { Container } from "../../components/Container";
import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";

const operations = await getOperations();

export default function MissionPage() {
	return (
		<main>
			<Container>
				<DataTable columns={columns} data={operations} />
			</Container>
		</main>
	);
}
