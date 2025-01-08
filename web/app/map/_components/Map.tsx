"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useMapContext } from "@/hooks/use-map";
import { Label } from "@/components/ui/label";

const Map = () => {
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
};

export default Map;
