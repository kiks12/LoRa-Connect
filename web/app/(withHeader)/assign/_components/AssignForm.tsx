"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assignSchema } from "@/schema/assign";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bracelets, Users, Rescuers } from "@prisma/client";
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
import { setUserBracelet } from "@/server/actions/users";
import { useToast } from "@/hooks/use-toast";
import { setRescuerBracelet } from "@/server/actions/rescuers";
import { Toaster } from "@/components/ui/toaster";

export type OwnerType = "CIVILIAN" | "RESCUER";

export function AssignForm({
	braceletId,
	braceletName,
	userId,
	userName,
	rescuerId,
	rescuerName,
}: {
	braceletId?: string;
	braceletName?: string;
	userName?: string;
	userId?: number;
	rescuerId?: number;
	rescuerName?: string;
}) {
	const { toast } = useToast();
	const [ownerType, setOwnerType] = useState<OwnerType>("CIVILIAN");
	const [rescuers, setRescuers] = useState<Rescuers[]>([]);
	const [backupRescuers, setBackupRescuers] = useState<Rescuers[]>([]);
	const [owners, setOwners] = useState<Users[]>([]);
	const [backupOwners, setBackupOwners] = useState<Users[]>([]);
	const [bracelets, setBracelets] = useState<Bracelets[]>([]);
	const [backupBracelets, setBackupBracelets] = useState<Bracelets[]>([]);
	const form = useForm<z.infer<typeof assignSchema>>({
		resolver: zodResolver(assignSchema),
		defaultValues: {
			braceletName: braceletName ?? "",
			braceletId: braceletId ?? "",
			userId: userId ?? rescuerId ?? 0,
			isRescuer: false,
			userName: userName ?? rescuerName ?? "",
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

	function onOwnerClick(owner: Rescuers | Users) {
		if (isOwner(owner)) {
			form.setValue("userId", (owner as Users).userId);
			form.setValue("userName", (owner as Users).name);
			return;
		}
		form.setValue("userId", (owner as Rescuers).rescuerId);
		form.setValue("userName", (owner as Rescuers).name);
	}

	function onCheckboxChange(value: boolean) {
		form.setValue("isRescuer", value);
		setOwnerType(value ? "RESCUER" : "CIVILIAN");
	}

	async function onCivilianSubmit({ braceletId, userId }: z.infer<typeof assignSchema>) {
		const result = await setUserBracelet({ userId, braceletId });
		showToast(result);
	}

	async function onRescuerSubmit({ braceletId, userId }: z.infer<typeof assignSchema>) {
		const result = await setRescuerBracelet({ rescuerId: userId, braceletId });
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
					<Tabs className="mt-2" defaultValue="users">
						<TabsList>
							<TabsTrigger value="users">Users</TabsTrigger>
							<TabsTrigger value="rescuers">Rescuers</TabsTrigger>
						</TabsList>
						<div className="mt-3">
							<Input placeholder="Search Name..." onChange={(e) => filterOwners(e.target.value)} />
						</div>
						<TabsContent value="users">
							<div className="mt-2 h-64 overflow-y-auto">
								<ul className="flex flex-col">
									{owners.map((owner, index) => {
										return <OwnerListItem owner={owner} key={index} onClick={onOwnerClick} />;
									})}
								</ul>
							</div>
						</TabsContent>
						<TabsContent value="rescuers">
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
								name="userId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>User/Rescuer ID</FormLabel>
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
								name="userName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>User/Rescuer Name</FormLabel>
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
