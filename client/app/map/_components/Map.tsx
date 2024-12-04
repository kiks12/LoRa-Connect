"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useMap } from "@/hooks/use-map";
import { Owners } from "@prisma/client";
import { useEffect } from "react";

const Map = ({ owners }: { owners: Owners[] }) => {
	const { interactive, map, addOwnerPoint, mapContainerRef } = useMap();

	useEffect(() => {
		if (interactive) {
			owners.forEach((owner) => {
				addOwnerPoint(owner);
			});
		}
	}, [interactive, map, addOwnerPoint, owners]);

	return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default Map;
