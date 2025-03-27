"use client";

import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import DeleteEvacuationForm from "./_components/DeleteEvacuationForm";

export default function DeleteEvacuationCentersPage() {
	return (
		<main>
			<Suspense>
				<DeleteEvacuationForm />
			</Suspense>
			<Toaster />
		</main>
	);
}
