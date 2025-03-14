"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { operationsSchema } from "@/schema/operations";
import { updateOperation } from "@/server/actions/operations";
import { zodResolver } from "@hookform/resolvers/zod";
import { EvacuationCenters, OperationStatus, Users, Rescuers, RescueUrgency, VictimStatusReport } from "@prisma/client";
import { Check, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import VictimStatusReportHeader from "./VictimStatusReportHeader";
import VictimStatusReportInputs from "./VictimStatusReportInputs";
import Spinner from "@/app/components/Spinner";
import { Label } from "@/components/ui/label";
import { syncVictimStatusReports } from "@/server/actions/victimStatusReports";

type FormType = "CREATE" | "UPDATE";
const URGENCY_VALUES = [RescueUrgency.LOW, RescueUrgency.MODERATE, RescueUrgency.SEVERE];
const STATUS_VALUES = [OperationStatus.ASSIGNED, OperationStatus.CANCELED, OperationStatus.COMPLETE, OperationStatus.FAILED, OperationStatus.PENDING];

export default function OperationsForm({
	operationId,
	userName,
	userId,
	numberOfRescuee,
	evacuationCenterName,
	evacuationCenterId,
	status,
	urgency,
	type = "UPDATE",
}: {
	operationId?: string;
	type?: FormType;
	userName?: string;
	userId?: number;
	rescuerName?: string;
	rescuerId?: number;
	evacuationCenterName?: string;
	evacuationCenterId?: number;
	numberOfRescuee?: number;
	status?: OperationStatus;
	urgency?: RescueUrgency;
}) {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof operationsSchema>>({
		resolver: zodResolver(operationsSchema),
		defaultValues: {
			evacuationCenterId: evacuationCenterId ?? 0,
			evacuationCenterName: evacuationCenterName ?? "",
			numberOfRescuee: numberOfRescuee ?? 0,
			userId: userId ?? 0,
			userName: userName ?? "",
			status: status ?? "",
			urgency: urgency ?? "",
		},
	});
	const [users, setOwners] = useState<Users[]>([]);
	const [openOwners, setOpenOwners] = useState(false);
	const [usersSearchValue, setOwnersSearchValue] = useState("");
	const [rescuers, setRescuers] = useState<Rescuers[]>([]);
	const [openRescuers, setOpenRescuers] = useState(false);
	const [rescuersSearchValue, setRescuersSearchValue] = useState("");
	const [evacuationCenters, setEvacuationCenters] = useState<EvacuationCenters[]>([]);
	const [openEvacuationCenters, setOpenEvacuationCenters] = useState(false);
	const [evacuationCentersSearchValue, setEvacuationCentersSearchValue] = useState("");
	const [openUrgency, setOpenUrgency] = useState(false);
	const [urgencyValue, setUrgencyValue] = useState("");
	const [openStatus, setOpenStatus] = useState(false);
	const [statusValue, setStatusValue] = useState("");
	const [victimStatusReportsLoading, setVictimStatusReportsLoading] = useState(true);
	const [victimStatusReports, setVictimStatusReports] = useState<VictimStatusReport[]>([]);
	const [backupVictimStatusReports, setBackupVictimStatusReports] = useState<VictimStatusReport[]>([]);

	useEffect(() => {
		async function fetchVictimStatusReports() {
			setVictimStatusReportsLoading(true);
			const res = await fetch(`/api/operations/${operationId}/victim-status-report`);
			const { victimStatusReports } = await res.json();
			return victimStatusReports;
		}

		fetchVictimStatusReports().then((value) => {
			setVictimStatusReports(value);
			setBackupVictimStatusReports(value);
			setVictimStatusReportsLoading(false);
		});
	}, [operationId]);

	function addVictimStatusReport() {
		setVictimStatusReports((prev) => {
			return [
				...prev,
				{
					age: 0,
					name: "",
					notes: "",
					operationsMissionId: operationId!,
					status: "OKAY",
					victimStatusReportId: 0,
				},
			];
		});
	}

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof operationsSchema>) => {
		if (type === "CREATE") onCreateSubmit();
		if (type === "UPDATE") await onUpdateSubmit(values);
		await handleVictimStatusReportsSync();
	});

	async function handleVictimStatusReportsSync() {
		if (typeof operationId === "undefined") return;
		const result = await syncVictimStatusReports(victimStatusReports, backupVictimStatusReports);
		showToast(result);
	}

	function onCreateSubmit() {}
	async function onUpdateSubmit(values: z.infer<typeof operationsSchema>) {
		if (typeof operationId === "undefined") return;
		const result = await updateOperation({
			dateTime: new Date(),
			missionId: operationId,
			numberOfRescuee: values.numberOfRescuee,
			usersUserId: values.userId,
			teamsTeamId: values.rescuerId,
			status: values.status as OperationStatus,
			urgency: values.urgency as RescueUrgency,
		});
		showToast(result);
	}

	const showToast = ({ error, message }: { error: boolean; message: string }) => {
		toast({
			variant: error ? "destructive" : "default",
			title: "Confirmation",
			description: message,
		});
	};

	useEffect(() => {
		fetch("/api/users")
			.then((res) => res.json())
			.then(({ users }) => setOwners(users));
	}, []);

	useEffect(() => {
		fetch("/api/rescuers")
			.then((res) => res.json())
			.then(({ rescuers }) => setRescuers(rescuers));
	}, []);

	useEffect(() => {
		fetch("/api/evacuation-centers")
			.then((res) => res.json())
			.then(({ evacuationCenters }) => setEvacuationCenters(evacuationCenters));
	}, []);

	return (
		<>
			<Form {...form}>
				<form className="mx-auto w-full" onSubmit={onSubmit}>
					<div className="">
						<div className="flex flex-col md:flex-row">
							<div className="flex-1">
								<FormField
									control={form.control}
									name="userId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Victim ID</FormLabel>
											<FormControl>
												<Input placeholder="Enter victim name..." {...field} readOnly />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="md:my-0 md:mx-4 xs:my-4 flex-1">
								<FormField
									control={form.control}
									name="userName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Victim Name</FormLabel>
											<FormControl>
												<Popover open={openOwners} onOpenChange={setOpenOwners}>
													<PopoverTrigger asChild className="text-left">
														<Input placeholder="Enter victim name..." {...field} />
													</PopoverTrigger>
													<PopoverContent className="w-[480px] p-0">
														<Command>
															<CommandInput placeholder="Search victim..." className="h-9" />
															<CommandList>
																<CommandEmpty>No Owner found.</CommandEmpty>
																<CommandGroup>
																	{users.map((user, index) => (
																		<CommandItem
																			key={index}
																			value={user.name}
																			onSelect={(currentValue) => {
																				setOwnersSearchValue(currentValue === usersSearchValue ? "" : currentValue);
																				setOpenOwners(false);
																				form.setValue("userId", user.userId);
																				form.setValue("userName", user.name);
																				form.setValue("numberOfRescuee", user.numberOfMembersInFamily);
																			}}
																		>
																			{user.name}
																			<Check className={cn("ml-auto", usersSearchValue === user.name ? "opacity-100" : "opacity-0")} />
																		</CommandItem>
																	))}
																</CommandGroup>
															</CommandList>
														</Command>
													</PopoverContent>
												</Popover>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="flex-1">
								<FormField
									control={form.control}
									name="numberOfRescuee"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Number of Victims</FormLabel>
											<FormControl>
												<Input type="number" placeholder="Enter number of victims..." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<div className="flex-1 ml-2"></div>
					</div>
					<div className="mt-8">
						<div className="flex justify-between items-center">
							<h2 className="text-xl font-medium">Victim Status Report</h2>
							<Button variant="secondary" className="no-print" type="button" onClick={addVictimStatusReport}>
								Add Victim Status
							</Button>
						</div>
						<div>
							<VictimStatusReportHeader />
							{victimStatusReportsLoading && (
								<div className="flex justify-center items-center my-4">
									<Spinner />
								</div>
							)}
							{victimStatusReports && victimStatusReports.length > 0 ? (
								victimStatusReports.map((victimStatusReport: VictimStatusReport, index) => {
									return (
										<VictimStatusReportInputs
											victimStatusReport={victimStatusReport}
											key={index}
											setVictimStatusReports={setVictimStatusReports}
											index={index}
										/>
									);
								})
							) : (
								<div className="flex justify-center items-center">
									<Label>No Victim Status Reports</Label>
								</div>
							)}
						</div>
					</div>
					<div className="flex flex-col md:flex-row mt-8">
						<div className="flex-1 md:mr-2">
							<div>
								<FormField
									control={form.control}
									name="rescuerId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Rescuer ID</FormLabel>
											<FormControl>
												<Input placeholder="Enter rescuer name..." {...field} readOnly />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="mt-2">
								<FormField
									control={form.control}
									name="rescuerName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Rescuer Name</FormLabel>
											<FormControl>
												<Popover open={openRescuers} onOpenChange={setOpenRescuers}>
													<PopoverTrigger asChild className="text-left">
														<Input placeholder="Enter victim name..." {...field} />
													</PopoverTrigger>
													<PopoverContent className="w-[480px] p-0">
														<Command>
															<CommandInput placeholder="Search rescuer..." className="h-9" />
															<CommandList>
																<CommandEmpty>No Rescuer found.</CommandEmpty>
																<CommandGroup>
																	{rescuers.map((rescuer, index) => (
																		<CommandItem
																			key={index}
																			value={rescuer.name}
																			onSelect={(currentValue) => {
																				setRescuersSearchValue(currentValue === rescuersSearchValue ? "" : currentValue);
																				setOpenRescuers(false);
																				form.setValue("rescuerId", rescuer.rescuerId);
																				form.setValue("rescuerName", rescuer.name);
																			}}
																		>
																			{rescuer.name}
																			<Check className={cn("ml-auto", rescuersSearchValue === rescuer.name ? "opacity-100" : "opacity-0")} />
																		</CommandItem>
																	))}
																</CommandGroup>
															</CommandList>
														</Command>
													</PopoverContent>
												</Popover>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<div className="flex-1 md:ml-2 md:mt-0 xs:mt-8">
							<div>
								<FormField
									control={form.control}
									name="evacuationCenterId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Evacuation Center ID</FormLabel>
											<FormControl>
												<Input placeholder="Enter evacuation center name..." {...field} readOnly />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="mt-2">
								<FormField
									control={form.control}
									name="evacuationCenterName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Evacuation Center Name</FormLabel>
											<FormControl>
												<Popover open={openEvacuationCenters} onOpenChange={setOpenEvacuationCenters}>
													<PopoverTrigger asChild className="text-left">
														<Input placeholder="Enter evacuation center name..." {...field} />
													</PopoverTrigger>
													<PopoverContent className="w-[480px] p-0">
														<Command>
															<CommandInput placeholder="Search evacuation center..." className="h-9" />
															<CommandList>
																<CommandEmpty>No Evacuation Center found.</CommandEmpty>
																<CommandGroup>
																	{evacuationCenters.map((evacuationCenter, index) => (
																		<CommandItem
																			key={index}
																			value={evacuationCenter.name}
																			onSelect={(currentValue) => {
																				setEvacuationCentersSearchValue(currentValue === evacuationCentersSearchValue ? "" : currentValue);
																				setOpenEvacuationCenters(false);
																				form.setValue("evacuationCenterId", evacuationCenter.evacuationId);
																				form.setValue("evacuationCenterName", evacuationCenter.name);
																			}}
																		>
																			{evacuationCenter.name}
																			<Check
																				className={cn(
																					"ml-auto",
																					evacuationCentersSearchValue === evacuationCenter.name ? "opacity-100" : "opacity-0"
																				)}
																			/>
																		</CommandItem>
																	))}
																</CommandGroup>
															</CommandList>
														</Command>
													</PopoverContent>
												</Popover>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</div>
					<div className="mt-8">
						<FormField
							control={form.control}
							name="urgency"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Urgency</FormLabel>
									<FormControl>
										<Popover open={openUrgency} onOpenChange={setOpenUrgency}>
											<PopoverTrigger asChild className="text-left">
												<Input placeholder="Enter urgency value..." {...field} />
											</PopoverTrigger>
											<PopoverContent className="w-[480px] p-0">
												<Command>
													<CommandInput placeholder="Search urgency value..." className="h-9" />
													<CommandList>
														<CommandEmpty>No Urgency value found.</CommandEmpty>
														<CommandGroup>
															{URGENCY_VALUES.map((value, index) => (
																<CommandItem
																	key={index}
																	value={value}
																	onSelect={(currentValue) => {
																		setUrgencyValue(currentValue === urgencyValue ? "" : currentValue);
																		setOpenUrgency(false);
																		form.setValue("urgency", value);
																	}}
																>
																	{value}
																	<Check className={cn("ml-auto", urgencyValue === value ? "opacity-100" : "opacity-0")} />
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="mt-2">
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Status</FormLabel>
									<FormControl>
										<Popover open={openStatus} onOpenChange={setOpenStatus}>
											<PopoverTrigger asChild className="text-left">
												<Input placeholder="Enter status value..." {...field} />
											</PopoverTrigger>
											<PopoverContent className="w-[480px] p-0">
												<Command>
													<CommandInput placeholder="Search status value..." className="h-9" />
													<CommandList>
														<CommandEmpty>No Status value found.</CommandEmpty>
														<CommandGroup>
															{STATUS_VALUES.map((value, index) => (
																<CommandItem
																	key={index}
																	value={value}
																	onSelect={(currentValue) => {
																		setStatusValue(currentValue === statusValue ? "" : currentValue);
																		setOpenStatus(false);
																		form.setValue("status", value);
																	}}
																>
																	{value}
																	<Check className={cn("ml-auto", statusValue === value ? "opacity-100" : "opacity-0")} />
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="flex justify-end mt-8 no-print">
						<Button type="button" variant="secondary" className="mr-2" onClick={() => window.print()}>
							<Printer />
							Print
						</Button>
						<Button type="submit">Submit</Button>
					</div>
				</form>
				<Toaster />
			</Form>
		</>
	);
}
