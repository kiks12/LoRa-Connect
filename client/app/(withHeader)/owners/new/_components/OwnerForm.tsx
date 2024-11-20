"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { ownerSchema } from "@/schema/owners";
import { registerOwner } from "@/server/actions/owners";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AvailableBraceletsDialog from "./AvailableBracelets";

export const OwnerForm = () => {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof ownerSchema>>({
		resolver: zodResolver(ownerSchema),
		defaultValues: {
			name: "",
			numberOfMembersInFamily: 0,
			braceletId: "",
		},
	});

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof ownerSchema>) => {
		const { error, message } = await registerOwner({
			owner: {
				createdAt: new Date(),
				name: values.name,
				numberOfMembersInFamily: values.numberOfMembersInFamily,
				ownerId: 0,
				longitude: 0,
				latitude: 0,
			},
			braceletId: values.braceletId,
		});

		toast({
			variant: error ? "destructive" : "default",
			title: "Confirmation",
			description: message,
		});
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
									<FormLabel>Owner Name</FormLabel>
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
					<div className="flex justify-end mt-4">
						<Button type="submit">Submit</Button>
					</div>
				</form>
			</Form>
			<Toaster />
		</>
	);
};
