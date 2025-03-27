"use client";

import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import DeleteRescuerForm from "./_components/DeleteRescuerForm";

export default function DeleteRescuerPage() {
	return (
		<main>
			<Suspense>
				<DeleteRescuerForm />
			</Suspense>
			<Toaster />
		</main>
	);
}
