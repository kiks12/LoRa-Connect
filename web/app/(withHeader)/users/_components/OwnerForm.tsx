"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { ownerSchema } from "@/schema/owners";
import { registerUser, updateUser } from "@/server/actions/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AvailableBraceletsDialog from "../../_components/AvailableBracelets";

export type OwnerFormType = "CREATE" | "UPDATE";

export const UserForm = ({
	userId,
	name,
	address,
	braceletId,
	numberOfMembersInFamily,
	type = "CREATE",
}: {
	userId?: number;
	name?: string;
	address?: string;
	braceletId?: string;
	numberOfMembersInFamily?: number;
	type?: OwnerFormType;
}) => {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof ownerSchema>>({
		resolver: zodResolver(ownerSchema),
		defaultValues: {
			name: name ?? "",
			numberOfMembersInFamily: numberOfMembersInFamily ?? 0,
			braceletId: braceletId ?? "",
			address: address ?? "",
		},
	});

	async function onUpdateSubmit(values: z.infer<typeof ownerSchema>) {
		const result = await updateUser({
			user: {
				name: values.name,
				address: values.address,
				numberOfMembersInFamily: values.numberOfMembersInFamily,
				userId: userId ?? 0,
				createdAt: new Date(),
				latitude: 0,
				longitude: 0,
			},
		});
		showToast(result);
	}

	async function onCreateSubmit(values: z.infer<typeof ownerSchema>) {
		const result = await registerUser({
			user: {
				createdAt: new Date(),
				name: values.name,
				address: values.address,
				numberOfMembersInFamily: values.numberOfMembersInFamily,
				userId: 0,
				longitude: 0,
				latitude: 0,
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

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof ownerSchema>) => {
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
									<FormLabel>User Full Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter fullname..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="numberOfMembersInFamily"
							render={({ field }) => (
								<FormItem>
									<FormLabel>No. of Members in Family</FormLabel>
									<FormControl>
										<Input type="number" placeholder="Enter number of members in family..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Current Address</FormLabel>
									<FormControl>
										<Input type="text" placeholder="Enter full address..." {...field} />
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
