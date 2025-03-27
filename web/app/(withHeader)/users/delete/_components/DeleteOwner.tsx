import { ContainerWithTitleAndBackButton } from "@/app/(withHeader)/_components/ContainerWithTitleAndBackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { deleteUser } from "@/server/actions/users";
import { useSearchParams } from "next/navigation";

export default function DeleteOwnerForm() {
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
	);
}
