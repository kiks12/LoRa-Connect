"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";
import { AlertCircle, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import BraceletWithUserListItem from "./BraceletWithUserListItem";

export default function SosModals() {
	const { users } = useAppContext();
	const [userSos, setUserSos] = useState(false);
	const [showUsers, setShowUsers] = useState(false);
	// const [rescuerSos, setRescuerSos] = useState(false);

	useEffect(() => {
		setUserSos(users.some((user) => user.bracelet && user.bracelet.sos));
	}, [users]);

	// useEffect(() => {
	// 	const mapped = teams.map((team) => team.rescuers.find((rescuer) => rescuer.bracelet));
	// 	setRescuerSos(mapped.some((rescuer) => rescuer?.bracelet && rescuer.bracelet.sos));
	// }, [teams]);

	return (
		<>
			{userSos && (
				<>
					<Card className="w-full border border-red-500 bg-red-500 text-white sos-card">
						<CardHeader className="p-2">
							<CardTitle className="flex justify-between items-center">
								<div className="flex items-center">
									<AlertCircle className="mr-2" />
									SOS from User
								</div>
								<div>
									<Button size="icon" variant="ghost" onClick={() => setShowUsers(!showUsers)}>
										<Menu />
									</Button>
									{/* <Button size="icon" variant="ghost" onClick={() => setUserSos(false)}>
										<X />
									</Button> */}
								</div>
							</CardTitle>
						</CardHeader>
					</Card>
					{showUsers && (
						<Card className="mt-2 h-96 overflow-y-auto">
							<CardHeader>
								<CardTitle>
									{users.length > 0 &&
										users
											.filter((user) => user.bracelet && user.bracelet.sos)
											.sort((a, b) => b.bracelet!.urgency! - a.bracelet!.urgency!)
											.map((user, index) => {
												return <BraceletWithUserListItem user={user} onShowLocation={() => {}} withUrgency={true} key={index} />;
											})}
								</CardTitle>
							</CardHeader>
						</Card>
					)}
				</>
			)}
			{/* {rescuerSos && (
				<Card className="w-full border border-red-500 sos-card mt-2">
					<CardHeader className="p-2">
						<CardTitle className="flex justify-between items-center">
							<div className="flex items-center text-red-500">
								<AlertCircle className="mr-2" />
								SOS from Rescuer
							</div>
							<div>
								<Button size="icon" variant="ghost" onClick={() => setRescuerSos(false)}>
									<X />
								</Button>
							</div>
						</CardTitle>
					</CardHeader>
				</Card>
			)} */}
		</>
	);
}
