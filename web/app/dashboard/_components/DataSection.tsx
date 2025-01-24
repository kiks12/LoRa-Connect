import Spinner from "@/app/components/Spinner";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DataSection({ loading, title, data }: { loading: boolean; title: string; data: number }) {
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
						<CardDescription>{title}</CardDescription>
					</div>
				)}
			</CardHeader>
		</Card>
	);
}
