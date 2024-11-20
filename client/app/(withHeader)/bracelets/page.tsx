import { getBracelets } from "@/server/db/bracelets";
import { Container } from "../../components/Container";
import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";

const bracelets = await getBracelets();

export default function BraceletsPages() {
	return (
		<main>
			<Container>
				<DataTable columns={columns} data={bracelets} />
			</Container>
		</main>
	);
}
