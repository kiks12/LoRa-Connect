"use client";

import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import DeleteBraceletForm from "./_components/DeleteBraceletForm";

export default function DeleteBraceletPage() {
	return (
		<main>
			<Suspense>
				<DeleteBraceletForm />
			</Suspense>
			<Toaster />
		</main>
	);
}
