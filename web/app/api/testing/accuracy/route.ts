import { GraphHopperAPIResult } from "@/types";
import { methodNotAllowed } from "@/utils/api";
import { haversineDistance } from "@/utils/testing-computation";
import { NextResponse } from "next/server";

function processData(result: GraphHopperAPIResult, points: number[][]) {
  const coordinatesLength = result.paths[0].points.coordinates.length
  const lastCoordinate = result.paths[0].points.coordinates[coordinatesLength-1]
  const lastLng = lastCoordinate[0]
  const lastLat = lastCoordinate[1]
  const margin = haversineDistance(lastLat, lastLng, points[1][1], points[1][0])
  const marginMeters = `${margin.toFixed(2)} m`

  return { targetLat: points[1][1], targetLng: points[1][0], lastLat, lastLng, distanceMargin: marginMeters }
}

export async function POST(request: Request) {
  try {
    const { routes } : {routes: number[][][]} = await request.json()
    const routesResult = routes.map(async (points) => {
      const alternative : GraphHopperAPIResult = await (await fetch("http://localhost:8989/route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          points,
          profile: "car",
          "points_encoded": false,
          "ch.disable": true,
          details: ["average_speed", "road_class"],
          "algorithm": "alternative_route",
          debug: true
        })
      })).json();

      const alternativeData = processData(alternative, points)
      return alternativeData
    })

    const data = await Promise.all(routesResult)

    return NextResponse.json({
      data: data,
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({
      error: error
    }, {
      status: 500
    })
  }
}

export function GET() {
  return methodNotAllowed({})
}

export function PUT() {
  return methodNotAllowed({})
}

export function PATCH() {
  return methodNotAllowed({})
}

export function DELETE() {
  return methodNotAllowed({})
}