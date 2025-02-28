import { Users, Rescuers } from "@prisma/client";

export function isOwner(owner: Rescuers | Users) {
  return (owner as Users).userId !== undefined;
}