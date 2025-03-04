import { UserWithBracelet, UserWithStatusIdentifier } from "@/types";
import { createOwnerPointGeoJSON, createOwnerPointLayerGeoJSON } from "@/utils/map";
import { LayerSpecification, SourceSpecification } from "maplibre-gl";
import { useCallback, useEffect, useState } from "react";
import { USER_SOURCE_BASE } from "@/utils/tags";
import { useAppContext } from "@/contexts/AppContext";
import { useMapContext } from "@/contexts/MapContext";

export const useUsers = () => {
	const { mapRef, clearSourcesAndLayers, removeSourceAndLayer } = useMapContext();
	const { users, setUsers } = useAppContext();
	const [usersLoading, setUsersLoading] = useState(false);
	const [showUserLocations, setShowUserLocations] = useState(false);

	// API FETCHING OF OWNERS
	useEffect(() => {
		fetchUsersAPI();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function fetchUsersAPI() {
		setUsersLoading(true);
		const { users }: { users: UserWithBracelet[] } = await (await fetch("/api/users")).json();
		const mappedUsers = users ? users.map((user) => ({ ...user, showing: false })) : [];
		setUsers(mappedUsers);
		setUsersLoading(false);
	}

	const addUserPoint = useCallback(
		({ bracelet, userId }: UserWithStatusIdentifier, showLocation: boolean = false, monitorLocation: boolean = false) => {
			if (!bracelet) return;
			if (bracelet && bracelet.latitude === null && bracelet.longitude === null) return;
			if (!mapRef.current) return;
			const { sourceId, data } = createOwnerPointGeoJSON({ userId, latitude: bracelet!.latitude!, longitude: bracelet!.longitude! });
			const mapRefSource = mapRef.current.getSource(sourceId);

			if (mapRefSource && showLocation) return;
			if (mapRefSource && !showLocation && !monitorLocation) return removeUserPoint(sourceId, userId);
			if (mapRefSource && monitorLocation) removeUserPoint(sourceId, userId);

			mapRef.current.addSource(sourceId, data as SourceSpecification);
			mapRef.current.addLayer(createOwnerPointLayerGeoJSON({ sourceId }) as LayerSpecification);
			toggleUserShowStatus(userId);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	function removeUserPoint(sourceId: string, userId: number) {
		removeSourceAndLayer(sourceId);
		toggleUserShowStatus(userId);
	}

	function toggleUserShowStatus(userId: number) {
		setUsers((prev) => (prev = prev.map((user) => (user.userId === userId ? { ...user, showing: !user.showing } : user))));
	}

	function clearUserShowStatuses() {
		setUsers((prev) => (prev = prev.map((user) => ({ ...user, showing: false }))));
	}

	function refreshUsers() {
		fetchUsersAPI();
	}

	useEffect(() => {
		if (!showUserLocations) {
			clearSourcesAndLayers(USER_SOURCE_BASE);
			clearUserShowStatuses();
			return;
		}
		users.forEach((user) => addUserPoint(user, true));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addUserPoint, showUserLocations]);

	return {
		users,
		addUserPoint,
		showUserLocations,
		setShowUserLocations,
		clearUserShowStatuses,
		refreshUsers,
		usersLoading,
	};
};
