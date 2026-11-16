import type { TermLine } from "@/components/terminal";

/* Real pilotctl sessions from pilotprotocol.network/service-agents (pilotctl 1.18.0, October 2026). */

export const NHTSA: TermLine[] = [
  { note: "# 1. trust the agent once (service agents approve automatically)" },
  { cmd: "pilotctl handshake nhtsa-recalls" },
  { out: " " },
  { note: "# 2. read its filters" },
  { cmd: "pilotctl send-message nhtsa-recalls --data '/help' --wait" },
  { out: "nhtsa-recalls — NHTSA recalls: every safety-recall campaign per" },
  { out: "make/model/year — campaign#, summary, consequence, remedy, dates." },
  { out: "Source: https://api.nhtsa.gov/recalls/recallsByVehicle" },
  { out: " " },
  { out: "Commands:" },
  { out: "  /help                       Show this help." },
  { out: "  /data {json filters}        Fetch data; returns a normalized envelope." },
  { out: "  /summary {json filters}     Fetch and return a Gemini summary." },
  { out: "  <free text>                 Ask a question; Gemini picks filters and fetches." },
  { out: " " },
  { out: "Filters:" },
  { out: "  make  [string / query] (required)  The vehicle manufacturer's name (e.g., 'Honda')." },
  { out: "  model  [string / query] (required)  The specific vehicle model name (e.g., 'Accord')." },
  { out: "  year  [int / query] (required)  The model year of the vehicle (e.g., 2020)." },
  { out: " " },
  { note: "# 3. ask for data; --wait prints the reply inline" },
  {
    cmd: `pilotctl --json send-message nhtsa-recalls \\
    --data '/data {"make":"Honda","model":"Accord","year":2020}' --wait \\
    | jq '.data.reply.data | fromjson'`,
  },
];

export const LIST_AGENTS: TermLine[] = [
  {
    cmd: `pilotctl --json send-message list-agents \\
    --data '/data {"search":"recall","limit":3}' --wait \\
    | jq '.data.reply.data | fromjson | .items[] | {hostname, category, example}'`,
  },
  { out: "{" },
  { out: '  "hostname": "nhtsa-recalls",' },
  { out: '  "category": "vehicles",' },
  { out: '  "example": "/data {\\"make\\": \\"<make>\\", \\"model\\": \\"<model>\\", \\"year\\": 1}"' },
  { out: "}" },
  { out: "{" },
  { out: '  "hostname": "openfda-food-recall",' },
  { out: '  "category": "health",' },
  { out: '  "example": "/data {\\"query\\": \\"<query>\\"}"' },
  { out: "}" },
  { out: "{" },
  { out: '  "hostname": "openfdadevice-recall",' },
  { out: '  "category": "health",' },
  { out: '  "example": "/data {}"' },
  { out: "}" },
];
