import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { COLOR_MAP } from "@/utils/map";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export default function MapLegend() {
	const [show, setShow] = useState(true);
	return (
		<Card className="m-2">
			<CardHeader className="p-4">
				<div className="flex justify-between items-center">
					<CardDescription className="font-medium text-neutral-900 mr-10">Legend</CardDescription>
					<Button size="icon" variant="ghost" onClick={() => setShow(!show)}>
						{show ? <Minus /> : <Plus />}
					</Button>
				</div>
				{show && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: show ? 1 : 0, height: show ? "auto" : 0 }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<div className="flex">
							{Object.keys(COLOR_MAP).map((key, idx) => (
								<div key={idx} className="mr-8 flex items-center">
									<div className="w-[20px] h-[20px] rounded-full" style={{ backgroundColor: COLOR_MAP[key] }}></div>
									<p className="font-light ml-2" style={{ fontSize: "8px" }}>
										{key}
									</p>
								</div>
							))}
						</div>
					</motion.div>
				)}
			</CardHeader>
		</Card>
	);
}
