export function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
