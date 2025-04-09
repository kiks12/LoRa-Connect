import { EvacuationCenterWithStatusIdentifier, EvacuationInstruction, GraphHopperAPIResult } from "@/types";
import { useEffect, useState } from "react";
import { EVACUATION_CENTER_MARKER_COLOR } from "@/map-styles";
import maplibregl from "maplibre-gl";
import { useAppContext } from "@/contexts/AppContext";
import { useMapContext } from "@/contexts/MapContext";
import { formatName } from "@/lib/utils";

export const useEvacuations = () => {
	const { mapRef } = useMapContext();
	const { users } = useAppContext();
	const [evacuationCenters, setEvacuationCenters] = useState<EvacuationCenterWithStatusIdentifier[]>([]);
	const [evacuationCentersLoading, setEvacuationCentersLoading] = useState(true);
	const [evacuationCentersMarkers, setEvacuationCentersMarkers] = useState<{ evacuationCenterId: number; marker: maplibregl.Marker }[]>([]);
	const [showEvacuationCenters, setShowEvacuationCenters] = useState(false);
	const [evacuationInstructions, setEvacuationInstructions] = useState<EvacuationInstruction[]>([]);
	const [calculatingEvacuationInstructions, setCalculatingEvacuationInstructions] = useState(false);

	async function fetchEvacuationCentersAPI() {
		setEvacuationCentersLoading(true);
		const { evacuationCenters } = await (await fetch("/api/evacuation-centers")).json();
		setEvacuationCenters(evacuationCenters);
		setEvacuationCentersLoading(false);
	}

	function refreshEvacuationCenters() {
		fetchEvacuationCentersAPI();
	}

	// API FETCHING OF EVACUATION CENTER
	useEffect(() => {
		fetchEvacuationCentersAPI();
	}, []);

	useEffect(() => {
		if (showEvacuationCenters && mapRef.current) {
			evacuationCenters.forEach((evacuationCenter) => showEvacuationCenterMarkerOnMap(evacuationCenter));
		} else {
			evacuationCentersMarkers.forEach((obj) => removeEvacuationCenterMarkerFromMap(obj.evacuationCenterId));
			setEvacuationCentersMarkers([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showEvacuationCenters]);

	function showEvacuationCenterMarkerOnMap(evacuationCenter: EvacuationCenterWithStatusIdentifier) {
		const marker = new maplibregl.Marker({
			color: EVACUATION_CENTER_MARKER_COLOR,
		}).setLngLat([evacuationCenter.longitude, evacuationCenter.latitude]);
		marker.addTo(mapRef.current!);
		setEvacuationCentersMarkers((prev) => [...prev, { marker, evacuationCenterId: evacuationCenter.evacuationId }]);
		toggleEvacuationCenterStatus(evacuationCenter.evacuationId);
	}

	function removeEvacuationCenterMarkerFromMap(evacuationCenterId: number) {
		const evacuationCenterMarker = evacuationCentersMarkers.filter((evacuationCenter) => evacuationCenter.evacuationCenterId === evacuationCenterId);
		const evacuationCenter = evacuationCenters.filter((ev) => ev.evacuationId === evacuationCenterId);
		setEvacuationCentersMarkers((prev) => (prev = prev.filter((obj) => obj.evacuationCenterId === evacuationCenterId)));
		toggleEvacuationCenterStatus(evacuationCenter[0].evacuationId);
		evacuationCenterMarker[0].marker.remove();
	}

	function toggleEvacuationCenterStatus(evacuationCenterId: number) {
		setEvacuationCenters(
			(prev) =>
				(prev = prev.map((evacuationCenter) =>
					evacuationCenter.evacuationId === evacuationCenterId ? { ...evacuationCenter, showing: !evacuationCenter.showing } : evacuationCenter
				))
		);
	}

	function toggleShowEvacuationCenters() {
		setShowEvacuationCenters(!showEvacuationCenters);
	}

	async function createEvacuationInstructions() {
		setCalculatingEvacuationInstructions(true);
		setEvacuationInstructions([]); // Clear previous instructions

		const familyDistances = await fetchFamilyDistanceFromEvacuationCenter();
		const newInstructions: typeof familyDistances = []; // Temporary array to store results

		users.forEach((user) => {
			const distances = familyDistances.filter((fd) => fd.ownerId === user.userId);
			if (distances.length > 0) {
				const minimumDistanceForFamily = distances.reduce((acc, curr) => (acc.time < curr.time ? acc : curr));
				newInstructions.push(minimumDistanceForFamily);
			}
		});

		setEvacuationInstructions(newInstructions);
		setCalculatingEvacuationInstructions(false);
	}

	function setEvacuationInstructionMessage(idx: number, newMessage: string) {
		setEvacuationInstructions((prev) => {
			return prev.map((row, index) => {
				if (index === idx) return { ...row, message: newMessage };
				return row;
			});
		});
	}

	async function fetchFamilyDistanceFromEvacuationCenter(): Promise<EvacuationInstruction[]> {
		const requests: Promise<EvacuationInstruction>[] = [];

		for (const user of users) {
			if (user.bracelet === null) continue;
			for (const evacuationCenter of evacuationCenters) {
				const request: Promise<EvacuationInstruction> = (async () => {
					const result = await fetch(
						`http://localhost:8989/route?point=${user.bracelet!.latitude},${user.bracelet!.longitude}&point=${evacuationCenter.latitude},${
							evacuationCenter.longitude
						}&profile=car&points_encoded=false`
					);
					const json: GraphHopperAPIResult = await result.json();
					const minimumTime = json.paths.reduce((acc, curr) => (acc.time < curr.time ? acc : curr));
					return {
						ownerId: user.userId,
						ownerBraceletId: user.bracelet?.braceletId ?? "",
						ownerName: formatName(user.givenName, user.middleName, user.lastName, user.suffix),
						evacuationCenterId: evacuationCenter.evacuationId,
						evacuationCenterName: evacuationCenter.name,
						time: minimumTime.time,
						coordinates: minimumTime.points.coordinates,
						distance: minimumTime.distance,
						message: "",
					} as EvacuationInstruction;
				})();

				requests.push(request);
			}
		}

		return Promise.all(requests);
	}

	return {
		evacuationCenters,
		showEvacuationCenters,
		toggleShowEvacuationCenters,
		evacuationCentersLoading,
		refreshEvacuationCenters,
		evacuationInstructions,
		calculatingEvacuationInstructions,
		createEvacuationInstructions,
		setEvacuationInstructionMessage,
	};
};
