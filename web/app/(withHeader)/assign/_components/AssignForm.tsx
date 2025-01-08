"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assignSchema } from "@/schema/assign";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bracelets, Owners, Rescuers } from "@prisma/client";
import { TabsContent } from "@radix-ui/react-tabs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BraceletListItem } from "./BraceletListItem";
import { OwnerListItem } from "./OwnerListItem";
import { Input } from "@/components/ui/input";
import { isOwner } from "@/utils/typeGuards";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { setOwnerBracelet } from "@/server/actions/owners";
import { useToast } from "@/hooks/use-toast";
import { setRescuerBracelet } from "@/server/actions/rescuers";
import { Toaster } from "@/components/ui/toaster";

export type OwnerType = "CIVILIAN" | "RESCUER";

export function AssignForm({
	braceletId,
	braceletName,
	ownerId,
	ownerName,
	rescuerId,
	rescuerName,
}: {
	braceletId?: string;
	braceletName?: string;
	ownerName?: string;
	ownerId?: number;
	rescuerId?: number;
	rescuerName?: string;
}) {
	const { toast } = useToast();
	const [ownerType, setOwnerType] = useState<OwnerType>("CIVILIAN");
	const [rescuers, setRescuers] = useState<Rescuers[]>([]);
	const [backupRescuers, setBackupRescuers] = useState<Rescuers[]>([]);
	const [owners, setOwners] = useState<Owners[]>([]);
	const [backupOwners, setBackupOwners] = useState<Owners[]>([]);
	const [bracelets, setBracelets] = useState<Bracelets[]>([]);
	const [backupBracelets, setBackupBracelets] = useState<Bracelets[]>([]);
	const form = useForm<z.infer<typeof assignSchema>>({
		resolver: zodResolver(assignSchema),
		defaultValues: {
			braceletName: braceletName ?? "",
			braceletId: braceletId ?? "",
			ownerId: ownerId ?? rescuerId ?? 0,
			isRescuer: false,
			ownerName: ownerName ?? rescuerName ?? "",
		},
	});

	useEffect(() => {
		const fetchBracelets = async () => {
			return (await fetch("/api/bracelets/available")).json();
		};

		const fetchOwners = async () => {
			return (await fetch("/api/owners/no-bracelets")).json();
		};

		const fetchRescuers = async () => {
			return (await fetch("/api/rescuers/no-bracelets")).json();
		};

		fetchBracelets().then(({ bracelets }) => {
			setBracelets(bracelets);
			setBackupBracelets(bracelets);
		});
		fetchRescuers().then(({ rescuers }) => {
			setRescuers(rescuers);
			setBackupRescuers(rescuers);
		});
		fetchOwners().then(({ owners }) => {
			setOwners(owners);
			setBackupOwners(owners);
		});
	}, []);

	function onBraceletClick(bracelet: Bracelets) {
		form.setValue("braceletId", bracelet.braceletId);
		form.setValue("braceletName", bracelet.name);
	}

	function onOwnerClick(owner: Rescuers | Owners) {
		if (isOwner(owner)) {
			form.setValue("ownerId", (owner as Owners).ownerId);
			form.setValue("ownerName", (owner as Owners).name);
			return;
		}
		form.setValue("ownerId", (owner as Rescuers).rescuerId);
		form.setValue("ownerName", (owner as Rescuers).name);
	}

	function onCheckboxChange(value: boolean) {
		form.setValue("isRescuer", value);
		setOwnerType(value ? "RESCUER" : "CIVILIAN");
	}

	async function onCivilianSubmit({ braceletId, ownerId }: z.infer<typeof assignSchema>) {
		const result = await setOwnerBracelet({ ownerId, braceletId });
		showToast(result);
	}

	async function onRescuerSubmit({ braceletId, ownerId }: z.infer<typeof assignSchema>) {
		const result = await setRescuerBracelet({ rescuerId: ownerId, braceletId });
		showToast(result);
	}

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof assignSchema>) => {
		if (ownerType === "CIVILIAN") onCivilianSubmit(values);
		if (ownerType === "RESCUER") onRescuerSubmit(values);
	});

	function showToast({ error, message }: { error: boolean; message: string }) {
		toast({
			variant: error ? "destructive" : "default",
			title: "Confirmation",
			description: message,
		});
	}

	function filterBracelets(newVal: string) {
		setBracelets(
			backupBracelets.filter(
				(bracelet) => bracelet.name.toLowerCase().includes(newVal.toLowerCase()) || bracelet.braceletId.toLowerCase().includes(newVal.toLowerCase())
			)
		);
	}

	function filterOwners(newVal: string) {
		setOwners(() => {
			return backupOwners.filter((owner) => owner.name.toLowerCase().includes(newVal.toLowerCase()));
		});
		setRescuers(() => {
			return backupRescuers.filter((owner) => owner.name.toLowerCase().includes(newVal.toLowerCase()));
		});
	}

	return (
		<div className="flex flex-col md:flex-row">
			<div className="mt-4 md:mr-2 p-8 w-full">
				<div>
					<h2 className="text-lg">Available Bracelets</h2>
					<div className="mt-3">
						<Input placeholder="Search Bracelet ID or Name..." onChange={(e) => filterBracelets(e.target.value)} />
					</div>
					<div className="h-64 overflow-y-auto">
						<ul>
							{bracelets.map((bracelet, index) => {
								return <BraceletListItem bracelet={bracelet} key={index} onClick={onBraceletClick} />;
							})}
						</ul>
					</div>
				</div>
				<div className="mt-4">
					<h2 className="text-lg">Available Owners</h2>
					<Tabs className="mt-2" defaultValue="CIVILIAN">
						<TabsList>
							<TabsTrigger value="CIVILIAN">Civilian</TabsTrigger>
							<TabsTrigger value="RESCUER">Rescuer</TabsTrigger>
						</TabsList>
						<div className="mt-3">
							<Input placeholder="Search Bracelet ID or Name..." onChange={(e) => filterOwners(e.target.value)} />
						</div>
						<TabsContent value="CIVILIAN">
							<div className="mt-2 h-64 overflow-y-auto">
								<ul className="flex flex-col">
									{owners.map((owner, index) => {
										return <OwnerListItem owner={owner} key={index} onClick={onOwnerClick} />;
									})}
								</ul>
							</div>
						</TabsContent>
						<TabsContent value="RESCUER">
							<div className="mt-2 h-64 overflow-y-auto">
								<ul className="flex max-h-56 overflow-y-auto flex-col">
									{rescuers.map((rescuer, index) => {
										return <OwnerListItem owner={rescuer} key={index} onClick={onOwnerClick} />;
									})}
								</ul>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
			<div className="mt-4 md:ml-2 p-8 w-full">
				<Form {...form}>
					<form onSubmit={onSubmit}>
						<div>
							<FormField
								control={form.control}
								name="braceletId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Bracelet ID</FormLabel>
										<FormControl>
											<Input placeholder="Enter bracelet ID..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="mt-4">
							<FormField
								control={form.control}
								name="braceletName"
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
						<div className="mt-4">
							<FormField
								control={form.control}
								name="ownerId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Owner ID</FormLabel>
										<FormControl>
											<Input placeholder="Enter owner ID..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="mt-4">
							<FormField
								control={form.control}
								name="ownerName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Owner Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter owner name..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="mt-4">
							<FormField
								control={form.control}
								name="isRescuer"
								render={({ field }) => (
									<FormItem className="flex items-center">
										<FormControl>
											<div>
												<Checkbox className="mt-2" id="isRescuer" checked={field.value} onCheckedChange={() => onCheckboxChange(!field.value)} />
												<FormLabel htmlFor="isRescuer" className="ml-3">
													For Rescuer use
												</FormLabel>
											</div>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
						<Button type="submit" className="w-full mt-8">
							Submit
						</Button>
					</form>
				</Form>
			</div>
			<Toaster />
		</div>
	);
}
