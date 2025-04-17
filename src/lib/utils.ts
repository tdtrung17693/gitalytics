import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}

export const getMetricLabel = (value: number) => {
  if (value >= 90) return "Excellent";
  if (value >= 75) return "Very High";
  if (value >= 60) return "High";
  if (value >= 40) return "Medium";
  if (value >= 20) return "Low";
  return "Very Low";
};

export const getMetricClass = (value: number) => {
  if (value >= 60) return "high";
  if (value >= 40) return "medium";
  return "low";
};

export const getCommitFrequencyLabel = (value: number) => {
  if (value >= 30) return "Very High";
  if (value >= 15) return "High";
  if (value >= 5) return "Medium";
  if (value >= 2) return "Low";
  return "Very Low";
};

export const getCommitFrequencyClass = (value: number) => {
  if (value >= 15) return "high";
  if (value >= 5) return "medium";
  return "low";
};
