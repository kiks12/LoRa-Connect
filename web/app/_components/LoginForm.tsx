"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { useAccountContext } from "@/contexts/AccountContext";
import { useToast } from "@/hooks/use-toast";
import { accountSchema } from "@/schema/account";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { lazy, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const RegisterAccountForm = lazy(() => import("./RegisterAccountForm"));
const Spinner = lazy(() => import("../components/Spinner"));

export default function LoginForm() {
	const { setAccount } = useAccountContext();
	const form = useForm<z.infer<typeof accountSchema>>({
		resolver: zodResolver(accountSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});
	const { toast } = useToast();
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/accounts/count")
			.then((res) => res.json())
			.then(({ count }) => {
				setCount(count);
				setLoading(false);
			})
			.catch((e) => {
				toast({
					description: e,
				});
			});
	}, [toast]);

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof accountSchema>) => {
		fetch("/api/accounts/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(values),
		})
			.then(async (res) => {
				const json = await res.json();
				if (res.status !== 200) {
					toast({
						variant: "destructive",
						description: json.message,
					});
				} else {
					toast({
						title: "Successful login",
						description: "You are now logged in!",
					});
					setAccount(() => json.account);
				}
			})
			.catch((e) => {
				toast({
					description: e,
				});
			});
	});

	return (
		<>
			{loading ? (
				<div className="h-screen w-screen flex items-center justify-center">
					<Spinner />
				</div>
			) : (
				<div className="bg-[url(/bg.jpg)] bg-cover">
					{count > 0 ? (
						<>
							<div className="h-screen w-screen flex flex-col items-center justify-center">
								<Card className="w-1/3 p-4">
									<CardHeader className="flex flex-col items-center">
										<Image src="/logos/single-line-transparent.png" height={50} width={300} alt="logo" />
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
														Login
													</Button>
												</div>
											</form>
										</Form>
									</CardContent>
								</Card>
							</div>
						</>
					) : (
						<RegisterAccountForm />
					)}
				</div>
			)}
			<Toaster />
		</>
	);
}
