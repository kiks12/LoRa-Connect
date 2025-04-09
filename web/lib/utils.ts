import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to format date as 'YYYY-MM-DDTHH:MM' (LOCAL TIME)
export const formatLocalDateTime = (date: string | Date) => {
	const d = new Date(date);
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	const hours = String(d.getHours()).padStart(2, "0");
	const minutes = String(d.getMinutes()).padStart(2, "0");
	return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function triggerFunctionWithTimerUsingTimeout(
  title: string,
  callback: () => void,
  updateTime: (title: string, remainingTime: number, maxTime: number) => void,
  remainingTime = 5 * 60 * 1000, // Default: 5 minutes
  maxTime = 5 * 60 * 1000 // Keep track of the max time
) {
  if (remainingTime <= 0) {
    updateTime(title, 0, maxTime); // Ensure it updates to 0
    return;
  }

  callback(); // Execute the callback function
  updateTime(title, remainingTime, maxTime); // Update countdown

  setTimeout(() => {
    triggerFunctionWithTimerUsingTimeout(title, callback, updateTime, remainingTime - 30 * 1000, maxTime);
  }, 30 * 1000);
}


export function triggerFunctionWithTimerUsingTimeout2(
  title: string,
  callback: () => void,
  updateTime: (title: string, remainingTime: number, maxTime: number) => void,
  // remainingTime = 5 * 60 * 1000, // Default: 5 minutes
  maxTime = 5 * 60 * 1000 // Keep track of the max time
) {
  let remainingTime = maxTime;

  // ✅ Trigger callback immediately on the first call
  callback();

  // ✅ Update state immediately
  updateTime(title, remainingTime, maxTime);

  // Set interval to update time every second
  const interval = setInterval(() => {
    remainingTime -= 1000; // Decrement by 1 second

    if (remainingTime <= 0) {
      clearInterval(interval); // Stop countdown
      updateTime(title, 0, maxTime); // Remove from state
      return;
    }

    // ✅ Execute callback every 30 seconds AFTER the first call
    if ((maxTime - remainingTime) % (30 * 1000) === 0) {
      callback();
    }

    updateTime(title, remainingTime, maxTime);
  }, 1000); // Runs every second

}

export function formatTwoDigitNumber(num: number): string {
  if (num < 0 || num > 99) {
      throw new Error("Number must be between 0 and 99");
  }
  return num.toFixed(0).padStart(2, '0');
}

export function formatUserId(id: number, length = 12): string {
  return id.toString().padStart(length, "0");
}

export function formatRescuerId(id: number, length = 12): string {
  return id.toString().padStart(length, "0");
}

export function formatName(givenName: string, middleName: string | undefined, lastName: string, suffix: string | undefined) {
  return `${givenName} ${middleName ? `${middleName[0]}.` : ""} ${lastName} ${suffix ?? ""}`
}

export function formatMessage(evacuationCenterName: string, distance: number, message: string) {
  const distanceInKm = distance / 1000;

  function insertNewlines(text: string, interval: number = 27): string {
    let result = '';
    for (let i = 0; i < text.length; i += interval) {
      result += text.slice(i, i + interval) + '\n';
    }
    return result.trim(); // Removes trailing newline
  }

  return insertNewlines(`Evac: ${evacuationCenterName} {${distanceInKm}km} - ${message}`);
}