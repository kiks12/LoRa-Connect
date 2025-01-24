"use client";

import { OperationsWithPayload, OwnerWithBracelet, RescuerWithBracelet } from "@/types";
import { EvacuationCenters, Obstacle } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";

export default function useDashboard() {
	const [owners, setOwners] = useState<{ owners: OwnerWithBracelet[]; loading: boolean }>({
		owners: [],
		loading: true,
	});
	const ownersDoughnut = useMemo(() => {
		const withBracelets = owners.owners.filter((o) => o.bracelet).length;
		const withoutBracelets = owners.owners.length - withBracelets;
		return {
			labels: ["With Bracelets", "Without Bracelets"],
			data: [withBracelets, withoutBracelets],
		};
	}, [owners.owners]);
	const [rescuers, setRescuers] = useState<{ rescuers: RescuerWithBracelet[]; loading: boolean }>({
		rescuers: [],
		loading: true,
	});
	const rescuersDoughnut = useMemo(() => {
		const withBracelets = rescuers.rescuers.filter((o) => o.bracelet).length;
		const withoutBracelets = rescuers.rescuers.length - withBracelets;
		return {
			labels: ["With Bracelets", "Without Bracelets"],
			data: [withBracelets, withoutBracelets],
		};
	}, [rescuers.rescuers]);
	const [evacuationCenters, setEvacuationCenters] = useState<{ evacuationCenters: EvacuationCenters[]; loading: boolean }>({
		evacuationCenters: [],
		loading: true,
	});
	const [obstacles, setObstacles] = useState<{ obstacles: Obstacle[]; loading: boolean }>({
		obstacles: [],
		loading: true,
	});
	const [operations, setOperations] = useState<{ operations: OperationsWithPayload[]; loading: boolean }>({
		operations: [],
		loading: true,
	});

	useEffect(() => {
		setOwners((prev) => ({ ...prev, loading: true }));
		fetch("/api/owners")
			.then((res) => res.json())
			.then(({ owners }) => setOwners(() => ({ owners, loading: false })));
	}, []);

	useEffect(() => {
		setRescuers((prev) => ({ ...prev, loading: true }));
		fetch("/api/rescuers")
			.then((res) => res.json())
			.then(({ rescuers }) => setRescuers(() => ({ rescuers, loading: false })));
	}, []);

	useEffect(() => {
		setEvacuationCenters((prev) => ({ ...prev, loading: true }));
		fetch("/api/evacuation-centers")
			.then((res) => res.json())
			.then(({ evacuationCenters }) => setEvacuationCenters(() => ({ evacuationCenters, loading: false })));
	}, []);

	useEffect(() => {
		setObstacles((prev) => ({ ...prev, loading: true }));
		fetch("/api/obstacles")
			.then((res) => res.json())
			.then(({ obstacles }) => setObstacles(() => ({ obstacles, loading: false })));
	}, []);

	return { owners, ownersDoughnut, rescuers, rescuersDoughnut, evacuationCenters, obstacles };
}
