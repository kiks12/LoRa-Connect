import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { ChevronDown, ChevronUp, Eraser } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function PacketLogs() {
	const { packetLogs, setPacketLogs } = useAppContext();
	const [showPacketLogs, setShowPacketLogs] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);
	const logContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [packetLogs]);

	return (
		<div className="absolute bottom-0 left-0 right-0 w-screen bg-white z-50 shadow border-t">
			<div className="flex items-center justify-between w-full p-1 border-b">
				<p className="text-sm">Packet Logs</p>
				<div>
					<Button variant="ghost" size="icon" onClick={() => setPacketLogs([])}>
						<Eraser />
					</Button>
					<Button variant="ghost" size="icon" onClick={() => setShowPacketLogs(!showPacketLogs)}>
						{showPacketLogs ? <ChevronDown /> : <ChevronUp />}
					</Button>
				</div>
			</div>
			{showPacketLogs && (
				<div className="h-72 overflow-auto" ref={logContainerRef}>
					<div>
						{packetLogs.map((log, index) => {
							return (
								<pre key={index} className="text-sm p-1 mx-4">
									{log}
								</pre>
							);
						})}
						<div ref={bottomRef}></div>
					</div>
				</div>
			)}
		</div>
	);
}
