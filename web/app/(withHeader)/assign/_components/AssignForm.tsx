"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assignSchema } from "@/schema/assign";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bracelets, Users, Rescuers, BraceletType } from "@prisma/client";
import { TabsContent } from "@radix-ui/react-tabs";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BraceletListItem } from "./BraceletListItem";
import { OwnerListItem } from "./OwnerListItem";
import { Input } from "@/components/ui/input";
import { isOwner } from "@/utils/typeGuards";
import { Button } from "@/components/ui/button";
import { setUserBracelet } from "@/server/actions/users";
import { useToast } from "@/hooks/use-toast";
import { setRescuerBracelet } from "@/server/actions/rescuers";
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Spinner from "@/app/components/Spinner";

export function AssignForm({
	braceletId,
	braceletName,
	userId,
	userName,
	rescuerId,
	rescuerName,
	type,
}: {
	braceletId?: string;
	braceletName?: string;
	userName?: string;
	userId?: number;
	rescuerId?: number;
	rescuerName?: string;
	type?: BraceletType;
}) {
	const { toast } = useToast();
	const [submitLoading, setSubmitLoading] = useState(false);
	const [ownerType, _setOwnerType] = useState<BraceletType>(type);
	const [rescuers, setRescuers] = useState<Rescuers[]>([]);
	const [users, setUsers] = useState<Users[]>([]);
	const [searchOwners, setSearchOwners] = useState("");
	const filteredUsers = useMemo(() => {
		return users.filter((user) => {
			return (
				user.givenName.toLowerCase().includes(searchOwners.toLowerCase()) ||
				user.middleName.toLowerCase().includes(searchOwners.toLowerCase()) ||
				user.lastName.toLowerCase().includes(searchOwners.toLowerCase())
			);
		});
	}, [users, searchOwners]);
	const filteredRescuers = useMemo(() => {
		return rescuers.filter((rescuer) => {
			return (
				rescuer.givenName.toLowerCase().includes(searchOwners.toLowerCase()) ||
				rescuer.middleName.toLowerCase().includes(searchOwners.toLowerCase()) ||
				rescuer.lastName.toLowerCase().includes(searchOwners.toLowerCase())
			);
		});
	}, [rescuers, searchOwners]);
	// const [bracelets, setBracelets] = useState<Bracelets[]>([]);
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
		// const fetchBracelets = async () => {
		// 	return (await fetch("/api/bracelets/available")).json();
		// };

		const fetchOwners = async () => {
			return (await fetch("/api/users/no-bracelets")).json();
		};

		const fetchRescuers = async () => {
			return (await fetch("/api/rescuers/no-bracelets")).json();
		};

		// fetchBracelets().then(({ bracelets }) => {
		// 	setBracelets(bracelets);
		// });
		fetchRescuers().then(({ rescuers }) => {
			setRescuers(rescuers);
		});
		fetchOwners().then(({ owners }) => {
			setUsers(owners);
		});
	}, []);

	// function onBraceletClick(bracelet: Bracelets) {
	// 	form.setValue("braceletId", bracelet.braceletId);
	// 	form.setValue("braceletName", bracelet.name);
	// 	if (bracelet.type === "RESCUER") onCheckboxChange(true);
	// 	else onCheckboxChange(false);
	// }

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
			const user = owner as Users;
			form.setValue("userId", user.userId);
			form.setValue("userName", `${user.givenName} ${user.middleName ? `${user.middleName[0]}.` : ""} ${user.lastName}`);
			return;
		}
		const rescuer = owner as Rescuers;
		form.setValue("userId", rescuer.rescuerId);
		form.setValue("userName", `${rescuer.givenName} ${rescuer.middleName ? `${rescuer.middleName[0]}.` : ""} ${rescuer.lastName}`);
	}

	// function onCheckboxChange(value: boolean) {
	// 	form.setValue("isRescuer", value);
	// 	setOwnerType(value ? "RESCUER" : "USER");
	// }

	async function onUserSubmit({ braceletId, userId }: z.infer<typeof assignSchema>) {
		const result = await setUserBracelet({ userId, braceletId });
		if (!result.error) form.reset();
		showToast(result);
	}

	async function onRescuerSubmit({ braceletId, userId }: z.infer<typeof assignSchema>) {
		const result = await setRescuerBracelet({ rescuerId: userId, braceletId });
		if (!result.error) form.reset();
		showToast(result);
	}

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof assignSchema>) => {
		setSubmitLoading(true);
		if (ownerType === "USER") await onUserSubmit(values);
		if (ownerType === "RESCUER") await onRescuerSubmit(values);
		setSubmitLoading(false);
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
				{/* <Tabs defaultValue="users"> */}
				{/* <TabsList className="w-full">
						<TabsTrigger value="users" className="flex-1">
							Users
						</TabsTrigger>
						<TabsTrigger value="rescuers" className="flex-1">
							Rescuers
						</TabsTrigger>
					</TabsList> */}
				{/* <div className="mt-2">
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
					</div> */}
				<div className="">
					<h2 className="text-lg">
						Select <b>{type}</b> from the list
					</h2>

					<div className="mt-3">
						<Input placeholder="Search Name..." onChange={(e) => setSearchOwners(e.target.value)} />
					</div>
					{type === "USER" ? (
						<div className="mt-2 h-96 overflow-y-auto">
							<ul className="flex flex-col">
								{filteredUsers.length > 0 ? (
									filteredUsers.map((owner, index) => {
										return <OwnerListItem owner={owner} key={index} onClick={onOwnerClick} />;
									})
								) : (
									<div className="flex items-center justify-center h-48 w-full">No Users available</div>
								)}
							</ul>
						</div>
					) : (
						<div className="mt-2 h-96 overflow-y-auto">
							<ul className="flex max-h-96 overflow-y-auto flex-col">
								{filteredRescuers.length > 0 ? (
									rescuers.map((rescuer, index) => {
										return <OwnerListItem owner={rescuer} key={index} onClick={onOwnerClick} />;
									})
								) : (
									<div className="flex items-center justify-center h-48 w-full">No Users available</div>
								)}
							</ul>
						</div>
					)}
					{/* <TabsContent value="users">
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
						</TabsContent> */}
				</div>
				{/* </Tabs> */}
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
										<FormLabel>Device ID</FormLabel>
										<FormControl>
											<Input placeholder="Enter Device ID..." {...field} readOnly />
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
										<FormLabel>Device Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter device name..." {...field} readOnly />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						{/* <div className="mt-4">
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
						</div> */}
						<div className="mt-4">
							<FormField
								control={form.control}
								name="userName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{type} Name</FormLabel>
										<FormControl>
											<Input placeholder={`Enter ${type} name...`} {...field} readOnly />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="mt-4">
							{form.getValues().isRescuer && (
								<Alert>
									<AlertTitle className="flex items-center">
										<AlertCircle className="mr-2" />
										Heads up!
									</AlertTitle>
									<AlertDescription>This device is for rescuers</AlertDescription>
								</Alert>
							)}
							{/* <FormField
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
							/> */}
						</div>
						<Button type="submit" className="w-full mt-8">
							{submitLoading ? <Spinner /> : <p>Submit</p>}
						</Button>
					</form>
				</Form>
			</div>
			<Toaster />
		</div>
	);
}
