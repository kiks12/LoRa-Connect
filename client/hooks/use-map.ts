import { useEffect, useRef, useState } from "react"
import maplibregl, { LayerSpecification, SourceSpecification } from "maplibre-gl"
import { Owners } from "@prisma/client";

export const useMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<maplibregl.Map | null>(null)
	const [interactive, setInteractive] = useState(false)
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

		map.on("load", () => {
			console.log("Map Loaded")
			setInteractive(true);
		})

		map.on("error", (e) => {
			console.error(e);
		});

		const marker = new maplibregl.Marker().setLngLat([longitude, latitude]);
		marker.addTo(map);
    setMap(map)

		return () => {
      map.remove();
      setMap(null)
    }
	}, [longitude, latitude]);

	function createOwnerPointGeoJSON({ownerId, latitude, longitude}: {latitude: number, longitude: number, ownerId: number}) {
		return {
			sourceId: `owner-point-${ownerId}`,
			data: {
				"type": "geojson",
				"data": {
					type: "Point",
					coordinates: [longitude, latitude]
				}
			}
		};
	}

	function createOwnerPointLayerGeoJSON({sourceId}: {sourceId: string}) {
		return {
			"id": sourceId,
			"source": sourceId,
			"type": "circle",
			"paint": {
				"circle-radius": 10,
				"circle-color": "#007cbf",
				"circle-opacity": 0.5,
				"circle-stroke-width": 2,
				"circle-stroke-color": "#007cbf"
			}
		}
	}
	
	function addOwnerPoint({latitude, longitude, ownerId}: Owners){
		if (latitude === null && longitude === null) return
		if (map === null) return
		if (!interactive) return
		const {sourceId, data} = createOwnerPointGeoJSON({ownerId, latitude: latitude!, longitude: longitude!})

		map.addSource(sourceId, data as SourceSpecification);
		map.addLayer(createOwnerPointLayerGeoJSON({sourceId}) as LayerSpecification)
		map.on("click", sourceId, () => {
			console.log("Clicked")
		})
	}

	return {map, mapContainerRef, addOwnerPoint, interactive};
};