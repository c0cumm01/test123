import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(unix: number | undefined | null) {
  if (!unix) {
    return "";
  }
  return new Date(unix * 1000).toLocaleDateString();
}

export function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}${
      minutes > 0 ? ` ${minutes} minute${minutes > 1 ? "s" : ""}` : ""
    }`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else {
    return "Less than a minute";
  }
}
