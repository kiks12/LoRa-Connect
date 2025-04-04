import Spinner from "@/app/components/Spinner";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ReactNode } from "react";

export default function DataSection({
	loading,
	title,
	description,
	data,
	link,
	icon,
}: {
	loading: boolean;
	title: string;
	description: string;
	data: number;
	link?: string;
	icon?: ReactNode;
}) {
	return (
		<Card className="border-0 shadow-md flex-1">
			<CardHeader>
				{loading ? (
					<div className="flex items-center justify-center">
						<Spinner />
					</div>
				) : (
					<>
						<div className="mb-4">
							<h2 className="text-xl font-semibold">{title}</h2>
						</div>
						<div className="flex">
							{icon && <div className="mr-4">{icon}</div>}
							<div>
								<CardTitle className="text-3xl font-bold">{data}</CardTitle>
								{link ? (
									<Link href={link}>
										<CardDescription className="hover:underline">{description.toUpperCase()}</CardDescription>
									</Link>
								) : (
									<CardDescription>{title.toUpperCase()}</CardDescription>
								)}
							</div>
						</div>
					</>
				)}
			</CardHeader>
		</Card>
	);
}
