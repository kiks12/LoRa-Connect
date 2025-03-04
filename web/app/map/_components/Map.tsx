"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { Label } from "@/components/ui/label";
import React, { memo } from "react";
import { useMapContext } from "@/contexts/MapContext";

// eslint-disable-next-line react/display-name
const Map = memo(function () {
	const { mapContainerRef, mapLoading } = useMapContext();

	return (
		<>
			<div ref={mapContainerRef} className="w-full h-full">
				{mapLoading ? (
					<div className="w-full h-full flex items-center justify-center">
						<Label>Map is Loading...</Label>
					</div>
				) : (
					<></>
				)}
			</div>
		</>
	);
});

export default Map;
