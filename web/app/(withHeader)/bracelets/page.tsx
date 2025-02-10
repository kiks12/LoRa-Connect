import { getBracelets } from "@/server/db/bracelets";
import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function BraceletsPages() {
	const bracelets = await getBracelets();

	return (
		<main>
			<ContainerWithTitle title="Devices">
				<DataTable filter="name" columns={columns} data={bracelets}>
					<Link href="/bracelets/new">
						<Button>
							<Plus />
							Create
						</Button>
					</Link>
				</DataTable>
			</ContainerWithTitle>
		</main>
	);
}
