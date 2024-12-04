"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useMapContext } from "@/hooks/use-map";

const Map = () => {
	const { mapContainerRef } = useMapContext();

	return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default Map;
