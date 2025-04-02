"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { accountSchema } from "@/schema/account";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function RegisterAccountForm() {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof accountSchema>>({
		resolver: zodResolver(accountSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof accountSchema>) => {
		fetch("/api/accounts/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(values),
		})
			.then(async (res) => {
				const json = await res.json();
				if (res.status === 200) {
					toast({
						title: "Successful registration",
						description: "Your account is successfully registered",
					});
					location.reload();
				} else {
					toast({
						variant: "destructive",
						title: "Error",
						description: json.error.code === "2002" ? "Email is already in use" : "Unknown Error",
					});
				}
			})
			.catch((e) => {
				toast({
					variant: "destructive",
					title: "Error",
					description: e,
				});
			});
	});

	return (
		<div className="h-screen w-screen flex flex-col items-center justify-center">
			<Card className="w-1/3 p-4">
				<CardHeader className="flex flex-col items-center">
					<Image src="/logos/single-line-transparent.png" height={50} width={300} alt="logo" />
					<h1 className="text-2xl font-semibold mt-6">Register an Admin Account</h1>
					<p>Fill in the form to continue</p>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form className="mx-auto w-full md:w-[480px]" onSubmit={onSubmit}>
							<div className="mt-8">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input placeholder="example@email.com" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="mt-2">
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<Input type="password" placeholder="Enter your password..." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="flex justify-end mt-8">
								<Button type="submit" className="w-full" onSubmit={onSubmit}>
									Register
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
			<Toaster />
		</div>
	);
}
