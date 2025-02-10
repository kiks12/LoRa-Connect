"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ContainerWithTitleAndBackButton } from "../../_components/ContainerWithTitleAndBackButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { deleteUser } from "@/server/actions/users";
import { useSearchParams } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

export default function DeleteOwnerPage() {
	const { toast } = useToast();
	const params = useSearchParams();
	const userId = params.get("userId") ? Number.parseInt(params.get("userId") as string) : 0;
	const name = params.get("name") ?? "";

	async function deleteOnClick() {
		const { error, message } = await deleteUser({ userId: userId });
		toast({
			variant: error ? "destructive" : "default",
			title: "Delete Confirmation",
			description: message,
		});
	}

	return (
		<main>
			<ContainerWithTitleAndBackButton title="Delete User" previousLink="/users">
				<div className="mt-4 p-16">
					<Card>
						<CardHeader>
							<CardTitle>Delete Confirmation</CardTitle>
						</CardHeader>
						<CardContent>
							Are you sure you want to delete {userId} - {name}
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
