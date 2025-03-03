import { RescuerWithBracelet, RescuerWithStatusIdentifier } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { createRescuerPointGeoJSON, createRescuerPointLayerGeoJSON } from "@/utils/map";
import { LayerSpecification, SourceSpecification } from "maplibre-gl";
import { RESCUER_SOURCE_BASE } from "@/utils/tags";
import { useAppContext } from "@/contexts/AppContext";
import { useMap } from "./use-map";

export function useRescuers() {
	const { mapRef, rescuers, setRescuers } = useAppContext();
	const [rescuersLoading, setRescuersLoading] = useState(false);
	const [showRescuersLocations, setShowRescuersLocations] = useState(false);
	const { removeSourceAndLayer, clearSourcesAndLayers } = useMap();

	const addRescuerPoint = useCallback(
		({ bracelet, rescuerId }: RescuerWithStatusIdentifier, showLocation: boolean = false, monitorLocation: boolean = false) => {
			if (bracelet && bracelet.latitude === null && bracelet.longitude === null) return;
			if (!bracelet) return;
			if (!mapRef.current) return;
			const { sourceId, data } = createRescuerPointGeoJSON({ rescuerId, latitude: bracelet!.latitude!, longitude: bracelet!.longitude! });

			if (mapRef.current.getSource(sourceId) && showLocation) return;
			if (mapRef.current.getSource(sourceId) && !showLocation && !monitorLocation) return removeRescuerPoint(sourceId, rescuerId);
			if (mapRef.current.getSource(sourceId) && monitorLocation) removeRescuerPoint(sourceId, rescuerId);

			mapRef.current.addSource(sourceId, data as SourceSpecification);
			mapRef.current.addLayer(createRescuerPointLayerGeoJSON({ sourceId }) as LayerSpecification);
			toggleRescuerShowStatus(rescuerId);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	function removeRescuerPoint(sourceId: string, rescuerId: number) {
		removeSourceAndLayer(sourceId);
		toggleRescuerShowStatus(rescuerId);
	}

	function clearRescuerShowStatuses() {
		setRescuers((prev) => (prev = prev.map((rescuer) => ({ ...rescuer, showing: false }))));
	}

	function toggleRescuerShowStatus(rescuerId: number) {
		setRescuers((prev) => (prev = prev.map((rescuer) => (rescuer.rescuerId === rescuerId ? { ...rescuer, showing: !rescuer.showing } : rescuer))));
	}

	async function fetchRescuersAPI() {
		setRescuersLoading(true);
		const { rescuers }: { rescuers: RescuerWithBracelet[] } = await (await fetch("/api/rescuers")).json();
		const mappedRescuers = rescuers ? rescuers.map((rescuer) => ({ ...rescuer, showing: false })) : [];
		setRescuers(mappedRescuers);
		setRescuersLoading(false);
	}

	function refreshRescuers() {
		fetchRescuersAPI();
	}

	// API FETCHING OF RESCUERS
	useEffect(() => {
		fetchRescuersAPI();

		return () => {
			setRescuers([]);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!showRescuersLocations) {
			clearSourcesAndLayers(RESCUER_SOURCE_BASE);
			clearRescuerShowStatuses();
			return;
		}
		rescuers.forEach((rescuer) => addRescuerPoint(rescuer, true));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addRescuerPoint, showRescuersLocations]);

	return {
		rescuers,
		setRescuers,
		addRescuerPoint,
		showRescuersLocations,
		setShowRescuersLocations,
		clearRescuerShowStatuses,
		refreshRescuers,
		rescuersLoading,
	};
}
