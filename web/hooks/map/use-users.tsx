import { UserWithStatusIdentifier } from "@/types";
import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { createGeoJsonSourceId, USER_POINT_SOURCE } from "@/utils/tags";

export const useUsers = () => {
	const { users, setUsers, fetchUsersAPI, startPulseAnimation } = useAppContext();
	const [usersLoading, setUsersLoading] = useState(false);
	const [showUserLocations, setShowUserLocations] = useState(false);
	const pulseControllers: {
		[layerId: string]: () => void;
	} = {};

	function onShowLocation(user: UserWithStatusIdentifier) {
		const sourceId = `${createGeoJsonSourceId([USER_POINT_SOURCE], user.userId)}-pulse`;
		user.showing = !user.showing;
		if (user.showing) {
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

	function refreshUsers() {
		fetchUsersAPI();
	}

	return {
		users,
		// addUserPoint,
		showUserLocations,
		setShowUserLocations,
		// clearUserShowStatuses,
		refreshUsers,
		usersLoading,
		onShowLocation,
	};
};
