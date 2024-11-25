"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { evacuationCenterSchema } from "@/schema/evacuationCenters";
import { createEvacuationCenter, updateEvacuationCenter } from "@/server/actions/evacuationCenters";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export type EvacuationFormType = "CREATE" | "UPDATE";

export function EvacuationForm({
	name,
	evacuationId,
	capacity,
	latitude,
	longitude,
	type = "CREATE",
}: {
	evacuationId?: number;
	name?: string;
	capacity?: number;
	latitude?: number;
	longitude?: number;
	type?: EvacuationFormType;
}) {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof evacuationCenterSchema>>({
		resolver: zodResolver(evacuationCenterSchema),
		defaultValues: {
			name: name ?? "",
			capacity: capacity ?? 0,
			latitude: latitude ?? 0,
			longitude: longitude ?? 0,
		},
	});

	const onCreateSubmit = async ({ name, longitude, latitude, capacity }: z.infer<typeof evacuationCenterSchema>) => {
		const result = await createEvacuationCenter({
			name: name,
			capacity: capacity,
			latitude: latitude,
			longitude: longitude,
			evacuationId: 0,
			createdAt: new Date(),
		});

		showToast(result);
	};

	const onUpdateSubmit = async ({ name, capacity, latitude, longitude }: z.infer<typeof evacuationCenterSchema>) => {
		const result = await updateEvacuationCenter({
			name: name,
			capacity: capacity,
			latitude: latitude,
			longitude: longitude,
			evacuationId: evacuationId ?? 0,
			createdAt: new Date(),
		});

		showToast(result);
	};

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof evacuationCenterSchema>) => {
		if (type === "CREATE") onCreateSubmit(values);
		if (type === "UPDATE") onUpdateSubmit(values);
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
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter evacuation center name..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="capacity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Capacity</FormLabel>
									<FormControl>
										<Input type="number" placeholder="Enter evacuation center capacity..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="latitude"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Latitude</FormLabel>
									<FormControl>
										<Input type="number" placeholder="Enter evacuation center latitude..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="longitude"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Longitude</FormLabel>
									<FormControl>
										<Input type="number" placeholder="Enter evacuation center longitude..." {...field} />
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
