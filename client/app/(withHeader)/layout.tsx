import { ReactNode } from "react";
import { Container } from "../components/Container";
import { LINKS } from "../page";
import Link from "next/link";
import { MenuDrawer } from "./_components/MenuDrawer";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<main className="flex flex-col">
			<Header />
			{children}
		</main>
	);
}

const Header = () => {
	return (
		<header className="flex h-20 w-screen">
			<Container className="flex justify-between items-center">
				<div>
					<h1 className="text-lg font-semibold">LoRa Connect</h1>
				</div>
				<div>
					<nav className="block md:hidden">
						<MenuDrawer />
					</nav>
					<nav className="hidden md:block">
						<ul className="flex">
							{LINKS.map((link, index) => {
								return (
									<Link className="px-2" key={index} href={link.link}>
										<li>{link.title}</li>
									</Link>
								);
							})}
						</ul>
					</nav>
				</div>
			</Container>
		</header>
	);
};
