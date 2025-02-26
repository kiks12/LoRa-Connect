import { lazy } from "react";

const Spinner = lazy(() => import("./Spinner"));

export default function Loading() {
	return (
		<main className="h-screen w-screen flex justify-center items-center">
			<Spinner />
		</main>
	);
}
