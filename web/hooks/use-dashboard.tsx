"use client";

import { OperationsWithPayload, OwnerWithBracelet, RescuerWithBracelet } from "@/types";
import { Bracelets, EvacuationCenters, Obstacle } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";

const DAYS_MAP = {
	"Last 7 Days": 7,
	"Last 30 Days": 30,
	"Last 60 Days": 60,
};

export default function useDashboard() {
	const [bracelets, setBracelets] = useState<{ bracelets: Bracelets[]; loading: boolean }>({
		bracelets: [],
		loading: true,
	});
	const [owners, setOwners] = useState<{ owners: OwnerWithBracelet[]; loading: boolean }>({
		owners: [],
		loading: true,
	});
	const ownersDoughnut = useMemo(() => {
		const withBracelets = owners.owners.filter((o) => o.bracelet).length;
		const withoutBracelets = owners.owners.length - withBracelets;
		return {
			labels: ["With Device", "Without Device"],
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
			labels: ["With Device", "Without Device"],
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

	const fetchBracelets = useCallback(async () => {
		setBracelets((prev) => ({ ...prev, loading: true }));
		const result = await fetch("/api/bracelets");
		const { bracelets } = await result.json();
		setBracelets(() => ({ bracelets, loading: false }));
	}, []);

	// FETCH BRACELETS API
	useEffect(() => {
		fetchBracelets();
		return () => setBracelets({ bracelets: [], loading: true });
	}, [fetchBracelets]);

	const fetchOwners = useCallback(async () => {
		setOwners((prev) => ({ ...prev, loading: true }));
		const result = await fetch("/api/owners");
		const { owners } = await result.json();
		setOwners(() => ({ owners, loading: false }));
	}, []);

	// FETCH OWNERS API
	useEffect(() => {
		fetchOwners();
		return () => setOwners({ owners: [], loading: true });
	}, [fetchOwners]);

	const fetchRescuers = useCallback(async () => {
		setRescuers((prev) => ({ ...prev, loading: true }));
		const result = await fetch("/api/rescuers");
		const { rescuers } = await result.json();
		setRescuers(() => ({ rescuers, loading: false }));
	}, []);

	useEffect(() => {
		fetchRescuers();
		return () => setRescuers({ rescuers: [], loading: true });
	}, [fetchRescuers]);

	const fetchEvacuationCenters = useCallback(async () => {
		setEvacuationCenters((prev) => ({ ...prev, loading: true }));
		const result = await fetch("/api/evacuation-centers");
		const { evacuationCenters } = await result.json();
		setEvacuationCenters(() => ({ evacuationCenters, loading: false }));
	}, []);

	useEffect(() => {
		fetchEvacuationCenters();
		return () => setEvacuationCenters({ evacuationCenters: [], loading: true });
	}, [fetchEvacuationCenters]);

	const fetchObstacles = useCallback(async () => {
		setObstacles((prev) => ({ ...prev, loading: true }));
		const result = await fetch("/api/obstacles");
		const { obstacles } = await result.json();
		setObstacles(() => ({ obstacles, loading: false }));
	}, []);

	useEffect(() => {
		fetchObstacles();
		return () => setObstacles({ obstacles: [], loading: true });
	}, [fetchObstacles]);

	const fetchOperations = useCallback(async () => {
		setOperations((prev) => ({ ...prev, loading: true }));
		const result = await fetch("/api/operations");
		const { operations } = await result.json();
		setOperations(() => ({ operations, loading: false }));
	}, []);

	useEffect(() => {
		fetchOperations();
		return () => setOperations({ operations: [], loading: true });
	}, [fetchOperations]);

	const fetchOperationsLineChartData = useCallback(async () => {
		setOperationsLineChartData((prev) => ({ ...prev, loading: true }));
		const result = await fetch(`/api/operations/last-days?lastDays=${DAYS_MAP[operationsLineChartData.option]}`);
		const { operations } = await result.json();
		setOperationsLineChartData((prev) => ({ ...prev, data: operations, loading: false }));
	}, [operationsLineChartData.option]);

	useEffect(() => {
		fetchOperationsLineChartData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [operationsLineChartData.option]);

	function onOperationsLineChartOptionChange(option: "Last 7 Days" | "Last 30 Days" | "Last 60 Days") {
		setOperationsLineChartData((prev) => ({ ...prev, option }));
	}

	function refreshDashboard() {
		fetchBracelets();
		fetchOwners();
		fetchRescuers();
		fetchEvacuationCenters();
		fetchObstacles();
		fetchOperations();
		fetchOperationsLineChartData();
	}

	return {
		bracelets,
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
		refreshDashboard,
	};
}
