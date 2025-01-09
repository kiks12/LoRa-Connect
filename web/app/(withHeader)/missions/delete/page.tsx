"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { deleteOperation } from "@/server/actions/operations";

export default function DeleteOperationPage() {
	const { toast } = useToast();
	const params = useSearchParams();
	const operationId = params.get("operationId") ? Number.parseInt(params.get("operationId") as string) : 0;

	async function deleteOnClick() {
		const { error, message } = await deleteOperation(operationId);
		toast({
			variant: error ? "destructive" : "default",
			title: "Delete Confirmation",
			description: message,
		});
	}

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Delete Mission" previousLink="/missions">
				<div className="mt-4 p-16">
					<Card>
						<CardHeader>
							<CardTitle>Delete Confirmation</CardTitle>
						</CardHeader>
						<CardContent>Are you sure you want to delete {operationId}</CardContent>
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
