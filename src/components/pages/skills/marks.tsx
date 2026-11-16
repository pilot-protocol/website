import { LineIcon, Tile, TintedMark, type IconName } from "@/components/pages/compatibility/marks";
import type { Brand } from "@/components/v4/logos";

/*
 * Sky site: pictures for the catalogue. Each group has an icon; the bridges carry the mark of the service they
 * bridge to (Discord, Slack, GitHub, MCP, S3), the email bridge a letter.
 */

const GROUP_ICON: Record<string, IconName> = {
  communication: "chat",
  files: "file",
  trust: "shield",
  discovery: "radar",
  events: "broadcast",
  bridges: "link",
  "service-agents": "data",
};

const SKILL_BRAND: Record<string, Brand> = {
  "pilot-discord-bridge": "discord",
  "pilot-slack-bridge": "slack",
  "pilot-github-bridge": "github",
  "pilot-mcp-bridge": "mcp",
  "pilot-s3-bridge": "amazons3",
};
const SKILL_ICON: Record<string, IconName> = { "pilot-email-bridge": "mail" };

/** A group's tile: the Pilot P for the core skill, a line icon for the rest. */
export function GroupTile({ group, size = "md" }: { group: string; size?: "sm" | "md" | "lg" }) {
  if (group === "core") return <Tile pilot size={size} className="rounded-[10px]" />;
  return <Tile icon={GROUP_ICON[group] ?? "file"} accent size={size} />;
}

/** The small mark inside a skill's chip, where the skill is about a service that has one. */
export function SkillMark({ id }: { id: string }) {
  const b = SKILL_BRAND[id];
  if (b) return <TintedMark brand={b} className="size-[14px]" />;
  const i = SKILL_ICON[id];
  if (i) return <LineIcon name={i} className="size-[14px]" />;
  return null;
}

/** The selected skill's tile: its service's mark, else its group's icon. */
export function SkillTile({ id, group }: { id: string; group: string }) {
  const b = SKILL_BRAND[id];
  if (b) return <Tile brand={b} size="lg" />;
  const i = SKILL_ICON[id];
  if (i) return <Tile icon={i} size="lg" accent />;
  return <GroupTile group={group} size="lg" />;
}
