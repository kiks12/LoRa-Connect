import { ContainerWithTitleAndBackButton } from "@/app/(withHeader)/_components/ContainerWithTitleAndBackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { deleteOperation } from "@/server/actions/operations";
import { useSearchParams } from "next/navigation";

export default function DeleteMissionForm() {
	const { toast } = useToast();
	const params = useSearchParams();
	const operationId = params.get("operationId") ?? "";

	async function deleteOnClick() {
		const { error, message } = await deleteOperation(operationId);
		toast({
			variant: error ? "destructive" : "default",
			title: "Delete Confirmation",
			description: message,
		});
		if (!error) {
			location.replace("/missions");
		}
	}

	return (
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
	);
}
