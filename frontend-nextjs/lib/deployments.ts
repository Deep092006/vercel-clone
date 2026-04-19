export type DeploymentStatus =
  | "queued"
  | "building"
  | "uploading"
  | "ready"
  | "failed";

export function deriveStatusFromLogLine(logLine: string): DeploymentStatus | null {
  const normalized = typeof logLine === "string" ? logLine.trim() : "";

  if (!normalized) return null;
  if (normalized.startsWith("error:")) return "failed";
  if (normalized === "Build Started..." || normalized === "Build Started") {
    return "building";
  }
  if (
    normalized === "Build Complete" ||
    normalized === "Starting to upload" ||
    normalized.startsWith("uploading")
  ) {
    return "uploading";
  }
  if (normalized === "Done") return "ready";
  return null;
}

export function statusLabel(status?: string) {
  switch (status) {
    case "building":
      return "Building";
    case "uploading":
      return "Uploading";
    case "ready":
      return "Ready";
    case "failed":
      return "Failed";
    default:
      return "Queued";
  }
}

export function isTerminalStatus(status?: string) {
  return status === "ready" || status === "failed";
}
