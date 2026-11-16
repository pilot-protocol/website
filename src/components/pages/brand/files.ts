import { FILE_SIZES } from "@/generated/files";

/** Size of a file in /public, measured at build time so the label can't drift from the file. */
export function fileSize(publicPath: string) {
  const bytes = FILE_SIZES[publicPath.replace(/^\//, "")] ?? 0;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1000))} KB`;
}
