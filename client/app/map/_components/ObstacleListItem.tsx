import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Obstacle } from "@prisma/client";

export default function ObstacleListItem({ obstacle }: { obstacle: Obstacle }) {
	return (
		<Card className="my-1 shadow-none hover:shadow-sm cursor-pointer">
			<CardHeader>
				<CardTitle>{obstacle.name}</CardTitle>
				<CardDescription>{obstacle.type}</CardDescription>
			</CardHeader>
		</Card>
	);
}
