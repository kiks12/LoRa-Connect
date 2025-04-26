import { useAppContext } from "@/contexts/AppContext";
import { TeamWithStatusIdentifier } from "@/types";
import { createGeoJsonSourceId, RESCUER_POINT_SOURCE } from "@/utils/tags";
import { useState } from "react";

export function useRescuers() {
	const { rescuers, setRescuers, teams, setTeams, fetchTeams, startPulseAnimation } = useAppContext();
	const [rescuersLoading, setRescuersLoading] = useState(false);
	const [showRescuersLocations, setShowRescuersLocations] = useState(false);
	const pulseControllers: {
		[layerId: string]: () => void;
	} = {};

	function clearRescuerShowStatuses() {
		setRescuers((prev) => (prev = prev.map((rescuer) => ({ ...rescuer, showing: false }))));
	}

	function clearTeamShowStatuses() {
		setTeams((prev) => (prev = prev.map((team) => ({ ...team, showing: false }))));
	}

	function toggleTeamShowStatus(teamId: number) {
		setTeams((prev) => (prev = prev.map((team) => (team.teamId === teamId ? { ...team, showing: !team.showing } : team))));
	}

	function refreshRescuers() {
		setRescuersLoading(true);
		fetchTeams();
		setRescuersLoading(false);
	}

	function onShowLocation(team: TeamWithStatusIdentifier) {
		const sourceId = `${createGeoJsonSourceId([RESCUER_POINT_SOURCE], team.teamId)}-pulse`;
		team.showing = !team.showing;
		if (team.showing) {
			if (!pulseControllers[sourceId]) {
				const stopPulse = startPulseAnimation(sourceId);
				pulseControllers[sourceId] = stopPulse;
			}
		} else {
			if (pulseControllers[sourceId]) {
				pulseControllers[sourceId](); // Call the stop function
				delete pulseControllers[sourceId]; // Clean up
			}
		}
	}

	return {
		rescuers,
		setRescuers,
		teams,
		setTeams,
		showRescuersLocations,
		setShowRescuersLocations,
		clearRescuerShowStatuses,
		refreshRescuers,
		rescuersLoading,
		// addTeamPoint,
		toggleTeamShowStatus,
		clearTeamShowStatuses,
		onShowLocation,
	};
}
