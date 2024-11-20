import { DataTable } from "../../components/DataTable";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { columns } from "./columns";
import { getRescuers } from "@/server/db/rescuers";

const rescuers = await getRescuers();

export default function RescuersPage() {
	return (
		<main>
			<ContainerWithTitle title="Rescuers">
				<DataTable filter="name" columns={columns} data={rescuers} />
			</ContainerWithTitle>
		</main>
	);
}
