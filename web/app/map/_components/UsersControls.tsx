"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserWithStatusIdentifier } from "@/types";
import { USER_SOURCE_BASE } from "@/utils/tags";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import Spinner from "@/app/components/Spinner";
import BraceletWithUserListItem from "./BraceletWithUserListItem";
import { useUsers } from "@/hooks/map/use-users";
import { useMapContext } from "@/contexts/MapContext";

export default function UsersControls() {
	const { clearSourcesAndLayers } = useMapContext();
	const { users, onShowLocation, refreshUsers, usersLoading } = useUsers();
	const [search, setSearch] = useState("");

	function onClearClick() {
		clearSourcesAndLayers(USER_SOURCE_BASE);
	}

	function onChange(e: React.FormEvent<HTMLInputElement>) {
		setSearch(e.currentTarget.value);
	}

	return (
		<div className="pt-6 pb-2 h-full flex flex-col justify-content">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-medium">Users List</h2>
				<Button size="icon" variant="secondary" onClick={refreshUsers}>
					<RefreshCcw />
				</Button>
			</div>
			<div className="flex-1 overflow-y-auto">
				<div>
					{/* <div className="flex justify-between items-center mt-2 border rounded-md p-3">
						<Label className="ml-3" htmlFor="showLocations">
							Show Locations
						</Label>
						<Switch id="showLocations" checked={showUserLocations} onCheckedChange={() => setShowUserLocations(!showUserLocations)} />
					</div> */}
					<div className="my-2">
						<Label>Search User</Label>
						<Input placeholder="Francis Tolentino..." onChange={onChange} value={search} />
					</div>
					<Tabs defaultValue="ALL">
						<div className="flex justify-between">
							<TabsList>
								<TabsTrigger value="ALL">All</TabsTrigger>
								<TabsTrigger value="WITH-BRACELET">W/ Bracelet</TabsTrigger>
								<TabsTrigger value="WITHOUT-BRACELET">W/O Bracelet</TabsTrigger>
							</TabsList>
							<Button variant="outline" onClick={onClearClick}>
								Clear
							</Button>
						</div>
						{usersLoading ? (
							<div className="mt-10 flex items-center justify-center">
								<Spinner />
							</div>
						) : (
							<>
								<TabsContent value="ALL">
									<ul className="h-[550px] overflow-y-auto">
										{users.length > 0 ? (
											users.map((user, index) => {
												if (
													user.givenName.toLowerCase().includes(search.toLowerCase()) ||
													user.lastName.toLowerCase().includes(search.toLowerCase()) ||
													user.middleName.toLowerCase().includes(search.toLowerCase())
												)
													return <BraceletWithUserListItem key={index} user={user} onShowLocation={() => onShowLocation(user)} withUrgency={false} />;
											})
										) : (
											<p className="mt-20 text-center">No Users to show</p>
										)}
									</ul>
								</TabsContent>
								<TabsContent value="WITH-BRACELET">
									<ul className="h-[550px] overflow-y-auto">
										{users.length > 0 ? (
											users
												.filter((user) => user.bracelet)
												.map((user, index) => {
													if (
														user.givenName.toLowerCase().includes(search.toLowerCase()) ||
														user.lastName.toLowerCase().includes(search.toLowerCase()) ||
														user.middleName.toLowerCase().includes(search.toLowerCase())
													)
														return (
															<BraceletWithUserListItem key={index} user={user} onShowLocation={() => onShowLocation(user)} withUrgency={false} />
														);
												})
										) : (
											<p className="mt-20 text-center">No Users to show</p>
										)}
									</ul>
								</TabsContent>
								<TabsContent value="WITHOUT-BRACELET">
									<ul className="h-[550px] overflow-y-auto">
										{users.length > 0 ? (
											users
												.filter((user: UserWithStatusIdentifier) => !user.bracelet)
												.map((user, index) => {
													if (
														user.givenName.toLowerCase().includes(search.toLowerCase()) ||
														user.lastName.toLowerCase().includes(search.toLowerCase()) ||
														user.middleName.toLowerCase().includes(search.toLowerCase())
													)
														return (
															<BraceletWithUserListItem
																key={index}
																user={user}
																onShowLocation={() => {
																	alert("User do not have a bracelet");
																}}
																withUrgency={false}
															/>
														);
												})
										) : (
											<p className="mt-20 text-center">No Users to show</p>
										)}
									</ul>
								</TabsContent>
							</>
						)}
					</Tabs>
				</div>
			</div>
		</div>
	);
}
