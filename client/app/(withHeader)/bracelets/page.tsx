import { getBracelets } from "@/server/db/bracelets";
import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

const bracelets = await getBracelets();

export default function BraceletsPages() {
	return (
		<main>
			<ContainerWithTitle title="Bracelets">
				<div className="flex justify-end py-2"></div>
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
