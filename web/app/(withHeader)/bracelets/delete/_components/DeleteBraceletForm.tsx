import { ContainerWithTitleAndBackButton } from "@/app/(withHeader)/_components/ContainerWithTitleAndBackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { deleteBracelet } from "@/server/actions/bracelets";
import { useSearchParams } from "next/navigation";

export default function DeleteBraceletForm() {
	const { toast } = useToast();
	const params = useSearchParams();
	const braceletId = params.get("braceletId") ?? "";
	const name = params.get("name") ?? "";

	async function deleteOnClick() {
		const { error, message } = await deleteBracelet(braceletId);
		toast({
			variant: error ? "destructive" : "default",
			title: "Delete Confirmation",
			description: message,
		});
	}

	return (
		<ContainerWithTitleAndBackButton title="Delete Device" previousLink="/bracelets">
			<div className="mt-4 p-16">
				<Card>
					<CardHeader>
						<CardTitle>Delete Confirmation</CardTitle>
					</CardHeader>
					<CardContent>
						Are you sure you want to delete {braceletId} - {name}
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button onClick={deleteOnClick}>Delete</Button>
					</CardFooter>
				</Card>
			</div>
		</ContainerWithTitleAndBackButton>
	);
}
