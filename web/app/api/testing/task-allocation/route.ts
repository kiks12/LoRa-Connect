import { calculateTeamAssignmentCosts, runHungarianAlgorithm } from "@/app/algorithm";
import { MissionWithCost, ObstacleWithStatusIdentifier, TeamWithStatusIdentifier, UserWithStatusIdentifier } from "@/types";
import { methodNotAllowed } from "@/utils/api";
import { NextResponse } from "next/server";

function updateRescuerLocations(assignments: MissionWithCost[]) {
  const rescuerLocations = new Map<number, { lat: number; lon: number }>();

  assignments.forEach(({ teamId, coordinates }) => {
    if (coordinates && coordinates.length > 0) {
      const lastCoord = coordinates[coordinates.length - 1];
      rescuerLocations.set(teamId, { lat: lastCoord[1], lon: lastCoord[0] });
    }
  });

  return rescuerLocations;
}

export async function POST(request: Request) {
  try {
    const { routes }: { routes: { users: UserWithStatusIdentifier[], teams: TeamWithStatusIdentifier[], obstacles: ObstacleWithStatusIdentifier[] }[] } = await request.json();

    for (const [idx, { users, teams, obstacles }] of routes.entries()) {
      console.log(`\n\n🚀 Processing Dataset #${idx+1} 🚀`);
      console.log(`---------------------------------`);

      let rescuerLocations = new Map<number, { lat: number; lon: number }>();
      let unassignedUsers = [...users]; // Copy users list to track unassigned ones
      const assignedUserIds = new Set<number>(); // Track already assigned users

      console.time(`⏳ Processing Time - Dataset #${idx+1}`);
      let iteration = 1

      while (unassignedUsers.length > 0) {
        console.log(`\n🔹 Step: Calculating Cost Matrix for Dataset #${idx+1} -- iteration #${iteration}`);

        // 🔹 Step 1: Calculate Costs
        const costs = await calculateTeamAssignmentCosts(teams, obstacles, rescuerLocations, unassignedUsers);
        if (costs.length === 0) {
          console.warn("⚠️ No valid assignments found. Exiting loop.");
          break;
        }

        // 🔹 Step 2: Assign Teams using Hungarian Algorithm
        const newAssignments = runHungarianAlgorithm(unassignedUsers, teams, costs, assignedUserIds);

        // 🔹 Step 3: Check if new assignments were made
        if (newAssignments.length === 0) {
          console.warn("⚠️ No new assignments made. Stopping loop.");
          break;
        }

        // 🔹 Step 4: Update rescuer locations
        rescuerLocations = updateRescuerLocations(newAssignments);

        // 🔹 Step 5: Mark users as assigned
        newAssignments.forEach(mission => assignedUserIds.add(mission.userId));

        // 🔹 Step 6: Remove assigned users
        unassignedUsers = unassignedUsers.filter(user => !assignedUserIds.has(user.userId));
        iteration += 1
      }

      console.timeEnd(`⏳ Processing Time - Dataset #${idx+1}`);
      console.log(`---------------------------------\n`);
    }

    return NextResponse.json({});
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error }, { status: 500 });
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