import { getUsers } from "@/server/db/users";
import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OwnersPage() {
	const owners = await getUsers();
	return (
		<main>
			<ContainerWithTitle title="Users">
				<DataTable filter="name" columns={columns} data={owners}>
					<Link href="/users/new">
						<Button>Register User</Button>
					</Link>
				</DataTable>
			</ContainerWithTitle>
		</main>
	);
}
