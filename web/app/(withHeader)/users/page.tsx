"use client";

import { DataTable } from "../../components/DataTable";
import { columns } from "./columns";
import { ContainerWithTitle } from "../_components/ContainerWithTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserWithBracelet } from "@/types";

export default function OwnersPage() {
	const [users, setUsers] = useState<UserWithBracelet[]>([]);

	useEffect(() => {
		fetch("/api/users")
			.then((res) => res.json())
			.then(({ users }) => setUsers(users))
			.catch((e) => alert(e));
	}, []);

	return (
		<main>
			<ContainerWithTitle title="Users">
				<DataTable filter="givenName" columns={columns} data={users}>
					<Link href="/users/new">
						<Button>Register User</Button>
					</Link>
				</DataTable>
			</ContainerWithTitle>
		</main>
	);
}
