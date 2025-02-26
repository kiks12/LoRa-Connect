import { Container } from "@/app/components/Container";
import HOME_LINKS from "@/app/links";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import Link from "next/link";

export const MenuDrawer = () => {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button size="icon" variant={"ghost"}>
					<Menu />
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<Container>
					<DrawerHeader>
						<DrawerTitle></DrawerTitle>
						<DrawerDescription></DrawerDescription>
					</DrawerHeader>
					<div className="w-full">
						<ul>
							{HOME_LINKS.map((value, index) => {
								return (
									<Link href={value.link} className="p-2" key={index}>
										<li className="text-center">{value.title}</li>
									</Link>
								);
							})}
						</ul>
					</div>
				</Container>
			</DrawerContent>
		</Drawer>
	);
};
