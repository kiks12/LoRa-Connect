import Spinner from "@/app/components/Spinner";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DataSection({ loading, title, data, link }: { loading: boolean; title: string; data: number; link?: string }) {
	return (
		<Card className="border-0 shadow-md flex-1">
			<CardHeader>
				{loading ? (
					<div className="flex items-center justify-center">
						<Spinner />
					</div>
				) : (
					<div>
						<CardTitle className="text-3xl font-bold">{data}</CardTitle>
						{link ? (
							<Link href={link}>
								<CardDescription className="hover:underline">{title}</CardDescription>
							</Link>
						) : (
							<CardDescription>{title}</CardDescription>
						)}
					</div>
				)}
			</CardHeader>
		</Card>
	);
}
