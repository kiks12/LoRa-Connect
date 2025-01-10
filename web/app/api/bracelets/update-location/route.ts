import { updateBraceletLocation } from "@/server/db/bracelets"
import { NextResponse } from "next/server"


export async function PATCH(req: Request) {
  const {braceletId, latitude, longitude}: {
    braceletId: string, 
    latitude: number, 
    longitude: number
  }= await req.json()
  await updateBraceletLocation({braceletId, latitude: parseFloat(latitude.toFixed(6)), longitude: parseFloat(longitude.toFixed(6))})

  return NextResponse.json({
    message: "Update Bracelet Location"
  })
}