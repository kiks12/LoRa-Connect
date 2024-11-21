"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { deleteOwner } from "@/server/actions/owners";
import { useSearchParams } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

export default function DeleteOwnerPage() {
	const { toast } = useToast();
	const params = useSearchParams();
	const ownerId = params.get("ownerId") ? Number.parseInt(params.get("ownerId") as string) : 0;
	const name = params.get("name") ?? "";

	async function deleteOnClick() {
		const { error, message } = await deleteOwner({ ownerId: ownerId });
		toast({
			variant: error ? "destructive" : "default",
			title: "Delete Confirmation",
			description: message,
		});
	}

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Delete Owner" previousLink="/owners">
				<div className="mt-4 p-16">
					<Card>
						<CardHeader>
							<CardTitle>Delete Confirmation</CardTitle>
						</CardHeader>
						<CardContent>
							Are you sure you want to delete {ownerId} - {name}
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
