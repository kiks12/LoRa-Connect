import { GraphHopperAPIResult } from "@/types";
import { methodNotAllowed } from "@/utils/api";
import { NextResponse } from "next/server";

function processData(result: GraphHopperAPIResult) {
  const data = result.paths.map((path) => {
    const visitedNodesAverage = result.hints["visited_nodes.average"]
    const visitedNodesSum = result.hints["visited_nodes.sum"]
    const distance = (path.distance / 1000)
    const distanceKm = `${distance.toFixed(2)} km`
    const time = (path.time) / 1000
    const timeSeconds = `${time.toFixed(2)}s`
    const speed = (distance / time) * 3600
    const speedKmPerHour = `${speed} km/h`
    
    return { distance: distanceKm, time: timeSeconds, speed: speedKmPerHour, visitedNodesAverage, visitedNodesSum}
  })

  return data
}

export async function POST(request: Request) {
  try {
    const { routes } : {routes: number[][][]}= await request.json()
    const result = routes.map(async (points) => {
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
          "alternative_route.max_paths": 15,
          "alternative_route.max_weight_factor": 3.0,
          "alternative_route.max_share_factor": 0.8,
          "algorithm": "alternative_route",
          debug: true
        })
      })).json();

      const final : GraphHopperAPIResult = await (await fetch("http://localhost:8989/route", {
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
        })
      })).json();

      const all = processData(alternative)
      const finalData = processData(final)

      return {all, final: finalData, points}
    })

    const data = await Promise.all(result)

    return NextResponse.json({
      data
    })
  } catch (error) {
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