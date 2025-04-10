import { ContainerWithTitleAndBackButton } from "@/app/(withHeader)/_components/ContainerWithTitleAndBackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { deleteRescuer } from "@/server/actions/rescuers";
import { useSearchParams } from "next/navigation";

export default function DeleteRescuerForm() {
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
		if (!error) {
			location.replace("/rescuers");
		}
	}

	return (
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
	);
}
