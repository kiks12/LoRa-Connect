"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EVACUATION_CENTER_MARKER_COLOR } from "@/map-styles";

const LocationSelector = ({
	evacuationLocation,
	setEvacuationLocation,
}: {
	evacuationLocation: { latitude: number | null; longitude: number | null };
	setEvacuationLocation: Dispatch<SetStateAction<{ latitude: number | null; longitude: number | null }>>;
}) => {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const markerRef = useRef<maplibregl.Marker | null>(null);
	const [{ longitude, latitude }, setLocation] = useState<{ latitude: number; longitude: number }>({
		latitude: 15.0794,
		longitude: 120.62,
	});

	/* --- MAP RENDERING --- */
	// GET CURRENT LOCATION OF CENTRAL NODE
	useEffect(() => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(({ coords }) => {
				const { latitude, longitude } = coords;
				setLocation({ latitude, longitude });
			});
		}
	}, []);

	// RENDER MAP
	useEffect(() => {
		if (!mapContainerRef.current) return;
		const newMap = new maplibregl.Map({
			container: mapContainerRef.current,
			style: "http://localhost:3000/map/style-raw-open.json",
			center: [longitude, latitude],
			zoom: 13,
			hash: true,
			attributionControl: false,
		});
		mapRef.current = newMap;

		newMap.on("error", (e) => console.error(e));

		return () => {
			newMap.remove();
			mapRef.current = null;
		};
	}, [latitude, longitude]);

	// SET MARKER FOR CENTRAL NODE LOCATION
	useEffect(() => {
		if (mapRef.current) {
			const marker = new maplibregl.Marker().setLngLat([longitude, latitude]);
			marker.addTo(mapRef.current);
			if (evacuationLocation.latitude && evacuationLocation.longitude) {
				markerRef.current = new maplibregl.Marker({
					color: "#3a9e3e",
				}).setLngLat([evacuationLocation.longitude, evacuationLocation.latitude]);
				markerRef.current.addTo(mapRef.current!);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [latitude, longitude, mapRef]);
	/* --- MAP RENDERING --- */

	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.on("click", ({ lngLat }) => {
				const { lat, lng } = lngLat;
				setEvacuationLocation({ latitude: lat, longitude: lng });
				if (markerRef.current) markerRef.current.remove();
				markerRef.current = new maplibregl.Marker({
					color: EVACUATION_CENTER_MARKER_COLOR,
				}).setLngLat([lng, lat]);
				markerRef.current.addTo(mapRef.current!);
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mapRef.current]);

	return (
		<div className="w-full h-full relative">
			<div className="z-10 absolute right-2">
				<Card className="max-w-96">
					<CardHeader>
						<div className="flex justify-between items-start">
							<div>
								<CardTitle>Pinpoint the evacuation center</CardTitle>
								<CardDescription className="mt-2">Click the button then select the location from the map</CardDescription>
							</div>
							<div>
								<DialogTrigger asChild>
									<Button type="submit" size={"icon"} variant="ghost">
										<X />
									</Button>
								</DialogTrigger>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col">
							<Label>Latitude: {evacuationLocation.latitude}</Label>
							<Label className="mt-2">Longitude: {evacuationLocation.longitude}</Label>
						</div>
						<DialogTrigger asChild>
							<Button type="submit" className="w-full mt-4">
								Done
							</Button>
						</DialogTrigger>
					</CardContent>
				</Card>
			</div>
			<div ref={mapContainerRef} className="w-full h-full z-0" />
		</div>
	);
};

export default LocationSelector;
