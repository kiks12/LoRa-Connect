"use client";

import { OperationsWithPayload, OwnerWithBracelet, RescuerWithBracelet } from "@/types";
import { EvacuationCenters, Obstacle } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";

const DAYS_MAP = {
	"Last 7 Days": 7,
	"Last 30 Days": 30,
	"Last 60 Days": 60,
};

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
	const [operationsLineChartData, setOperationsLineChartData] = useState<{
		data: { date: Date; count: number }[];
		loading: boolean;
		option: "Last 7 Days" | "Last 30 Days" | "Last 60 Days";
	}>({
		data: [],
		loading: true,
		option: "Last 7 Days",
	});
	const [operations, setOperations] = useState<{ operations: OperationsWithPayload[]; loading: boolean }>({
		operations: [],
		loading: true,
	});
	const operationsBreakdown = useMemo(() => {
		const breakdown: {
			assigned: OperationsWithPayload[];
			pending: OperationsWithPayload[];
			canceled: OperationsWithPayload[];
			complete: OperationsWithPayload[];
			failed: OperationsWithPayload[];
			low: OperationsWithPayload[];
			moderate: OperationsWithPayload[];
			severe: OperationsWithPayload[];
		} = {
			assigned: [],
			pending: [],
			canceled: [],
			complete: [],
			failed: [],
			low: [],
			moderate: [],
			severe: [],
		};

		operations.operations.forEach((operation) => {
			if (operation.status === "ASSIGNED") breakdown.assigned.push(operation);
			if (operation.status === "PENDING") breakdown.pending.push(operation);
			if (operation.status === "CANCELED") breakdown.canceled.push(operation);
			if (operation.status === "COMPLETE") breakdown.complete.push(operation);
			if (operation.status === "FAILED") breakdown.failed.push(operation);
			if (operation.urgency === "LOW") breakdown.low.push(operation);
			if (operation.urgency === "MODERATE") breakdown.moderate.push(operation);
			if (operation.urgency === "SEVERE") breakdown.severe.push(operation);
		});

		return breakdown;
	}, [operations.operations]);

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

	useEffect(() => {
		setOperations((prev) => ({ ...prev, loading: true }));
		fetch("/api/operations")
			.then((res) => res.json())
			.then(({ operations }) => setOperations(() => ({ operations, loading: false })));
	}, []);

	useEffect(() => {
		setOperationsLineChartData((prev) => ({ ...prev, loading: true }));
		fetch(`/api/operations/last-days?lastDays=${DAYS_MAP[operationsLineChartData.option]}`)
			.then((res) => res.json())
			.then(({ operations }) => setOperationsLineChartData((prev) => ({ ...prev, data: operations, loading: false })));
	}, [operationsLineChartData.option]);

	function onOperationsLineChartOptionChange(option: "Last 7 Days" | "Last 30 Days" | "Last 60 Days") {
		setOperationsLineChartData((prev) => ({ ...prev, option }));
	}

	return {
		owners,
		ownersDoughnut,
		rescuers,
		rescuersDoughnut,
		evacuationCenters,
		obstacles,
		operations,
		operationsBreakdown,
		operationsLineChartData,
		onOperationsLineChartOptionChange,
	};
}
