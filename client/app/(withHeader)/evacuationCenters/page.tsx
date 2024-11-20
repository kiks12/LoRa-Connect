import { Container } from "../../components/Container";
import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";
import { getEvacuationCenters } from "@/server/db/evacuationCenters";

const evacuationCenters = await getEvacuationCenters();

export default function EvacuationCenterPage() {
	return (
		<main>
			<Container>
				<DataTable columns={columns} data={evacuationCenters} />
			</Container>
		</main>
	);
}
