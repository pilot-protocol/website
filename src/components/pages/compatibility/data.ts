/* Where pilot-daemon runs, from the compatibility page. Notes are the source's, lightly trimmed. */

export type Mode = "udp" | "compat" | "proxy" | "allowlist" | "wrong" | "unshipped";

export const MODES: { mode: Mode; label: string; long: string }[] = [
  { mode: "udp", label: "udp", long: "Default UDP transport" },
  { mode: "compat", label: "compat", long: "-transport=compat" },
  { mode: "proxy", label: "compat + proxy", long: "Compat through HTTPS_PROXY (v1.13.11+)" },
  { mode: "allowlist", label: "allowlist", long: "Works once Pilot is on the egress allowlist" },
  { mode: "wrong", label: "wrong runtime", long: "No daemon" },
  { mode: "unshipped", label: "not shipped", long: "No binary yet" },
];

/** Sentence-case names for the sky site, where the modes read as labels rather than flag values. */
export const SKY_LABEL: Record<Mode | "auto", string> = {
  udp: "UDP",
  compat: "Compat",
  proxy: "Compat + proxy",
  allowlist: "Allowlist",
  wrong: "Wrong runtime",
  unshipped: "Not shipped",
  auto: "Auto",
};

export type Platform = { name: string; mode: Mode; note: string };
export type Category = { id: string; title: string; note: string; items: Platform[] };

export const CATEGORIES: Category[] = [
  {
    id: "paas",
    title: "Container hosting / PaaS",
    note: "Deploy as a Dockerfile or buildpack. UDP availability varies; when in doubt, ship in compat mode.",
    items: [
      { name: "Render", mode: "compat", note: "UDP blocked. Single TCP/443 works as of v1.10.3." },
      { name: "Railway", mode: "udp", note: "Default-allow egress on both protocols." },
      { name: "Fly.io Machines", mode: "compat", note: "UDP needs dedicated IPv4; even then app-level egress is flaky." },
      { name: "Heroku", mode: "compat", note: "App-UDP undocumented; daemon re-registers fine across the ~24h dyno cycle." },
      { name: "DigitalOcean App Platform", mode: "compat", note: "Safer default; can’t open SSH/SMTP ports." },
      { name: "Northflank", mode: "udp", note: "UDP + TCP both first-class." },
      { name: "Coolify / CapRover", mode: "udp", note: "Self-hosted; inherits host firewall. Open UDP/4000 manually." },
    ],
  },
  {
    id: "serverless",
    title: "Serverless / functions",
    note: "Three out of four can’t host a persistent process. Cloud Run is the exception when min-instances=1.",
    items: [
      {
        name: "AWS Lambda",
        mode: "wrong",
        note: "15-min hard timeout kills the tunnel; no persistent daemon. Run the daemon as a Lambda Extension only while warm.",
      },
      { name: "Google Cloud Run", mode: "compat", note: "Set min-instances=1 to keep warm. Inbound is HTTPS-only." },
      { name: "Vercel / Netlify / GCP Functions", mode: "wrong", note: "Ephemeral execution; no persistent process model." },
      { name: "Cloudflare Workers", mode: "wrong", note: "No long-lived sockets, no UDP, no listen()." },
    ],
  },
  {
    id: "vms",
    title: "VMs / IaaS",
    note: "Full control. UDP works. Use -public to advertise a public node.",
    items: [
      { name: "EC2 / GCE / Azure VM", mode: "udp", note: "Open UDP/4000 in the security group." },
      { name: "DO Droplets / Hetzner / Linode", mode: "udp", note: "Same model: managed VMs with full firewall control." },
      { name: "Bare metal", mode: "udp", note: "No restrictions beyond your own network policy." },
    ],
  },
  {
    id: "k8s",
    title: "Kubernetes",
    note: "DaemonSet or sidecar. Default CNI allows UDP; corporate clusters with NetworkPolicy default-deny need compat.",
    items: [
      { name: "Vanilla k8s / EKS / GKE / AKS", mode: "udp", note: "Default CNI allows UDP egress; no special config needed." },
      { name: "k3s / k0s / OpenShift / kind", mode: "udp", note: "Same model: sidecar pattern over /shared/pilot.sock." },
      { name: "Locked clusters (NetworkPolicy default-deny)", mode: "compat", note: "Allow egress to TCP/443 only; compat mode covers the rest." },
    ],
  },
  {
    id: "sandboxes",
    title: "Coding-agent sandboxes",
    note: "A mix. Modal, E2B, Daytona and Codespaces are open; Docker-AI-Sandbox-class environments (Replit Agent, Devin) block raw TCP and let traffic out through an HTTP proxy, which compat mode uses since v1.13.11.",
    items: [
      { name: "Cursor Cloud Agents", mode: "allowlist", note: "Add *.pilotprotocol.network + 34.71.57.205 to the egress allowlist." },
      { name: "Replit Agent", mode: "proxy", note: "Docker AI Sandbox; raw TCP/UDP blocked. Compat mode goes through HTTPS_PROXY (v1.13.11+)." },
      { name: "Devin (Cognition)", mode: "proxy", note: "Same Docker AI Sandbox model; compat through HTTPS_PROXY." },
      { name: "Modal Sandboxes", mode: "udp", note: "Default-allow. Long timeout for persistent run." },
      { name: "E2B Sandboxes", mode: "udp", note: "IP/CIDR rules only; Pilot endpoints allowed by default." },
      { name: "Daytona Sandboxes", mode: "udp", note: "Default-allow; iptables-based." },
      { name: "GitHub Codespaces", mode: "udp", note: "IPv4 outbound works; 30-min idle stop pauses the daemon." },
      { name: "Gitpod", mode: "udp", note: "Configure a .gitpod.yml task." },
      { name: "Coder (workspaces)", mode: "udp", note: "Inherits the underlying provider (EC2 / k8s / Docker)." },
      { name: "Manus Sandbox", mode: "udp", note: "Default-allow with configurable egress rules." },
      { name: "Lovable / v0 / Bolt.new", mode: "wrong", note: "UI generators / WebContainers; no POSIX sockets." },
    ],
  },
  {
    id: "desktop",
    title: "Desktop / local",
    note: "install.sh wires up the right supervisor for each OS.",
    items: [
      {
        name: "macOS (LaunchAgent)",
        mode: "udp",
        note: "Writes ~/Library/LaunchAgents/network.pilotprotocol.pilot-daemon.plist; load it with launchctl.",
      },
      { name: "Linux (systemd)", mode: "udp", note: "sudo install writes the pilot-daemon + updater units; enable and start them with systemctl." },
      { name: "tmux / screen", mode: "udp", note: "Ad-hoc dev only; no auto-restart." },
      { name: "Windows", mode: "unshipped", note: "No Windows binary yet. Use WSL2 (Linux mode)." },
    ],
  },
  {
    id: "browser",
    title: "Browser / WASM",
    note: "The daemon needs a POSIX runtime; the SDKs need a local daemon over a Unix socket, so neither runs in a browser tab or WASM.",
    items: [
      {
        name: "Browser tab",
        mode: "wrong",
        note: "No raw sockets, and the JS SDK is Node-only (a Unix-socket client of a local daemon).",
      },
      { name: "WASM runtime", mode: "wrong", note: "Same model: the daemon needs POSIX." },
    ],
  },
];

export type Egress = { model: string; examples: string; ok: boolean; today: string; needed: string };

export const EGRESS: Egress[] = [
  { model: "Open egress", examples: "Home wifi, most cloud VMs, default Docker", ok: true, today: "UDP works; use the default.", needed: "nothing" },
  {
    model: "Default-deny, TCP/443 only",
    examples: "Hotel, airport, locked corporate wifi",
    ok: true,
    today: "Compat works as-is: a single outbound TCP/443.",
    needed: "-transport=compat",
  },
  {
    model: "HTTP CONNECT proxy",
    examples: "Corporate networks with an explicit proxy URL",
    ok: true,
    today: "Compat dials the registry and beacon through HTTPS_PROXY (v1.13.11+).",
    needed: "compat, or auto (the pilotctl default)",
  },
  {
    model: "Transparent TLS interception",
    examples: "Zscaler, Fortinet, Palo Alto, BlueCoat, Netskope",
    ok: true,
    today: "Works with -tls-trust=system (corporate CA in the OS store; the current default).",
    needed: "already supported",
  },
  {
    model: "HTTP-proxy-only sandbox",
    examples: "Replit Agent, Devin, Docker AI Sandbox",
    ok: true,
    today: "Compat through the proxy, CONNECT by hostname so local DNS does not matter (v1.13.11+).",
    needed: "compat; proxy_cmd if credentials rotate",
  },
  {
    model: "Domain-name allowlist",
    examples: "Cursor Cloud Agents, Zscaler PAC",
    ok: true,
    today: "Works after adding *.pilotprotocol.network + 34.71.57.205.",
    needed: "doc-only",
  },
  {
    model: "DPI / protocol allowlist",
    examples: "Great Firewall, Iran-style filters",
    ok: false,
    today: "Blocked. No domain fronting or ECH today.",
    needed: "out of scope",
  },
];

export type Deployment = {
  id: string;
  title: string;
  sub: string;
  mode: Mode | "auto";
  file?: string;
  lang?: "sh" | "docker" | "yaml";
  code?: string;
  note: string;
};

export const DEPLOYMENTS: Deployment[] = [
  {
    id: "render",
    title: "Render free-tier worker",
    sub: "UDP blocked",
    mode: "compat",
    file: "Dockerfile",
    lang: "docker",
    code: `FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y curl ca-certificates \\
    && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://pilotprotocol.network/install.sh | \\
    PILOT_EMAIL=you@example.com PILOT_ALLOW_ROOT=1 sh
ENTRYPOINT ["/root/.pilot/bin/pilot-daemon", "-transport=compat"]`,
    note: "No port exposed. Render allows arbitrary outbound TCP/443. Zero UDP, zero TCP/9000.",
  },
  {
    id: "lambda",
    title: "AWS Lambda",
    sub: "don’t",
    mode: "wrong",
    note: "Lambda has a 15-minute hard timeout and freezes the execution environment between invocations. A Lambda Extension can host the daemon, but only while the function is warm. The JS and Python SDKs are not a way around this: both are clients of a local pilot-daemon over a Unix socket, so they still need the daemon running. There is no daemon-less SDK path.",
  },
  {
    id: "k8s",
    title: "Kubernetes sidecar",
    sub: "egress-only pod",
    mode: "compat",
    file: "pod.yaml",
    lang: "yaml",
    code: `apiVersion: v1
kind: Pod
metadata: { name: app-with-pilot }
spec:
  containers:
    - name: app
      image: your/app:latest
    - name: pilot
      image: debian:bookworm-slim
      command: ["/bin/sh", "-c"]
      args:
        - curl -fsSL https://pilotprotocol.network/install.sh | \\
          PILOT_EMAIL=pilot@example.com PILOT_ALLOW_ROOT=1 sh &&
          exec /root/.pilot/bin/pilot-daemon -transport=compat \\
            -socket /shared/pilot.sock
      volumeMounts: [{ name: pilot-sock, mountPath: /shared }]
  volumes: [{ name: pilot-sock, emptyDir: {} }]`,
    note: "Works under any NetworkPolicy that permits egress to TCP/443. The app talks to the daemon over /shared/pilot.sock.",
  },
  {
    id: "macos",
    title: "macOS laptop",
    sub: "LaunchAgent",
    mode: "auto",
    file: "zsh",
    lang: "sh",
    code: `curl -fsSL https://pilotprotocol.network/install.sh | \\
  PILOT_EMAIL=you@example.com sh`,
    note: "The installer writes ~/Library/LaunchAgents/network.pilotprotocol.pilot-daemon.plist and prints the launchctl load command to start it. The transport defaults to auto: UDP where it works, compat over TCP/443 where it doesn’t.",
  },
  {
    id: "systemd",
    title: "Forced-compat systemd unit",
    sub: "locked-down corporate Linux",
    mode: "compat",
    file: "bash",
    lang: "sh",
    code: `curl -fsSL https://pilotprotocol.network/install.sh | sh -s -- --transport compat
# already installed: the units read the transport from ~/.pilot/config.json
pilotctl config --set transport=compat
sudo systemctl restart pilot-daemon`,
    note: "The installer saves \"transport\": \"compat\" in ~/.pilot/config.json; the service units it writes take the transport from there.",
  },
  {
    id: "proxy",
    title: "Proxy-only agent sandbox",
    sub: "HTTPS_PROXY, UDP blocked",
    mode: "proxy",
    file: "bash",
    lang: "sh",
    code: `# HTTPS_PROXY=http://user:pass@proxy.internal:3128 is already set
curl -fsSL https://pilotprotocol.network/install.sh | sh
pilotctl daemon start   # auto picks compat through the proxy
# proxy credentials that rotate: a command that prints the current proxy URL
pilotctl config --set proxy_cmd="bash -c 'printf %s \\"\\$https_proxy\\"'"`,
    note: "Since v1.13.11 the daemon asks the proxy to CONNECT by hostname, so poisoned local DNS does not matter, and TLS stays end to end. With a proxy command it re-reads the credentials every 60 seconds and after a 407. On Linux without systemd, pilotctl daemon start sets one up by itself when HTTPS_PROXY carries credentials.",
  },
];
