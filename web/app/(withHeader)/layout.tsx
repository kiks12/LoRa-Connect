import { ReactNode } from "react";
import { Container } from "../components/Container";
import Link from "next/link";
import { MenuDrawer } from "./_components/MenuDrawer";
import HOME_LINKS from "../links";
import Image from "next/image";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<main className="flex flex-col">
			<Header />
			<div className="mt-2">{children}</div>
		</main>
	);
}

const Header = () => {
	return (
		<header className="flex h-20 w-screen border-b no-print">
			<Container className="flex justify-between items-center">
				<div>
					<Image src="/logos/single-line-transparent.png" height={50} width={200} alt="Logo" />
				</div>
				<div>
					<nav className="block md:hidden">
						<MenuDrawer />
					</nav>
					<nav className="hidden md:block">
						<ul className="flex">
							{HOME_LINKS.map((link, index) => {
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
