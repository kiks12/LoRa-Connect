import { CellContext } from "@tanstack/react-table";

export function DateCell<T, K>({ row }: CellContext<T, K>) {
	const { createdAt } = row.original as { createdAt: Date };
	return <>{new Date(createdAt).toDateString()}</>;
}
