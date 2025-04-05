"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { rescuerSchema } from "@/schema/rescuer";
import { registerRescuer, updateRescuer } from "@/server/actions/rescuers";

export type RescuerFormType = "CREATE" | "UPDATE";

export const RescuerForm = ({
	rescuerId,
	givenName,
	middleName,
	lastName,
	suffix,
	braceletId,
	type = "CREATE",
}: {
	rescuerId?: number;
	givenName?: string;
	middleName?: string;
	lastName?: string;
	suffix?: string;
	braceletId?: string;
	type?: RescuerFormType;
}) => {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof rescuerSchema>>({
		resolver: zodResolver(rescuerSchema),
		defaultValues: {
			givenName: givenName ?? "",
			middleName: middleName ?? "",
			lastName: lastName ?? "",
			suffix: suffix ?? "",
			braceletId: braceletId ?? "",
		},
	});

	async function onUpdateSubmit(values: z.infer<typeof rescuerSchema>) {
		const result = await updateRescuer({
			rescuer: {
				givenName: values.givenName,
				middleName: values.middleName,
				lastName: values.lastName,
				suffix: values.suffix,
				rescuerId: rescuerId ?? 0,
				createdAt: new Date(),
				teamsTeamId: 0,
			},
		});
		showToast(result);
	}

	async function onCreateSubmit(values: z.infer<typeof rescuerSchema>) {
		const result = await registerRescuer({
			rescuer: {
				createdAt: new Date(),
				givenName: values.givenName,
				middleName: values.middleName,
				lastName: values.lastName,
				suffix: values.suffix,
				rescuerId: 0,
				teamsTeamId: 0,
			},
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
					<div className="flex justify-end mt-4">
						<Button type="submit">Submit</Button>
					</div>
				</form>
			</Form>
			<Toaster />
		</>
	);
};
