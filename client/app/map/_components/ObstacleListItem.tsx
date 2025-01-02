import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Obstacle } from "@prisma/client";

export default function ObstacleListItem({ obstacle, onClick }: { obstacle: Obstacle; onClick: (obstacle: Obstacle) => void }) {
	return (
		<Card className="my-1 shadow-none hover:shadow-sm cursor-pointer" onClick={() => onClick(obstacle)}>
			<CardHeader>
				<CardTitle>{obstacle.name}</CardTitle>
				<CardDescription>{obstacle.type}</CardDescription>
			</CardHeader>
		</Card>
	);
}
