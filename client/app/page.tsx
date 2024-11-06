import { socket } from "@/socket/socket";

socket.on("connect", () => {
	console.log("Connecting");
});

export default function Home() {
	return <p>Hello From Lora</p>;
}
