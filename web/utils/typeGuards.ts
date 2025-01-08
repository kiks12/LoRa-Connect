import { Owners, Rescuers } from "@prisma/client";

export function isOwner(owner: Rescuers | Owners) {
  return (owner as Owners).ownerId !== undefined;
}