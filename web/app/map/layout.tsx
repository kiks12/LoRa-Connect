import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/contexts/AppContext";
import { SidebarProvider } from "@/hooks/use-sidebar";

export const metadata = {
	title: "LoRa-Connect Map",
	description: "Offline Map",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<AppProvider>
			<SidebarProvider>
				{children}
				<Toaster />
			</SidebarProvider>
		</AppProvider>
	);
}
