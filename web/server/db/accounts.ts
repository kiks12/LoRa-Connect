import { client } from "@/prisma/client";
import { Accounts } from "@prisma/client";
import { hash } from "bcrypt";

export async function createAccount(account: Accounts) {
  const hashedPassword = await hash(account.password, 10)
  const { accountId, ...others } = account
  others.password = hashedPassword

  return await client.accounts.create({
    data: {
      ...others,
    }
  })
}

export async function getAdminAccounts() {
  return await client.accounts.findMany()
}

export async function getAccount(accountId: string) {
  return await client.accounts.findUnique({
    where: {
      accountId: accountId
    }
  })
}

export async function getAccountWithEmail(email: string) {
  return await client.accounts.findUnique({
    where: {
      email: email
    }
  })
}