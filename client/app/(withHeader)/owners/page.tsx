import { getOwners } from "@/server/db/owners";
import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const owners = await getOwners();

export default function OwnersPage() {
	return (
		<main>
			<ContainerWithTitle title="Owners">
				<DataTable filter="name" columns={columns} data={owners}>
					<Link href="/owners/new">
						<Button>Register Owner</Button>
					</Link>
				</DataTable>
			</ContainerWithTitle>
		</main>
	);
}
