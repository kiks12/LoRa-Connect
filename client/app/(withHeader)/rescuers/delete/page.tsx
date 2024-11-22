"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { deleteRescuer } from "@/server/actions/rescuers";

export default function DeleteRescuerPage() {
	const { toast } = useToast();
	const params = useSearchParams();
	const rescuerId = params.get("rescuerId") ? Number.parseInt(params.get("rescuerId") as string) : 0;
	const name = params.get("name") ?? "";

	async function deleteOnClick() {
		const { error, message } = await deleteRescuer({ rescuerId });
		toast({
			variant: error ? "destructive" : "default",
			title: "Delete Confirmation",
			description: message,
		});
	}

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Delete Owner" previousLink="/rescuers">
				<div className="mt-4 p-16">
					<Card>
						<CardHeader>
							<CardTitle>Delete Confirmation</CardTitle>
						</CardHeader>
						<CardContent>
							Are you sure you want to delete {rescuerId} - {name}
						</CardContent>
						<CardFooter className="flex justify-end">
							<Button onClick={deleteOnClick}>Delete</Button>
						</CardFooter>
					</Card>
				</div>
			</ContainerWithTitleAndBackButton>
			<Toaster />
		</main>
	);
}
