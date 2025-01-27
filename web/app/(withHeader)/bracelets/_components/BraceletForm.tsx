"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { braceletSchema } from "@/schema/bracelets";
import { createBracelet, updateBracelet } from "@/server/actions/bracelets";
import { zodResolver } from "@hookform/resolvers/zod";
import { BraceletType } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";

export type BraceletFormType = "CREATE" | "UPDATE";

export function BraceletForm({
	name,
	braceletId,
	type,
	formType = "CREATE",
}: {
	name?: string;
	braceletId?: string;
	type?: string;
	formType?: BraceletFormType;
}) {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof braceletSchema>>({
		resolver: zodResolver(braceletSchema),
		defaultValues: {
			name: name ?? "",
			braceletId: braceletId ?? "",
			type: type ?? "VICTIM",
		},
	});

	const onCreateSubmit = async (values: z.infer<typeof braceletSchema>) => {
		const result = await createBracelet({
			name: values.name,
			braceletId: values.braceletId,
			createdAt: new Date(),
			ownerId: null,
			rescuerId: null,
			type: values.type as BraceletType,
		});

		showToast(result);
	};

	const onUpdateSubmit = async (values: z.infer<typeof braceletSchema>) => {
		if (braceletId === undefined) return;
		const result = await updateBracelet(braceletId, {
			name: values.name,
			braceletId: values.braceletId,
			createdAt: new Date(),
			ownerId: null,
			rescuerId: null,
			type: values.type as BraceletType,
		});
		showToast(result);
	};

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof braceletSchema>) => {
		if (formType === "CREATE") onCreateSubmit(values);
		if (formType === "UPDATE") onUpdateSubmit(values);
	});

	const showToast = ({ error, message }: { error: boolean; message: string }) => {
		toast({
			variant: error ? "destructive" : "default",
			title: "Confirmation",
			description: message,
		});
	};

	return (
		<>
			<Form {...form}>
				<form className="mx-auto w-full md:w-[480px]" onSubmit={onSubmit}>
					<div>
						<FormField
							control={form.control}
							name="braceletId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Bracelet ID</FormLabel>
									<FormControl>
										<Input placeholder="Enter bracelet id..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Bracelet Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter bracelet name..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-4">
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Bracelet Type</FormLabel>
									<FormControl>
										<DropdownMenu>
											<DropdownMenuTrigger>
												<Input value={field.value} readOnly className="cursor-pointer" />
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuItem onClick={() => field.onChange("VICTIM")}>VICTIM</DropdownMenuItem>
												<DropdownMenuItem onClick={() => field.onChange("RESCUER")}>RESCUER</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
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
}
