import { Button } from "@/components/ui/button";
import { DataTable } from "../../components/DataTable";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { columns } from "./columns";
import { getRescuers } from "@/server/db/rescuers";
import Link from "next/link";

const rescuers = await getRescuers();

export default function RescuersPage() {
	return (
		<main>
			<ContainerWithTitle title="Rescuers">
				<DataTable filter="name" columns={columns} data={rescuers}>
					<Link href="/rescuers/new">
						<Button>Register Rescuer</Button>
					</Link>
				</DataTable>
			</ContainerWithTitle>
		</main>
	);
}
