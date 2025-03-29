import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { MapProvider } from "@/contexts/MapContext";
import { AppProvider } from "@/contexts/AppContext";
import { ObstaclesProvider } from "@/contexts/ObstacleContext";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata: Metadata = {
	title: "LoRa-Connect",
	description: "Disaster Management System",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ToastProvider>
					<MapProvider>
						<AppProvider>
							<ObstaclesProvider>{children}</ObstaclesProvider>
						</AppProvider>
					</MapProvider>
				</ToastProvider>
			</body>
		</html>
	);
}
