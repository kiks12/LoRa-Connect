"use client";

import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import DeleteMissionForm from "./_components/DeleteMissionForm";

export default function DeleteOperationPage() {
	return (
		<main>
			<Suspense>
				<DeleteMissionForm />
			</Suspense>
			<Toaster />
		</main>
	);
}
