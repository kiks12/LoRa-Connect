import { useAppContext } from "@/contexts/AppContext";

export default function useTimeUpdater() {
	const { setTimeIntervals } = useAppContext();

	function updateTime(title: string, remainingTime: number, maxTime: number) {
		setTimeIntervals((prev) => {
			const index = prev.findIndex((item) => item.title === title);

			if (remainingTime <= 0) {
				// ✅ Remove the object when time reaches 0
				return prev.filter((item) => item.title !== title);
			}

			if (index !== -1) {
				// ✅ Update existing interval
				const updatedIntervals = [...prev];
				updatedIntervals[index] = { ...updatedIntervals[index], time: remainingTime };
				return updatedIntervals;
			} else {
				// ✅ Add new interval if it doesn’t exist
				return [...prev, { title, time: remainingTime, max: maxTime }];
			}
		});
	}

	return { updateTime };
}
