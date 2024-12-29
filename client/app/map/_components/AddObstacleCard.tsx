"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMapContext } from "@/hooks/use-map";
import { useSidebarContext } from "@/hooks/use-sidebar";
import { useToast } from "@/hooks/use-toast";
import { obstacleSchema } from "@/schema/obstacle";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function AddObstacleCard() {
	const { toast } = useToast();
	const { currentObstacleMarkerLngLat, toggleAddingObstacle, addObstacle } = useMapContext();
	const { toggleSidebar } = useSidebarContext();
	const form = useForm<z.infer<typeof obstacleSchema>>({
		resolver: zodResolver(obstacleSchema),
		defaultValues: {
			name: "",
			latitude: 0.0,
			longitude: 0.0,
			type: "",
		},
	});

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof obstacleSchema>) => {
		const data = { name: values.name, latitude: values.latitude, type: values.type, longitude: values.longitude };
		const res = await fetch("/api/obstacles/new", {
			method: "POST",
			body: JSON.stringify(data),
		});
		const { createdObstacle } = await res.json();
		if (createdObstacle) {
			toggleAddingObstacle();
			toggleSidebar();
			toast({
				title: "Successful",
				description: "Created new obstacle successfully",
			});
			addObstacle(createdObstacle);
		}
	});

	useEffect(() => {
		if (currentObstacleMarkerLngLat) {
			form.setValue("latitude", currentObstacleMarkerLngLat.lat);
			form.setValue("longitude", currentObstacleMarkerLngLat.lng);
		}
	}, [currentObstacleMarkerLngLat]);

	return (
		<div className="max-w-lg">
			<Form {...form}>
				<form className="mx-auto w-96" onSubmit={onSubmit}>
					<div>
						<h1 className="text-xl font-semibold">Add new Obstacle</h1>
						<Label>Complete the form to continue</Label>
					</div>
					<div className="mt-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<div className="flex">
											<Input className="mr-2" placeholder="Obstacle name..." {...field} />
										</div>
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
								<FormItem>
									<FormLabel>Type</FormLabel>
									<FormControl>
										<Input placeholder="Enter obstacle type..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-12">
						<h2 className="text-lg font-semibold">Select Location</h2>
						<Label>Click the location on the map</Label>
					</div>
					<div className="mt-8">
						<FormField
							control={form.control}
							name="latitude"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Latitude</FormLabel>
									<FormControl>
										<Input type="number" placeholder="Enter latitude..." {...field} readOnly />
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
										<Input type="number" placeholder="Enter longitude..." {...field} readOnly />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="flex justify-end mt-8">
						<Button type="submit" className="w-full">
							Submit
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
