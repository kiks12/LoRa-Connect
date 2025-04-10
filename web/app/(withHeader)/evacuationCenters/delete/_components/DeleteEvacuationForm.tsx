"use client";

import { ContainerWithTitleAndBackButton } from "@/app/(withHeader)/_components/ContainerWithTitleAndBackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { deleteEvacuationCenter } from "@/server/actions/evacuationCenters";
import { useSearchParams } from "next/navigation";

export default function DeleteEvacuationForm() {
	const { toast } = useToast();
	const params = useSearchParams();
	const evacuationId = params.get("evacuationId") ? Number.parseInt(params.get("evacuationId") as string) : 0;
	const name = params.get("name") ?? "";

	async function deleteOnClick() {
		const { error, message } = await deleteEvacuationCenter(evacuationId);
		toast({
			variant: error ? "destructive" : "default",
			title: "Delete Confirmation",
			description: message,
		});
		if (!error) {
			location.replace("/evacuationCenters");
		}
	}
	return (
		<ContainerWithTitleAndBackButton title="Delete Bracelet" previousLink="/bracelets">
			<div className="mt-4 p-16">
				<Card>
					<CardHeader>
						<CardTitle>Delete Confirmation</CardTitle>
					</CardHeader>
					<CardContent>
						Are you sure you want to delete {evacuationId} - {name}
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button onClick={deleteOnClick}>Delete</Button>
					</CardFooter>
				</Card>
			</div>
		</ContainerWithTitleAndBackButton>
	);
}
