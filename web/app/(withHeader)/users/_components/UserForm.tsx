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

export type UserFormType = "CREATE" | "UPDATE";

export const UserForm = ({
	userId,
	givenName,
	middleName,
	lastName,
	suffix,
	address,
	braceletId,
	numberOfMembersInFamily,
	type = "CREATE",
}: {
	userId?: number;
	givenName?: string;
	middleName?: string;
	lastName?: string;
	suffix?: string;
	address?: string;
	braceletId?: string;
	numberOfMembersInFamily?: number;
	type?: UserFormType;
}) => {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof ownerSchema>>({
		resolver: zodResolver(ownerSchema),
		defaultValues: {
			givenName: givenName ?? "",
			middleName: middleName ?? "",
			lastName: lastName ?? "",
			suffix: suffix ?? "",
			numberOfMembersInFamily: numberOfMembersInFamily ?? 1,
			braceletId: braceletId ?? "",
			address: address ?? "",
		},
	});

	async function onUpdateSubmit(values: z.infer<typeof ownerSchema>) {
		const result = await updateUser({
			user: {
				givenName: values.givenName,
				middleName: values.middleName,
				lastName: values.lastName,
				suffix: values.suffix,
				address: values.address,
				numberOfMembersInFamily: values.numberOfMembersInFamily,
				userId: userId ?? 0,
				createdAt: new Date(),
			},
		});
		if (!result.error) location.replace("/users");
		showToast(result);
	}

	async function onCreateSubmit(values: z.infer<typeof ownerSchema>) {
		const result = await registerUser({
			user: {
				createdAt: new Date(),
				givenName: values.givenName,
				middleName: values.middleName,
				lastName: values.lastName,
				suffix: values.suffix,
				address: values.address,
				numberOfMembersInFamily: values.numberOfMembersInFamily,
				userId: 0,
			},
		});
		if (!result.error) form.reset();
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
					<div className="mt-8">
						<FormField
							control={form.control}
							name="givenName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Given Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter your given name..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="middleName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Middle Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter your middle name..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="lastName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Last Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter your last name..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="suffix"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Suffix</FormLabel>
									<FormControl>
										<Input placeholder="Enter your suffix..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-8">
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
