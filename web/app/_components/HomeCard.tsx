"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ReactNode } from "react";

export default function HomeCard({ subtitle, title, link, icon }: { subtitle?: string; title: string; link: string; icon?: ReactNode }) {
	return (
		<Link href={link}>
			<Card className="shadow-md hover:shadow-2xl border-white/40 hover:bg-white/70 hover:border-white justify-center rounded-2xl items-center px-4 py-8 min-h-[215px] bg-white/10 backdrop-blur-3xl transition">
				<CardContent className="pt-4">
					<div className="flex flex-col items-center justify-center">
						{icon && <div>{icon}</div>}
						<h2 className="text-xl font-medium mt-4">{title}</h2>
						<p className="text-xs mt-2">{subtitle}</p>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
