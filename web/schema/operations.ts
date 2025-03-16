import { z } from "zod";


export const operationsSchema = z.object({
  missionId: z.string().nonempty({
    message: "Mission ID should not be empty"
  }),
  dateTime: z.date().nullable(),
  distance: z.coerce.number(),
  eta: z.coerce.number(),
  timeOfArrival: z.date().nullable(),
  timeOfCompletion: z.date().nullable(),
  userName: z.string().nonempty({
    message: "User name should not be empty"
  }),
  userId: z.coerce.number({
    message: "User ID should be a number"
  }).nonnegative({
    message: "User ID should not be negative"
  }).min(1, {
    message: "User ID should be greater than 0"
  }),
  userBraceletId: z.string(),
  teamName: z.string().nonempty({
    message: "Team name should not be empty"
  }),
  teamId: z.coerce.number({
    message: "Team ID should be a number"
  }).nonnegative({
    message: "Team ID should not be negative"
  }).min(1, {
    message: "Team ID should be greater than 0"
  }),
  teamBraceletId: z.string(),
  urgency: z.string().nonempty({
    message: "Urgency should not be empty"
  }),
  status: z.string().nonempty({
    message: "Status should not be empty"
  }),
  numberOfRescuee: z.coerce.number().nonnegative({
    message: "Number of victims should not be negative"
  }),
  evacuationCenterName: z.string().nullable(),
})