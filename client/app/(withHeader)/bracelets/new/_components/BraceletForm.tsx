"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { braceletSchema } from "@/schema/bracelets";
import { createBracelet } from "@/server/actions/bracelets";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const BraceletForm = () => {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof braceletSchema>>({
		resolver: zodResolver(braceletSchema),
		defaultValues: {
			name: "",
			braceletId: "",
		},
	});

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof braceletSchema>) => {
		const { error, message } = await createBracelet({ name: values.name, braceletId: values.braceletId, createdAt: new Date() });

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
					<div className="flex justify-end mt-4">
						<Button type="submit">Submit</Button>
					</div>
				</form>
			</Form>
			<Toaster />
		</>
	);
};
