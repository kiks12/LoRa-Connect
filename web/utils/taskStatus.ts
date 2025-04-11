import { OperationStatus } from "@prisma/client";

export const MISSION_STATUS_MAP = {
  "1": OperationStatus.ASSIGNED,
  "2": OperationStatus.PENDING,
  "3": OperationStatus.CANCELED,
  "4": OperationStatus.FAILED,
  "5": OperationStatus.COMPLETE,
}