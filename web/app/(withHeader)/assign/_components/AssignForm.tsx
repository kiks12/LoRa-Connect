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

export type OwnerType = "USER" | "RESCUER";

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
	const [ownerType, setOwnerType] = useState<OwnerType>("USER");
	const [rescuers, setRescuers] = useState<Rescuers[]>([]);
	const [users, setUsers] = useState<Users[]>([]);
	const [searchOwners, setSearchOwners] = useState("");
	const [bracelets, setBracelets] = useState<Bracelets[]>([]);
	const [searchBracelet, setSearchBracelet] = useState("");
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
			return (await fetch("/api/users/no-bracelets")).json();
		};

		const fetchRescuers = async () => {
			return (await fetch("/api/rescuers/no-bracelets")).json();
		};

		fetchBracelets().then(({ bracelets }) => {
			setBracelets(bracelets);
		});
		fetchRescuers().then(({ rescuers }) => {
			setRescuers(rescuers);
		});
		fetchOwners().then(({ owners }) => {
			setUsers(owners);
		});
	}, []);

	function onBraceletClick(bracelet: Bracelets) {
		form.setValue("braceletId", bracelet.braceletId);
		form.setValue("braceletName", bracelet.name);
		if (bracelet.type === "RESCUER") onCheckboxChange(true);
		else onCheckboxChange(false);
	}

	function onOwnerClick(owner: Rescuers | Users) {
		if (ownerType === "RESCUER" && (owner as Users).userId) {
			alert("Invalid, bracelet is rescuer type");
			return;
		}
		if (ownerType === "USER" && (owner as Rescuers).rescuerId) {
			alert("Invalid, bracelet is user type");
			return;
		}
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
		setOwnerType(value ? "RESCUER" : "USER");
	}

	async function onUserSubmit({ braceletId, userId }: z.infer<typeof assignSchema>) {
		const result = await setUserBracelet({ userId, braceletId });
		showToast(result);
	}

	async function onRescuerSubmit({ braceletId, userId }: z.infer<typeof assignSchema>) {
		const result = await setRescuerBracelet({ rescuerId: userId, braceletId });
		showToast(result);
	}

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof assignSchema>) => {
		if (ownerType === "USER") onUserSubmit(values);
		if (ownerType === "RESCUER") onRescuerSubmit(values);
	});

	function showToast({ error, message }: { error: boolean; message: string }) {
		toast({
			variant: error ? "destructive" : "default",
			title: "Confirmation",
			description: message,
		});
	}

	return (
		<div className="flex flex-col md:flex-row">
			<div className="mt-4 md:mr-2 p-8 w-full">
				<Tabs defaultValue="users">
					<TabsList className="w-full">
						<TabsTrigger value="users" className="flex-1">
							Users
						</TabsTrigger>
						<TabsTrigger value="rescuers" className="flex-1">
							Rescuers
						</TabsTrigger>
					</TabsList>
					<div className="mt-2">
						<h2 className="text-lg">Available Bracelets</h2>
						<div className="mt-3">
							<Input placeholder="Search Bracelet ID or Name..." onChange={(e) => setSearchBracelet(e.target.value)} />
						</div>
						<div className="h-64 overflow-y-auto">
							<TabsContent value="users">
								<ul>
									{bracelets
										.filter((b) => (b.braceletId.includes(searchBracelet) || b.name.includes(searchBracelet)) && b.type === "USER")
										.map((bracelet, index) => {
											return <BraceletListItem bracelet={bracelet} key={index} onClick={onBraceletClick} />;
										})}
								</ul>
							</TabsContent>
							<TabsContent value="rescuers">
								<ul>
									{bracelets
										.filter((b) => (b.braceletId.includes(searchBracelet) || b.name.includes(searchBracelet)) && b.type === "RESCUER")
										.map((bracelet, index) => {
											return <BraceletListItem bracelet={bracelet} key={index} onClick={onBraceletClick} />;
										})}
								</ul>
							</TabsContent>
						</div>
					</div>
					<div className="mt-4">
						<h2 className="text-lg">Select owner of device</h2>

						<div className="mt-3">
							<Input placeholder="Search Name..." onChange={(e) => setSearchOwners(e.target.value)} />
						</div>
						<TabsContent value="users">
							<div className="mt-2 h-64 overflow-y-auto">
								<ul className="flex flex-col">
									{users
										.filter((u) => u.name.toLowerCase().includes(searchOwners))
										.map((owner, index) => {
											return <OwnerListItem owner={owner} key={index} onClick={onOwnerClick} />;
										})}
								</ul>
							</div>
						</TabsContent>
						<TabsContent value="rescuers">
							<div className="mt-2 h-64 overflow-y-auto">
								<ul className="flex max-h-56 overflow-y-auto flex-col">
									{rescuers
										.filter((r) => r.name.toLowerCase().includes(searchOwners))
										.map((rescuer, index) => {
											return <OwnerListItem owner={rescuer} key={index} onClick={onOwnerClick} />;
										})}
								</ul>
							</div>
						</TabsContent>
					</div>
				</Tabs>
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
												<Checkbox className="mt-2" id="isRescuer" checked={field.value} onCheckedChange={() => {}} />
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
