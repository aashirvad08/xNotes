export const PRIORITY_COLORS = {
  High: "#DC2626",
  Medium: "#D97706",
  Low: "#0F766E",
};

export function inferPriority(title = "") {
  const normalizedTitle = title.toLowerCase();

  if (/(exam|deadline|submit)/.test(normalizedTitle)) {
    return "High";
  }

  if (/(meeting|project)/.test(normalizedTitle)) {
    return "Medium";
  }

  return "Low";
}
