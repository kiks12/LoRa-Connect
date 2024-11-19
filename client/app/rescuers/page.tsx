import { Container } from "../components/Container";
import { DataTable } from "../components/DataTable";
import { columns } from "./columns";
import { getRescuers } from "@/server/db/rescuers";

const rescuers = await getRescuers();

export default function RescuersPage() {
	return (
		<main>
			<Container>
				<DataTable columns={columns} data={rescuers} />
			</Container>
		</main>
	);
}
