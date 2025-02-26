"use client";

import { ReactNode } from "react";

export const Container = ({ children, className }: { children: ReactNode; className?: string }) => {
	return <div className={"container mx-auto px-4" + " " + className}>{children}</div>;
};
