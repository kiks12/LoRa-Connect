import { Container } from "@/app/components/Container";
import { ReactNode } from "react";

export const ContainerWithTitle = ({ children, title }: { title: string; children: ReactNode }) => {
	return (
		<main className="flex flex-col">
			<Container>
				<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
				<div className="mt-2">{children}</div>
			</Container>
		</main>
	);
};
