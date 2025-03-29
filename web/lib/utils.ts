import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

