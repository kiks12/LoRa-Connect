import { GraphHopperAPIResult, MissionWithCost, ObstacleWithStatusIdentifier, TeamAssignmentCost, TeamWithStatusIdentifier, UserWithStatusIdentifier } from "@/types";
import { createCustomModelObject, LatLng } from "@/utils/routing";
import { minWeightAssign } from "munkres-algorithm";

export async function calculateTeamAssignmentCosts(
    teams: TeamWithStatusIdentifier[],
    obstacles: ObstacleWithStatusIdentifier[],
		updatedRescuerLocations: Map<number, { lat: number; lon: number }>,
		unassignedUsers: UserWithStatusIdentifier[]
	): Promise<TeamAssignmentCost[]> {
		if (unassignedUsers.length === 0 || teams.length === 0) return [];

		const obstaclesCoordinates = obstacles.map((d: ObstacleWithStatusIdentifier) => [d.latitude, d.longitude] as LatLng);
		const customModelObject = createCustomModelObject(obstaclesCoordinates);

		const teamsCostsPromises = teams.flatMap((team) => {
			const rescuer = team.rescuers.find((rescuer) => rescuer.bracelet);
			if (!rescuer || !rescuer.bracelet) return [];

			// Get rescuer's last known location, or their initial position if not updated yet
			const rescuerStartLocation = updatedRescuerLocations.get(team.teamId) || {
				lat: rescuer.bracelet.latitude,
				lon: rescuer.bracelet.longitude,
			};

			return unassignedUsers.map(async (user) => {
				if (!user.bracelet || !user.bracelet.latitude || !user.bracelet.longitude) return null;

				const points = [
					[rescuerStartLocation.lon, rescuerStartLocation.lat], // Updated rescuer location
					[user.bracelet.longitude, user.bracelet.latitude], // User location
				];

				const res = await fetch(`http://localhost:8989/route`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(
						obstaclesCoordinates.length === 0
							? { points, points_encoded: false, profile: "car" }
							: { points, points_encoded: false, profile: "car", "ch.disable": true, custom_model: customModelObject }
					),
				});

				const json: GraphHopperAPIResult = await res.json();
				const minimumTime = json.paths.reduce((acc, curr) => (acc.time < curr.time ? acc : curr));

				return {
					userId: user.userId,
					teamId: team.teamId,
					urgency: user.bracelet.urgency,
					coordinates: minimumTime.points.coordinates,
					distance: minimumTime.distance,
					time: minimumTime.time,
				} as TeamAssignmentCost;
			});
		});

		const resolvedCosts = await Promise.all(teamsCostsPromises);
		return resolvedCosts.filter(Boolean) as TeamAssignmentCost[];
	}

export function runHungarianAlgorithm(
	users: UserWithStatusIdentifier[],
	teams: TeamWithStatusIdentifier[],
	costs: TeamAssignmentCost[],
	assignedUsers: Set<number>,
	alpha: number = 0.5
): MissionWithCost[] {
	const unassignedUsers = users.filter((user) => !assignedUsers.has(user.userId));
	const numUsers = unassignedUsers.length;
	const numTeams = teams.length;

	if (numUsers === 0 || numTeams === 0) return [];

	// Build cost matrix
	const costMatrix: number[][] = Array.from({ length: numUsers }, () => new Array(numTeams).fill(Infinity));

	costs.forEach(({ userId, teamId, distance, time, urgency }) => {
		const userIndex = unassignedUsers.findIndex((u) => u.userId === userId);
		const teamIndex = teams.findIndex((t) => t.teamId === teamId);

		if (userIndex !== -1 && teamIndex !== -1) {
			costMatrix[userIndex][teamIndex] = (alpha * distance) + ((1 - alpha) * time) * (1 - urgency);
		}
	});

	console.table(costMatrix);

	// 🔹 Solve Hungarian Algorithm
	const assignments = minWeightAssign(costMatrix);
	// const greedy = greedyAssignment(costMatrix)

	// console.log("Hungarian Assignments: ");
	console.table(assignments.assignments);
	// console.log("Greedy Assignments: ")
	// console.table(greedy);

	return assignments.assignments
		.map((teamIndex, userIndex) => {
			if (teamIndex === null) return null;

			const user = unassignedUsers[userIndex];
			const team = teams[teamIndex];

			const costEntry = costs.find((c) => c.userId === user.userId && c.teamId === team.teamId);

			return {
				userId: user.userId,
				user,
				teamId: team.teamId,
				team,
				coordinates: costEntry?.coordinates,
				distance: costEntry?.distance,
				time: costEntry?.time,
			};
		})
		.filter((assignment): assignment is MissionWithCost => assignment !== null);
}

// export function greedyAssignment(costMatrix: number[][]): number[] {
// 	const assignments = costMatrix.map((row) => row.indexOf(Math.min(...row)));
// 	return assignments
// }