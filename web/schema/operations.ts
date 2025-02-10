import { z } from "zod";


export const operationsSchema = z.object({
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
  rescuerName: z.string().nonempty({
    message: "Owner name should not be empty"
  }),
  rescuerId: z.coerce.number({
    message: "Rescuer ID should be a number"
  }).nonnegative({
    message: "Rescuer ID should not be negative"
  }).min(1, {
    message: "Rescuer ID should be greater than 0"
  }),
  evacuationCenterName: z.string().nonempty({
    message: "Owner name should not be empty"
  }),
  evacuationCenterId: z.coerce.number({
    message: "Evacuation Center ID should be a number"
  }).nonnegative({
    message: "Evacuation Center ID should not be negative"
  }).min(1, {
    message: "Evacuation Center ID should be greater than 0"
  }),
  urgency: z.string().nonempty({
    message: "Urgency should not be empty"
  }),
  status: z.string().nonempty({
    message: "Status should not be empty"
  }),
  numberOfRescuee: z.coerce.number().nonnegative({
    message: "Number of victims should not be negative"
  })
})