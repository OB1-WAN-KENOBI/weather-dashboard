import type { TemperatureUnit } from "../types";

export const convertTemperature = (
  temp: number,
  unit: TemperatureUnit
): number => {
  if (unit === "fahrenheit") {
    return (temp * 9) / 5 + 32;
  }
  return temp;
};

export const formatTemperature = (
  temp: number,
  unit: TemperatureUnit
): string => {
  const converted = convertTemperature(temp, unit);
  return `${Math.round(converted)}°${unit === "celsius" ? "C" : "F"}`;
};
