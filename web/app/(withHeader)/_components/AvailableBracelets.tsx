"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function AvailableBraceletsDialog({ onSelect }: { onSelect: (newVal: string) => void }) {
	const [availableBracelets, setAvailableBracelets] = useState<{ braceletId: string }[]>([]);

	useEffect(() => {
		const fetchAvailableBracelets = async () => {
			return (await fetch("/api/bracelets/available")).json();
		};

		fetchAvailableBracelets().then(({ bracelets }) => {
			setAvailableBracelets(bracelets);
		});
	}, []);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<div>
					<Button type="button" variant="secondary">
						Select <ChevronDown />
					</Button>
				</div>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Select Bracelet</DialogTitle>
					<DialogDescription>Choose from the available bracelets</DialogDescription>
				</DialogHeader>
				<ul>
					{availableBracelets.map((value, index) => {
						return (
							<Button
								variant="ghost"
								className=""
								onClick={() => {
									onSelect(value.braceletId);
								}}
								key={index}
							>
								{value.braceletId}
							</Button>
						);
					})}
				</ul>
			</DialogContent>
		</Dialog>
	);
}
