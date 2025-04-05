"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useObstaclesContext } from "@/contexts/ObstacleContext";
import { useObstacles } from "@/hooks/map/use-obstacles";
import { useToast } from "@/hooks/use-toast";
import { obstacleSchema } from "@/schema/obstacle";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const OBSTACLE_TYPE = ["Trash", "Building Debris", "Posts", "Power Line", "Fallen Trees", "Others"];

export default function ObstacleForm({
	name,
	latitude,
	longitude,
	type,
	customType,
	obstacleId,
	editing = false,
}: {
	name?: string;
	latitude?: number;
	longitude?: number;
	type?: string;
	customType?: string;
	obstacleId?: number;
	editing?: boolean;
}) {
	const { toast } = useToast();
	const { currentObstacleMarkerLatLng } = useObstaclesContext();
	const { toggleAddingObstacle, addObstacle, updateObstacle } = useObstacles();
	const form = useForm<z.infer<typeof obstacleSchema>>({
		resolver: zodResolver(obstacleSchema),
		defaultValues: {
			name: name ?? "",
			customType: customType ?? "",
			latitude: latitude ?? 0.0,
			longitude: longitude ?? 0.0,
			type: type ?? OBSTACLE_TYPE[0],
		},
	});

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof obstacleSchema>) => {
		if (editing) await onUpdateSubmit(values);
		else await onCreateSubmit(values);
	});

	async function onUpdateSubmit(values: z.infer<typeof obstacleSchema>) {
		const data = {
			obstacleId: obstacleId,
			name: values.name,
			latitude: values.latitude,
			type: values.type === "Others" ? values.customType : values.type,
			longitude: values.longitude,
		};
		const res = await fetch("/api/obstacles/update", {
			method: "PUT",
			body: JSON.stringify(data),
		});
		const { updatedObstacle } = await res.json();
		if (updatedObstacle) {
			toggleAddingObstacle();
			toast({
				title: "Successful",
				description: "Successfully updated obstacle information",
			});
			updateObstacle(updatedObstacle);
		}
	}

	async function onCreateSubmit(values: z.infer<typeof obstacleSchema>) {
		const data = {
			name: values.name,
			latitude: values.latitude,
			type: values.type === "Others" ? values.customType : values.type,
			longitude: values.longitude,
		};
		const res = await fetch("/api/obstacles/new", {
			method: "POST",
			body: JSON.stringify(data),
		});
		const { createdObstacle } = await res.json();
		if (createdObstacle) {
			toggleAddingObstacle();
			toast({
				title: "Successful",
				description: "Created new obstacle successfully",
			});
			addObstacle(createdObstacle);
		}
	}

	useEffect(() => {
		if (currentObstacleMarkerLatLng) {
			console.log("OBSTACLE FORM", currentObstacleMarkerLatLng);
			form.setValue("latitude", parseFloat(currentObstacleMarkerLatLng.lat.toFixed(6)));
			form.setValue("longitude", parseFloat(currentObstacleMarkerLatLng.lng.toFixed(6)));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentObstacleMarkerLatLng]);

	return (
		<div className="max-w-lg">
			<Form {...form}>
				<form className="mx-auto w-full" onSubmit={onSubmit}>
					<div>
						<h1 className="text-xl font-semibold mt-8">{editing ? "Update Obstacle" : "Add new Obstacle"}</h1>
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
											<Input placeholder="Obstacle name..." {...field} />
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
								<FormItem className="flex flex-col">
									<FormLabel>Type</FormLabel>
									<FormControl>
										<DropdownMenu>
											<DropdownMenuTrigger>
												<div className="p-2 px-2 w-full border rounded-md flex justify-between items-center">
													<p>{field.value}</p>
													<ChevronDown />
												</div>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-full">
												{OBSTACLE_TYPE.map((o, idx) => (
													<DropdownMenuItem className="w-full" key={idx} onClick={() => form.setValue("type", o)}>
														{o}
													</DropdownMenuItem>
												))}
											</DropdownMenuContent>
										</DropdownMenu>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					{form.watch("type") === "Others" && (
						<div className="mt-2">
							<FormField
								control={form.control}
								name="customType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Custom Type</FormLabel>
										<FormControl>
											<Input placeholder="Enter custom obstacle type..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					)}
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
