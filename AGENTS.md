# Writing for pilotprotocol.network

Read this before adding or changing any page, doc or blog post. It applies to people and to
automated writers alike: every claim on this site must be true today.

## What Pilot is

Pilot has four offerings. Nothing else is a Pilot product or service.

1. **Pilot Protocol** — the open-source (AGPL-3.0) daemon and `pilotctl`: permanent virtual
   addresses, Ed25519 identity, X25519 + AES-256-GCM tunnels, NAT traversal, mutual trust
   handshakes, messaging, pub/sub, webhooks, SDKs, the local `pilot-mcp` server. Vulture Labs runs
   the public backbone (registry and beacon) at no charge.
2. **Data service agents** — about 430 specialist agents on the backbone with typed JSON replies.
   `list-agents` is the directory; `pilot-mom` turns a plain-English task into a plan.
3. **App Store** — apps an agent installs with `pilotctl appstore install <id>` and calls over
   local IPC. Each app is made by its publisher (AEGIS, Cosift, Smol, the Wallet app and so on);
   call them apps in the App Store, not Pilot features. A few are metered against a per-user
   USD 5 budget.
4. **Pilot Cloud** — cloud.pilotprotocol.network: a hosted, always-on Pilot node used over MCP.
   Free; sign-ups are capped by capacity.

The open-source rendezvous also has private networks, roles, OIDC/JWT, policy, audit export and
blueprints. They work on a registry you run yourself (see /self-hosting/). On the public
backbone only the operators can create networks.

shell.online, Moonlit and Vulture Vision are separate Vulture Labs products. If a post mentions
one, credit Vulture Labs, not Pilot Protocol.

## Never write

- Sales or service offers: plans, tiers, "contact sales", "early access", enterprise evaluations,
  managed or dedicated networks, on-prem deployments, SLAs, priority support, design partners,
  paid placement or advertising to agents. None of these exist.
- Compliance or certification claims. There is no SOC 2 report and no HIPAA/BAA offering.
- Features that were removed or never built: tasks, polo score or reputation, tag-based peer
  search, the hosted console or platform (`pilotctl enterprise`, managed workspaces), app
  sandboxing ("guarded" mode).
- Numbers nobody measured: benchmarks without a harness in the repos, memory footprints, adoption
  percentages, survey figures without a source, customer counts. Name a customer or partner only
  with their permission on record.
- Invented quotes, testimonials or CLI output.

## Get commands right

Check every command against `pilotctl <cmd> --help` for the current release and against the
source (github.com/pilot-protocol/pilotprotocol). Common mistakes:

- `send-message <addr> --data '...' --wait` returns the reply inline; don't read files from
  `~/.pilot/inbox/` to get it.
- `publish` and `subscribe` take `<peer> <topic>`; topics match exactly, or `*` for all.
- Tags are operator setup (`pilotctl extras set-tags`) and don't make a node discoverable.
  Registry admin commands (`pilotctl extras network ...`, `member-tags`, `policy`) need admin
  rights on the registry, which on the public backbone only the operators have.
- `network join` needs a network an operator created, plus its token or invite. Don't present it
  as a first step for new users.
- Upgrades are `pilotctl appstore upgrade <id>`. `appstore install --force` reinstalls and keeps
  the app's state; `--reset-state` deletes it, so only suggest that when that is the point.
- Pilot ships as separate static binaries (`pilot-daemon`, `pilotctl`, `pilot-updater`) with no
  runtime dependencies, and needs a registry and beacon (the public ones or your own). It isn't
  "a single binary with zero dependencies".
- HTTPS proxies are supported (`-proxy`, `-proxy-cmd`, `--transport auto`).

## Live numbers

Label them with what they count: registered addresses (all time); daemons seen in the last
30 minutes; registry requests per second.

## Before you open a pull request

`npm run build`, `npm run check:plain` and `npm run check:site` must pass. A page with a plain
twin under `src/pages/plain/` needs its twin updated in the same change.
