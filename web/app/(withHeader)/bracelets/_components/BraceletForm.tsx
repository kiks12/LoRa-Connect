"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { braceletSchema } from "@/schema/bracelets";
import { createBracelet, updateBracelet } from "@/server/actions/bracelets";
import { zodResolver } from "@hookform/resolvers/zod";
import { BraceletType } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export type BraceletFormType = "CREATE" | "UPDATE";

export function BraceletForm({
	name,
	braceletId,
	macAddress,
	type,
	formType = "CREATE",
}: {
	name?: string;
	braceletId?: string;
	macAddress?: string;
	type?: string;
	formType?: BraceletFormType;
}) {
	const [barcode, setBarcode] = useState("");
	const [error, setError] = useState("");
	const { toast } = useToast();
	const form = useForm<z.infer<typeof braceletSchema>>({
		resolver: zodResolver(braceletSchema),
		defaultValues: {
			name: name ?? "",
			macAddress: macAddress ?? "",
			braceletId: braceletId ?? "",
			type: type ?? "USER",
		},
	});

	const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target.value;
		setBarcode(input);

		const format = /^\d{4}-([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}-(U|R)$/;

		if (!format.test(input)) {
			setError("Format must be XXXX-00:1C:2B:3C:4D:5E-U");
		} else {
			const [deviceId, macAddress, type] = input.split("-");
			form.setValue("braceletId", deviceId);
			form.setValue("macAddress", macAddress);
			form.setValue("type", type === "U" ? "USER" : "RESCUER");
			setBarcode("");
			setError("");
		}
	};

	const onCreateSubmit = async (values: z.infer<typeof braceletSchema>) => {
		const result = await createBracelet({
			name: values.name,
			macAddress: values.macAddress,
			braceletId: values.braceletId,
			createdAt: new Date(),
			ownerId: null,
			rescuerId: null,
			type: values.type as BraceletType,
			latitude: null,
			longitude: null,
			sos: false,
			urgency: null,
		});

		if (!result.error) form.reset();
		showToast(result);
	};

	const onUpdateSubmit = async (values: z.infer<typeof braceletSchema>) => {
		if (braceletId === undefined) return;
		const result = await updateBracelet(braceletId, {
			name: values.name,
			macAddress: values.macAddress,
			braceletId: values.braceletId,
			createdAt: new Date(),
			ownerId: null,
			rescuerId: null,
			type: values.type as BraceletType,
			latitude: null,
			longitude: null,
			sos: false,
			urgency: null,
		});
		if (!result.error) location.replace("/bracelets");
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
				<div className="mx-auto w-full md:w-[480px]">
					<p>To register a device, scan the barcode</p>
					<Input placeholder="Barcode" value={barcode} onChange={handleBarcodeChange} readOnly={formType === "UPDATE"} />
					<p className="text-red-500 mt-1">{error}</p>
				</div>
				<form className="mx-auto w-full md:w-[480px] mt-8" onSubmit={onSubmit}>
					<div>
						<FormField
							control={form.control}
							name="braceletId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Device ID</FormLabel>
									<FormControl>
										<Input placeholder="Enter device id..." {...field} readOnly />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="macAddress"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Device Mac Address</FormLabel>
									<FormControl>
										<Input placeholder="Enter mac address name..." {...field} readOnly />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Device Type</FormLabel>
									<FormControl>
										<Input placeholder="Enter device type..." {...field} readOnly />
										{/* <DropdownMenu>
											<DropdownMenuTrigger>
												<Input value={field.value} readOnly className="cursor-pointer" />
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuItem onClick={() => field.onChange("USER")}>USER</DropdownMenuItem>
												<DropdownMenuItem onClick={() => field.onChange("RESCUER")}>RESCUER</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu> */}
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
									<FormLabel>Device Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter device name..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="flex justify-end mt-8">
						<Button type="submit">Submit</Button>
					</div>
				</form>
			</Form>
			<Toaster />
		</>
	);
}
