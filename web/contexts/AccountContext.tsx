"use client";

import { Accounts } from "@prisma/client";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState, useEffect } from "react";

const AccountContext = createContext<{
	account: Accounts | null;
	setAccount: Dispatch<SetStateAction<Accounts | null>>;
} | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
	const [account, setAccount] = useState<Accounts | null>(() => {
		// Retrieve account data from sessionStorage
		if (typeof window !== "undefined") {
			const storedAccount = sessionStorage.getItem("account");
			return storedAccount ? JSON.parse(storedAccount) : null;
		}
		return null;
	});

	// Save to sessionStorage whenever account changes
	useEffect(() => {
		if (account) {
			sessionStorage.setItem("account", JSON.stringify(account));
		} else {
			sessionStorage.removeItem("account");
		}
	}, [account]);

	return <AccountContext.Provider value={{ account, setAccount }}>{children}</AccountContext.Provider>;
}

export function useAccountContext() {
	const accountContext = useContext(AccountContext);
	if (accountContext === null) throw new Error("App Context is null");
	return accountContext;
}
