import { GraphHopperAPIResult } from "@/types";
import { methodNotAllowed } from "@/utils/api";
import { customModels } from "@/utils/routing";
import { NextResponse } from "next/server";

function processData(result: GraphHopperAPIResult, obstacles: {speed: {if: string, "multiply_by": string}[] } = {speed: []}) {
  const visitedNodesAverage = result.hints["visited_nodes.average"]
  const visitedNodesSum = result.hints["visited_nodes.sum"]
  const distance = (result.paths[0].distance / 1000)
  const distanceKm = `${distance.toFixed(2)} km`
  const time = (result.paths[0].time) / 1000
  const timeSeconds = `${time.toFixed(2)}s`
  const speed = (distance / time) * 3600
  const speedKmPerHour = `${speed} km/h`
  const averageSpeed = result.paths[0].details.average_speed.join(" ")
  return { distance: distanceKm, time: timeSeconds, speed: speedKmPerHour, averageSpeed,  visitedNodesAverage, visitedNodesSum, obstacles: obstacles.speed.length}
}

export async function POST(request: Request) {
  try {
    const {points, custom_model: customModel } = await request.json()
    const baselineDijkstra : GraphHopperAPIResult = await (await fetch("http://localhost:8989/route", {
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
        "alternative_route.max_paths": 3,
        "alternative_route.max_weight_factor": 2,
        "alternative_route.max_share_factor": 0.5,
        "algorithm": "dijkstra",
        "custom_model": customModels["FASTEST"]
      })
    })).json();
    const baselineAstar : GraphHopperAPIResult = await (await fetch("http://localhost:8989/route", {
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
        "alternative_route.max_paths": 3,
        "alternative_route.max_weight_factor": 2,
        "alternative_route.max_share_factor": 0.5,
        "algorithm": "astar",
        "custom_model": customModels["FASTEST"]
      })
    })).json();
    const baselineAlternative : GraphHopperAPIResult = await (await fetch("http://localhost:8989/route", {
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
        "alternative_route.max_paths": 3,
        "alternative_route.max_weight_factor": 2,
        "alternative_route.max_share_factor": 0.5,
        "algorithm": "alternative_route",
        "custom_model": customModels["FASTEST"]
      })
    })).json();
    const dijkstra : GraphHopperAPIResult = await (await fetch("http://localhost:8989/route", {
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
        "alternative_route.max_paths": 3,
        "alternative_route.max_weight_factor": 2,
        "alternative_route.max_share_factor": 0.5,
        "algorithm": "dijkstra",
        "custom_model": customModel
      })
    })).json();
    const astar : GraphHopperAPIResult = await (await fetch("http://localhost:8989/route", {
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
        "alternative_route.max_paths": 3,
        "alternative_route.max_weight_factor": 2,
        "alternative_route.max_share_factor": 0.5,
        "algorithm": "astar",
        "custom_model": customModel
      })
    })).json();
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
        "alternative_route.max_paths": 3,
        "alternative_route.max_weight_factor": 2,
        "alternative_route.max_share_factor": 0.5,
        "algorithm": "alternative_route",
        "custom_model": customModel,
        debug: true
      })
    })).json();

    const baselineDijkstraData = processData(baselineDijkstra)
    const baselineAstarData = processData(baselineAstar)
    const baselineAlternativeData = processData(baselineAlternative)
    const dijkstraData  = processData(dijkstra, customModel)
    const astarData = processData(astar, customModel)
    const alternativeData = processData(alternative, customModel)

    return NextResponse.json({
      baselineDijkstra: baselineDijkstraData,
      baselineAstar: baselineAstarData,
      baselineAlternative: baselineAlternativeData,
      dijkstra: dijkstraData,
      astar: astarData,
      alternative: alternativeData,
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