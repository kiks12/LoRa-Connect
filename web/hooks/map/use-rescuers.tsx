import { TeamWithStatusIdentifier } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { createRescuerPointGeoJSON, createRescuerPointLayerGeoJSON } from "@/utils/map";
import { LayerSpecification, SourceSpecification } from "maplibre-gl";
import { RESCUER_SOURCE_BASE } from "@/utils/tags";
import { useAppContext } from "@/contexts/AppContext";
import { useMapContext } from "@/contexts/MapContext";

export function useRescuers() {
	const { mapRef, clearSourcesAndLayers, removeSourceAndLayer } = useMapContext();
	const { rescuers, setRescuers, teams, setTeams, fetchTeams } = useAppContext();
	const [rescuersLoading, setRescuersLoading] = useState(false);
	const [showRescuersLocations, setShowRescuersLocations] = useState(false);

	const addTeamPoint = useCallback(
		({ rescuers, teamId }: TeamWithStatusIdentifier, showLocation: boolean = false, monitorLocation: boolean = false) => {
			const { bracelet } = rescuers.filter((rescuer) => rescuer.bracelet !== null)[0];
			if (bracelet && bracelet.latitude === null && bracelet.longitude === null) return;
			if (!bracelet) return;
			if (!mapRef.current) return;
			const { sourceId, data } = createRescuerPointGeoJSON({ rescuerId: teamId, latitude: bracelet!.latitude!, longitude: bracelet!.longitude! });

			if (mapRef.current.getSource(sourceId) && showLocation) return;
			if (mapRef.current.getSource(sourceId) && !showLocation && !monitorLocation) return removeTeamPoint(sourceId, teamId);
			if (mapRef.current.getSource(sourceId) && monitorLocation) removeTeamPoint(sourceId, teamId);

			mapRef.current.addSource(sourceId, data as SourceSpecification);
			mapRef.current.addLayer(createRescuerPointLayerGeoJSON({ sourceId }) as LayerSpecification);
			toggleTeamShowStatus(teamId);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	function removeTeamPoint(sourceId: string, teamId: number) {
		removeSourceAndLayer(sourceId);
		toggleTeamShowStatus(teamId);
	}

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
		// fetchRescuersAPI();
		fetchTeams();
		setRescuersLoading(false);
	}

	// async function fetchTeams() {
	// 	const { teams }: { teams: TeamWithRescuer[] } = await (await fetch("/api/teams")).json();
	// 	const mappedTeams = teams.map((team) => ({ ...team, showing: false }));
	// 	setTeams(mappedTeams);
	// }

	// API FETCHING OF RESCUERS
	// useEffect(() => {
	// refreshRescuers();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, []);

	useEffect(() => {
		if (!showRescuersLocations) {
			clearSourcesAndLayers(RESCUER_SOURCE_BASE);
			clearRescuerShowStatuses();
			clearTeamShowStatuses();
			return;
		}
		teams.forEach((rescuer) => addTeamPoint(rescuer, true));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showRescuersLocations]);

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
		addTeamPoint,
		toggleTeamShowStatus,
		clearTeamShowStatuses,
	};
}
