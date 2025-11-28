export const formatDate = (date: Date, short = false): string => {
  const options: Intl.DateTimeFormatOptions = short
    ? { weekday: "short", day: "numeric", month: "short" }
    : { weekday: "long", year: "numeric", month: "long", day: "numeric" };

  return date.toLocaleDateString("ru-RU", options);
};
