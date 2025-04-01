"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { cn, formatLocalDateTime } from "@/lib/utils";
import { operationsSchema } from "@/schema/operations";
import { updateOperation } from "@/server/actions/operations";
import { zodResolver } from "@hookform/resolvers/zod";
import { EvacuationCenters, OperationStatus, Users, Rescuers, RescueUrgency, VictimStatusReport } from "@prisma/client";
import { Check, FileDiff, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import VictimStatusReportHeader from "./VictimStatusReportHeader";
import VictimStatusReportInputs from "./VictimStatusReportInputs";
import Spinner from "@/app/components/Spinner";
import { Label } from "@/components/ui/label";
import { syncVictimStatusReports } from "@/server/actions/victimStatusReports";
import { OperationsWithPayload } from "@/types";

type FormType = "CREATE" | "UPDATE";
const URGENCY_VALUES = [RescueUrgency.LOW, RescueUrgency.MODERATE, RescueUrgency.SEVERE];
const STATUS_VALUES = [OperationStatus.ASSIGNED, OperationStatus.CANCELED, OperationStatus.COMPLETE, OperationStatus.FAILED, OperationStatus.PENDING];

export default function OperationsForm({ missionId, type = "UPDATE" }: { missionId: string; type?: FormType }) {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof operationsSchema>>({
		resolver: zodResolver(operationsSchema),
		defaultValues: {
			missionId: missionId,
			distance: 0.0,
			eta: 0.0,
			dateTime: new Date(),
			timeOfArrival: new Date(),
			timeOfCompletion: new Date(),
			evacuationCenterName: "",
			numberOfRescuee: 0,
			status: "",
			teamBraceletId: "",
			teamId: 0,
			teamName: "",
			urgency: "",
			userBraceletId: "",
			userId: 0,
			userName: "",
		},
	});
	const [mission, setMission] = useState<OperationsWithPayload | null>(null);
	const [fetchingLoading, setFetchingLoading] = useState(true);

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
			const res = await fetch(`/api/operations/${missionId}/victim-status-report`);
			const { victimStatusReports } = await res.json();
			return victimStatusReports;
		}

		fetchVictimStatusReports().then((value) => {
			setVictimStatusReports(value);
			setBackupVictimStatusReports(value);
			setVictimStatusReportsLoading(false);
		});
	}, [missionId]);

	function addVictimStatusReport() {
		setVictimStatusReports((prev) => {
			return [
				...prev,
				{
					age: 0,
					name: "",
					notes: "",
					operationsMissionId: missionId!,
					status: "OKAY",
					victimStatusReportId: 0,
				},
			];
		});
	}

	const onSubmit = form.handleSubmit(async (values: z.infer<typeof operationsSchema>) => {
		console.log(values);
		if (type === "CREATE") onCreateSubmit();
		if (type === "UPDATE") await onUpdateSubmit(values);
		await handleVictimStatusReportsSync();
	});

	async function handleVictimStatusReportsSync() {
		if (typeof missionId === "undefined") return;
		const result = await syncVictimStatusReports(victimStatusReports, backupVictimStatusReports);
		showToast(result);
	}

	function onCreateSubmit() {}
	async function onUpdateSubmit(values: z.infer<typeof operationsSchema>) {
		console.log(values, missionId);
		if (typeof missionId === "undefined") return;
		const result = await updateOperation({
			missionId,
			createAt: new Date(),
			dateTime: new Date(),
			distance: values.distance,
			eta: values.eta,
			timeOfArrival: values.timeOfArrival,
			timeOfCompletion: values.timeOfCompletion,
			evacuationCenter: values.evacuationCenterName,
			numberOfRescuee: values.numberOfRescuee,
			status: values.status as OperationStatus,
			urgency: values.urgency as RescueUrgency,
			teamsTeamId: values.teamId,
			usersUserId: values.userId,
			teamBraceletId: mission?.teamBraceletId ?? "",
			userBraceletId: mission?.userBraceletId ?? "",
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
		setFetchingLoading(true);
		fetch(`/api/operations/${missionId}`)
			.then((res) => res.json())
			.then(({ mission }) => {
				setMission(mission);
				setFetchingLoading(false);
			});
	}, [missionId]);

	useEffect(() => {
		if (mission !== null) {
			const { dateTime, distance, eta, timeOfArrival, timeOfCompletion, Teams, missionId, numberOfRescuee, user, evacuationCenter, status, urgency } =
				mission;
			form.setValue("missionId", missionId);
			form.setValue("dateTime", dateTime);
			form.setValue("distance", distance);
			form.setValue("eta", eta);
			form.setValue("timeOfArrival", timeOfArrival);
			form.setValue("timeOfCompletion", timeOfCompletion);
			form.setValue("userId", user.userId);
			form.setValue("userName", user.name);
			form.setValue("status", status);
			form.setValue("urgency", urgency);
			form.setValue("numberOfRescuee", numberOfRescuee);
			form.setValue("teamId", Teams!.teamId!);
			form.setValue("teamName", Teams!.name!);
			form.setValue("evacuationCenterName", evacuationCenter ?? "");
		}
	}, [form, mission]);

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
			{fetchingLoading ? (
				<div className="min-h-96 flex w-full justify-center items-center">
					<Spinner />
				</div>
			) : (
				<Form {...form}>
					<form className="mx-auto w-full" onSubmit={onSubmit}>
						<div className="">
							<div>
								<h1 className="text-2xl font-medium mb-2">Mission Details</h1>
							</div>
							<div className="flex flex-col">
								<div className="flex-1">
									<FormField
										control={form.control}
										name="missionId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>MissionID</FormLabel>
												<FormControl>
													<Input placeholder="" {...field} readOnly />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
							<div className="flex flex-col mt-4">
								<div className="flex-1">
									<FormField
										control={form.control}
										name="dateTime"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Date/Time</FormLabel>
												<FormControl>
													<Input
														{...form.register("dateTime", {
															valueAsDate: true,
														})}
														placeholder=""
														{...field}
														value={new Date(field.value!).toLocaleString()}
														readOnly
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
							<div className="flex justify-between mt-4">
								<div className="flex-1">
									<FormField
										control={form.control}
										name="distance"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Distance in km </FormLabel>
												<FormControl>
													<Input placeholder="" {...field} value={(field.value / 1000).toFixed(2)} readOnly />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="flex-1 ml-2">
									<FormField
										control={form.control}
										name="eta"
										render={({ field }) => (
											<FormItem>
												<FormLabel>ETA in seconds</FormLabel>
												<FormControl>
													<Input placeholder="" {...field} value={(field.value / 1000).toFixed(2)} readOnly />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
							<div className="flex justify-between mt-4">
								<div className="flex-1">
									<FormField
										control={form.control}
										name="timeOfArrival"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Time of Arrival</FormLabel>
												<FormControl>
													<Input placeholder="" {...field} value={field.value ? formatLocalDateTime(field.value) : ""} type="datetime-local" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="flex-1 ml-2">
									<FormField
										control={form.control}
										name="timeOfCompletion"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Time of Completion</FormLabel>
												<FormControl>
													<Input placeholder="" {...field} value={field.value ? formatLocalDateTime(field.value) : ""} type="datetime-local" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
							<div className="flex mt-4">
								<div className="flex-1 mr-1">
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
								<div className="flex-1 ml-1">
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
							</div>
							<div className="mt-4">
								<FormField
									control={form.control}
									name="evacuationCenterName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Evacuation Center Name</FormLabel>
											<FormControl>
												<Popover open={openEvacuationCenters} onOpenChange={setOpenEvacuationCenters}>
													<PopoverTrigger asChild className="text-left">
														<Input placeholder="Enter evacuation center name..." {...field} value={field.value ?? ""} />
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
							<Spacer />
							<div>
								<h1 className="text-2xl font-medium mb-2">User Information</h1>
							</div>
							<div className="flex flex-col md:flex-row mt-4">
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
									<div className="flex justify-center items-center mt-10">
										<Label>No Victim Status Reports</Label>
									</div>
								)}
							</div>
						</div>
						<Spacer />
						<div>
							<h1 className="text-2xl font-medium mb-2">Rescuer Information</h1>
						</div>
						<div className="flex justify-between">
							<div className="flex-1 mr-1">
								<FormField
									control={form.control}
									name="teamId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Team ID</FormLabel>
											<FormControl>
												<Input placeholder="Enter team id..." {...field} readOnly />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="ml-1 flex-1">
								<FormField
									control={form.control}
									name="teamName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Team Name</FormLabel>
											<FormControl>
												<Popover open={openRescuers} onOpenChange={setOpenRescuers}>
													<PopoverTrigger asChild className="text-left">
														<Input placeholder="Enter team name..." {...field} />
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
																				form.setValue("teamId", rescuer.rescuerId);
																				form.setValue("teamName", rescuer.name);
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
						<div className="flex justify-end mt-8 no-print">
							<Button type="button" variant="secondary" className="mr-2" onClick={() => window.print()}>
								<Printer />
								Print
							</Button>
							<Button type="submit" onSubmit={onSubmit}>
								Submit
							</Button>
						</div>
					</form>
					<Toaster />
				</Form>
			)}
		</>
	);
}

function Spacer() {
	return <div className="w-full border-b my-14"></div>;
}
