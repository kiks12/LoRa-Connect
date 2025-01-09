import { z } from "zod";


export const operationsSchema = z.object({
  ownerName: z.string().nonempty({
    message: "Owner name should not be empty"
  }),
  ownerId: z.coerce.number({
    message: "Owner ID should be a number"
  }).nonnegative({
    message: "Owner ID should not be negative"
  }).min(1, {
    message: "Owner ID should be greater than 0"
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