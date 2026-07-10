# Claim audit: src/pages/for/compatibility.astro
Audited: 2026-07-10 · Sentences examined: 140 · verified: 69 · false: 16 · unverifiable: 33 · opinion: 13 · example: 9

## FLAGGED — FALSE
| Line | Sentence (quote, truncate >160 chars) | Evidence it is false |
|---|---|---|
| 447–448 | `RUN curl -fsSL https://pilotprotocol.network/install.sh \| sh -s -- --email you@example.com` | install.sh has NO `--email` flag. Parser (release/install.sh:90–121; identical in live https://pilotprotocol.network/install.sh, fetched 2026-07-10) accepts only --version/--channel/--yes/--no-warn/--help/--; any other `-*` hits `echo "Error: unknown flag: $1"; exit 2`. Email is PILOT_EMAIL env or interactive prompt (install.sh:282–297). Additionally, Docker RUN executes as root and install.sh:136–139 aborts as root unless PILOT_ALLOW_ROOT=1 — this Dockerfile fails twice. |
| 473–474 | k8s sidecar args: `curl … install.sh \| sh -s -- --email pilot@example.com && exec …` | Same: `--email` → "unknown flag" exit 2 (install.sh:90–121), and the debian container runs as root without PILOT_ALLOW_ROOT=1 → install.sh:136 aborts. |
| 486–487 | macOS example: `curl -fsSL https://pilotprotocol.network/install.sh \| sh -s -- --email you@example.com` | Same `--email` unknown-flag failure (install.sh:90–121; confirmed in live install.sh). |
| 495–496 | `sudo curl … \| sudo PILOT_ALLOW_ROOT=1 sh -s -- --email you@example.com` | PILOT_ALLOW_ROOT is real (install.sh:136), but `--email` is still rejected with exit 2 (install.sh:114–116). |
| 456 | "If you want Pilot-from-Lambda, call the registry directly via the JS or Python SDK over HTTPS during the handler invocation" | Neither SDK can call the registry over HTTPS. sdk-node README: "The SDK talks to a local pilot-daemon over a Unix domain socket through a pre-built libpilot shared library"; sdk-python README: "talks to a local pilot-daemon over a Unix domain socket" (gh api repos/pilot-protocol/sdk-{node,python}/readme, 2026-07-10). Both require a running local daemon. |
| 43 | "Use the SDK in the handler, not the daemon." (AWS Lambda card) | Same evidence: the SDKs are Unix-socket clients of a local pilot-daemon (sdk-node/sdk-python READMEs); there is no daemon-less SDK mode, so "SDK without daemon" does not work on Lambda. |
| 98 | "No raw sockets — use the JS SDK over WSS instead." (Browser tab card) | The JS SDK has no browser/WSS mode: it is Node-only, loads libpilot via koffi FFI and connects to a local daemon over a Unix domain socket (sdk-node README lines 10–12, 71). It cannot run in a browser tab. |
| 96 | "Use the JS/Python SDK from your app; the daemon needs a POSIX runtime." (Browser/WASM blurb) | Misleading-to-false for this category: both SDKs require a local pilot-daemon + Unix socket + native shared library (sdk-node/sdk-python READMEs), none of which exist in a browser tab or WASM runtime. |
| 107 | "~ WSS dial honors HTTPS_PROXY; registry TLS dial does not" | First half false. WSS dial builds its own `http.Client{Transport: &http.Transport{TLSClientConfig: …}}` (web4 pkg/daemon/transport/wss/wss.go:238–247) — `Proxy` field nil → env proxies ignored. `grep -r HTTPS_PROXY\|ProxyFromEnvironment` across web4 pkg/ and cmd/: zero hits. Second half (registry raw tls.DialWithDialer) is true. |
| 107 | needed: "tracked on GitHub — registry over HTTPS_PROXY" | No such issue. `gh api search/issues q='repo:pilot-protocol/pilotprotocol HTTPS_PROXY'` → 0 results (2026-07-10); "proxy" search returns only unrelated closed items. |
| 109 | needed: "tracked on GitHub — HTTPS_PROXY via CONNECT" | Same: zero HTTPS_PROXY issues in pilot-protocol/pilotprotocol (gh api search, 2026-07-10). |
| 361 | Legend: "compat+proxy — needs HTTPS_PROXY (tracked on GitHub)" | Same: no GitHub issue tracks HTTPS_PROXY support; the link points at the generic issues page. |
| 72 | "HTTPS_PROXY support tracked on GitHub." (Replit Agent card) | Same: gh issue search for HTTPS_PROXY in pilot-protocol/pilotprotocol returns 0 results. |
| 88 | "~/Library/LaunchAgents/network.pilotprotocol.daemon.plist auto-loaded." | Wrong filename AND not auto-loaded. install.sh:593 writes `network.pilotprotocol.pilot-daemon.plist`; the only `launchctl load` mention is a printed instruction "Start: launchctl load $PLIST" (install.sh:674) — the installer never loads it. |
| 489 | "Installer writes ~/Library/LaunchAgents/network.pilotprotocol.daemon.plist and loads it." | Same evidence: actual name `network.pilotprotocol.pilot-daemon.plist` (install.sh:593); installer prints load instructions instead of loading (install.sh:674). |
| 89 | "sudo install enables the system unit + auto-updater." (Linux card) | Installer writes pilot-daemon.service/pilot-updater.service and runs `systemctl daemon-reload`, then prints "Start: sudo systemctl start …" / "Enable: sudo systemctl enable …" (install.sh:581–585). It never runs `systemctl enable` or `start` — units are installed, not enabled. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 30 / 441 | "UDP blocked." (Render; repeated in worked-example heading) | Vendor network policy; not documented in a fetchable page I could confirm | Render docs page on outbound UDP, or a live test from a Render service |
| 451 | "Render allows arbitrary outbound TCP/443." | Vendor behavior claim | Render egress docs / live test |
| 31 | "Default-allow egress on both protocols." (Railway) | Vendor behavior claim | Railway networking docs |
| 32 | "UDP needs dedicated IPv4; even then app-level egress is flaky." (Fly.io) | Vendor claim + anecdotal "flaky" | Fly.io UDP docs + reproducible test |
| 33 | "App-UDP undocumented; daemon re-registers fine across the ~24h dyno cycle." (Heroku) | Heroku dyno-cycling page fetched (devcenter.heroku.com/articles/dynos, 200) but no "24 hours"/cycling text found on current page; "re-registers fine" is an untested product claim | Heroku "automatic dyno restarts" doc; an integration test across a dyno restart |
| 34 | "Safer default — can't open SSH/SMTP ports." (DO App Platform) | Vendor claim | DigitalOcean App Platform networking docs |
| 35 | "UDP + TCP both first-class." (Northflank) | Vendor claim | Northflank protocol docs |
| 41 | "Three out of four can't host a persistent process." | Aggregate of vendor claims | Per-vendor runtime docs |
| 41 | "Cloud Run is the exception when min-instances=1." | Vendor claim | Cloud Run min-instances docs |
| 44 | "Set min-instances=1 to keep warm." / "Inbound is HTTPS-only." (Cloud Run) | Vendor claims (plausible, not fetched) | Cloud Run docs |
| 45 | "Ephemeral execution — no persistent process model." (Vercel/Netlify/GCP Functions) | Vendor claims | Each vendor's runtime docs |
| 46 | "No long-lived sockets, no UDP, no listen()." (Cloudflare Workers) | CF docs fetch (developers.cloudflare.com/workers/runtime-apis/tcp-sockets/) returned no greppable UDP statement; also "no long-lived sockets" is dubious given Workers TCP/WebSocket support | Current CF Workers runtime-API docs |
| 60 | "Default CNI allows UDP; corporate clusters with NetworkPolicy default-deny → compat." (blurb, first half) | Ecosystem generalization | CNI defaults docs (Calico/Cilium/kubenet) |
| 62 | "Default CNI allows UDP egress; no special config needed." | Same generalization | Same |
| 69 | "Modal/E2B/Daytona/Codespaces are open; Docker-AI-Sandbox-class (Replit Agent, Devin) blocks raw TCP." | Multi-vendor sandbox claims | Vendor sandbox network docs |
| 71 | "Add *.pilotprotocol.network + 34.71.57.205 to the egress allowlist." (Cursor Cloud Agents) | Endpoints are correct (registry 34.71.57.205 pre-verified) but the premise that Cursor Cloud Agents use a configurable egress allowlist is a vendor claim | Cursor Cloud Agents docs |
| 72 | "Docker AI Sandbox — raw TCP/UDP blocked." (Replit) | Vendor claim | Replit Agent sandbox docs |
| 73 | "Same Docker AI Sandbox model." (Devin) | Vendor claim | Cognition docs |
| 74 | "Default-allow." / "Long timeout for persistent run." (Modal) | Vendor claims | Modal sandbox docs |
| 75 | "IP/CIDR rules only; Pilot endpoints allowed by default." (E2B) | Vendor claim | E2B network docs |
| 76 | "Default-allow; iptables-based." (Daytona) | Vendor claim | Daytona docs |
| 77 | "IPv4 outbound works" (Codespaces, first half — 30-min idle verified separately) | Vendor claim | Codespaces network docs |
| 78 | "Configure .gitpod.yml task." (Gitpod) | Vendor config claim (plausible, not fetched) | Gitpod docs |
| 80 | "Default-allow with configurable egress rules." (Manus Sandbox) | Vendor claim | Manus docs |
| 81 | "UI generators / WebContainers — no POSIX sockets." (Lovable / v0 / Bolt.new) | Vendor/runtime claims (WebContainers plausible; Lovable/v0 architecture unconfirmed) | StackBlitz WebContainers docs + vendor architecture pages |
| 327 | "~10–30 ms one-way" (UDP mode stat) | Latency figure with no benchmark cited | Published benchmark or repeatable measurement |
| 344 | "~50–200 ms one-way" (compat mode stat) | Same | Same |
| 340 | "…~1.5–2× latency." (compat card) | Same | Same |
| 364 | "Vendor behavior last verified June 2026." | Internal process claim; no verification artifact exists | A dated verification log/checklist in the repo |

## Verified claims (grouped by source)
- web4/cmd/daemon/main.go:46–113: `-transport` default "udp" with 'compat' opt-in (L97); `-tls-trust` default "system" incl. corp-CA/OS-store behavior for TLS interception row (L99); `-compat-beacon` default wss://beacon.pilotprotocol.network/v1/compat (L98); `-socket` flag (L62, used as `-socket /shared/pilot.sock`); `-public` "make this node's endpoint publicly visible" (L85); `-registry-trust` pinned/system (L68); `-identity` Ed25519 (L69); `-encrypt` X25519+AES-256-GCM (L65) — covers lede, zoo cards, legend, CTA, and egress rows 1/2/4.
- web4/cmd/daemon/main.go:153–175: compat mode auto-targets registry.pilotprotocol.network:443 with TLS+system trust when not overridden — "TLS to the registry for control", "exactly one outbound port: 443", "single port" claims.
- web4/CHANGELOG.md [1.10.3] 2026-05-19 (lines 400–455): "Compat mode is now single-port-443" — verifies "Since v1.10.3", "Single TCP/443 works as of v1.10.3", "Before v1.10.3 … TCP/9000 for the registry", nginx `ssl_preread` SNI routing of registry.* → TLS terminator → 127.0.0.1:9000 and beacon.* → WSS vhost, "zero TCP/9000, zero UDP", Ed25519 trust unchanged.
- common@v0.5.7/registry/client/client.go:150–203: DialTLSPool/DialTLSPinned use raw `tls.DialWithDialer` over TCP — verifies "registry TLS dial does not [honor HTTPS_PROXY]" and "daemon needs raw TCP to :443" (egress row 5).
- web4 grep (pkg/, cmd/): no ECH / EncryptedClientHello / domain-fronting code — verifies "no domain fronting / ECH today" (egress row 7).
- release/install.sh (+ live copy fetched 2026-07-10, HTTP 200): BIN_DIR=$HOME/.pilot/bin → `/root/.pilot/bin/pilot-daemon` ENTRYPOINT path; systemd unit pilot-daemon.service + pilot-updater.service written with `-listen :4000` and `-socket /tmp/pilot.sock` (L537–585) — verifies UDP/4000 claims ("Open UDP/4000 in security group", "open UDP/4000 manually", "UDP/4000 required", "blocks UDP/4000"), unit name for `sudo systemctl edit pilot-daemon`, "install.sh wires up the right supervisor for each OS", PILOT_ALLOW_ROOT=1 (L136); OS case linux|darwin only (L266–268) — verifies "No Windows binary yet — use WSL2".
- Pre-verified cheatsheet: registry 34.71.57.205:9000 / beacon :9001, compat = TCP/443 SNI-routed via registry./beacon.pilotprotocol.network — verifies allowlist row "*.pilotprotocol.network + 34.71.57.205"; repos pilot-protocol/pilotprotocol exists (releases/issues links; releases/latest returned 302 live).
- AWS docs (docs.aws.amazon.com/lambda, fetched 2026-07-10): "15 minutes"/900s max timeout (gettingstarted-limits) and runtime environment freeze + extension lifecycle (lambda-runtime-environment) — verifies "15-min hard timeout", "freezes the execution environment between invocations", "Extension … only while the function is warm".
- GitHub docs (docs.github.com codespaces timeout page, fetched 2026-07-10): default idle timeout 30 minutes — verifies "30-min idle stop".
- Local site tree (src/pages/docs/): firewalls.astro, getting-started.astro exist — verifies /docs/firewalls and /docs/getting-started links (4 occurrences).
- Live URLs: https://pilotprotocol.network/install.sh (200), https://vulturelabs.com (200, JSON-LD publisher), https://github.com/pilot-protocol/pilotprotocol/releases/latest (302 to latest).
- Definitional/logical: Coolify/CapRover self-hosted inherits host firewall; VM cards (security-group control, bare metal); Coder inherits provider; tmux/screen no auto-restart; k8s sidecar over /shared/pilot.sock; "Works under any NetworkPolicy that permits egress to TCP/443"; browser/WASM "daemon needs POSIX".

## Resolutions (2026-07-10, loop iteration 8)
All 16 FALSE resolved + 33 UNVERIFIABLE addressed. Re-verified against live install.sh + source: the parser (install.sh:91-118) accepts only --version/--channel/--yes/--no-warn/--help/-- and rejects `--email` with exit 2 (email = PILOT_EMAIL env or prompt); root containers need PILOT_ALLOW_ROOT=1; plist is network.pilotprotocol.pilot-daemon.plist and is NOT auto-loaded (installer prints launchctl load); systemd units written but not enabled; SDKs (sdk-node/sdk-python) are Unix-socket clients of a local daemon (no HTTPS/WSS/browser path); WSS dial does not honor HTTPS_PROXY (wss.go Transport.Proxy nil) and no GitHub issue tracks it.
- FALSE fixes: every `--email` example → `PILOT_EMAIL=... [PILOT_ALLOW_ROOT=1] sh`; Lambda/browser SDK claims corrected (SDK needs local daemon); proxy row + legend + Replit note reworded to "not yet supported" (no tracking issue); plist name/load + systemd enable corrected.
- UNVERIFIABLE (30 vendor-behavior cells + latency + verification-date): can't test 30 platforms in-loop → reframed the matrix disclaimer as best-effort, uncertified platform notes (removed fabricated "last verified June 2026"); latency figures (~10-30ms/~50-200ms/~1.5-2×) replaced with relative "RTT-bound / +1 hop via beacon" framing (no benchmark to cite).

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
