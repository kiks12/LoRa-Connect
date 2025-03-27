"use client";

import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import DeleteOwnerForm from "./_components/DeleteOwner";

export default function DeleteOwnerPage() {
	return (
		<main>
			<Suspense>
				<DeleteOwnerForm />
			</Suspense>
			<Toaster />
		</main>
	);
}
