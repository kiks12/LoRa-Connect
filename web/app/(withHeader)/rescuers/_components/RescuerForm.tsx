"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AvailableBraceletsDialog from "../../_components/AvailableBracelets";
import { rescuerSchema } from "@/schema/rescuer";
import { registerRescuer, updateRescuer } from "@/server/actions/rescuers";

export type RescuerFormType = "CREATE" | "UPDATE";

export const RescuerForm = ({
	rescuerId,
	name,
	braceletId,
	type = "CREATE",
}: {
	rescuerId?: number;
	name?: string;
	braceletId?: string;
	type?: RescuerFormType;
}) => {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof rescuerSchema>>({
		resolver: zodResolver(rescuerSchema),
		defaultValues: {
			name: name ?? "",
			braceletId: braceletId ?? "",
		},
	});

	async function onUpdateSubmit(values: z.infer<typeof rescuerSchema>) {
		const result = await updateRescuer({
			rescuer: {
				name: values.name,
				rescuerId: rescuerId ?? 0,
				createdAt: new Date(),
				latitude: 0,
				longitude: 0,
				teamsTeamId: 0,
			},
		});
		showToast(result);
	}

	async function onCreateSubmit(values: z.infer<typeof rescuerSchema>) {
		const result = await registerRescuer({
			rescuer: {
				createdAt: new Date(),
				name: values.name,
				rescuerId: 0,
				longitude: 0,
				latitude: 0,
				teamsTeamId: 0,
			},
			braceletId: values.braceletId,
		});
		showToast(result);
	}

	function showToast({ error, message }: { error: boolean; message: string }) {
		toast({
			variant: error ? "destructive" : "default",
			title: "Confirmation",
			description: message,
		});
	}

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof rescuerSchema>) => {
		if (type === "CREATE") onCreateSubmit(values);
		if (type === "UPDATE") onUpdateSubmit(values);
	});

	return (
		<>
			<Form {...form}>
				<form className="mx-auto w-full md:w-[480px]" onSubmit={onSubmit}>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="braceletId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Bracelet ID</FormLabel>
									<FormControl>
										<div className="flex">
											<Input className="mr-2" placeholder="Enter bracelet id..." {...field} />
											<AvailableBraceletsDialog
												onSelect={(newVal: string) => {
													form.setValue(field.name, newVal);
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Rescuer Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter fullname..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="flex justify-end mt-4">
						<Button type="submit">Submit</Button>
					</div>
				</form>
			</Form>
			<Toaster />
		</>
	);
};
