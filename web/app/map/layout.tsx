import { Toaster } from "@/components/ui/toaster";
import { MapProvider } from "@/hooks/use-map";
import { SidebarProvider } from "@/hooks/use-sidebar";

export const metadata = {
	title: "LoRa-Connect Map",
	description: "Offline Map",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<MapProvider>
			<SidebarProvider>
				{children}

				<Toaster />
			</SidebarProvider>
		</MapProvider>
	);
}
