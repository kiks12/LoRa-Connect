import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogPortal,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Obstacle } from "@prisma/client";
import { MoreVerticalIcon } from "lucide-react";
import ShowStatusIndicator from "./ShowStatusIndicator";
import { ObstacleWithStatusIdentifier } from "@/types";
import { useObstacles } from "@/hooks/map/use-obstacles";

export default function ObstacleListItem({
	obstacle,
	onClick,
	onDelete,
}: {
	obstacle: ObstacleWithStatusIdentifier;
	onClick: (obstacle: Obstacle) => void;
	onDelete: (obstacle: number) => void;
}) {
	const { toast } = useToast();
	const { toggleAddingObstacle } = useObstacles();

	function onEditClick() {
		toggleAddingObstacle();
		// toggleSidebar();

		// setComponent(<ObstacleForm {...obstacle} editing={true} />);
		// setCloseCallback(["TOGGLE_ADDING_OBSTACLE"]);
	}

	async function deleteObstacle() {
		const deleted = await fetch("/api/obstacles/delete", {
			method: "DELETE",
			body: JSON.stringify({ obstacleId: obstacle.obstacleId }),
		});
		if (deleted) {
			toast({
				title: "Successful",
				description: "Success fully deleted obstacle",
			});
			onDelete(obstacle.obstacleId);
		}
	}

	return (
		<>
			<Card className={`my-1 shadow-none hover:border-primary cursor-pointer`}>
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<div className="flex items-center">
								<CardTitle className="hover:underline" onClick={() => onClick(obstacle)}>
									{obstacle.name}
								</CardTitle>
								<div className="mx-2">
									<ShowStatusIndicator show={obstacle.showing} />
								</div>
							</div>
							<CardDescription className="mt-2 text-xs">Type: {obstacle.type}</CardDescription>
						</div>
						<AlertDialog>
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger asChild>
									<Button size="icon" variant="ghost">
										<MoreVerticalIcon />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuLabel>Actions</DropdownMenuLabel>
									<DropdownMenuItem onClick={onEditClick}>Edit</DropdownMenuItem>
									<AlertDialogTrigger asChild>
										<DropdownMenuItem>Delete</DropdownMenuItem>
									</AlertDialogTrigger>
								</DropdownMenuContent>
							</DropdownMenu>
							<AlertDialogPortal>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Confirmation</AlertDialogTitle>
									</AlertDialogHeader>
									<AlertDialogDescription>Are you sure you want to delete this obstacle?</AlertDialogDescription>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction type="submit" onClick={deleteObstacle}>
											Continue
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialogPortal>
						</AlertDialog>
					</div>
				</CardHeader>
			</Card>
		</>
	);
}
