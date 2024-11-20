import { Container } from "@/app/components/Container";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export const ContainerWithTitleAndBackButton = ({ title, children, previousLink }: { previousLink: string; title: string; children: ReactNode }) => {
	return (
		<main className="flex flex-col">
			<Container>
				<div className="flex items-center">
					<Link href={previousLink}>
						<Button variant="outline" className="rounded-full">
							<ArrowLeft />
						</Button>
					</Link>
					<h1 className="text-2xl ml-3 font-semibold tracking-tight">{title}</h1>
				</div>
				<div className="mt-2">{children}</div>
			</Container>
		</main>
	);
};
