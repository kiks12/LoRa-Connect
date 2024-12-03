"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const Map = () => {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const [{ longitude, latitude }, setLocation] = useState<{ latitude: number; longitude: number }>({
		latitude: 15.0794,
		longitude: 120.62,
	});

	useEffect(() => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(({ coords }) => {
				const { latitude, longitude } = coords;
				setLocation({ latitude, longitude });
			});
		}
	}, []);

	useEffect(() => {
		if (!mapContainerRef.current) return;

		const map = new maplibregl.Map({
			container: mapContainerRef.current,
			style: "http://localhost:3000/map/style-raw-open.json",
			center: [longitude, latitude],
			zoom: 13,
			hash: true,
			attributionControl: false,
		});

		const marker = new maplibregl.Marker().setLngLat([longitude, latitude]);
		marker.addTo(map);

		map.on("error", (e) => {
			console.error(e);
		});

		return () => map.remove();
	}, [longitude, latitude]);

	return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default Map;
