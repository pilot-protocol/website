# Claim-fix loop progress

Started 2026-07-10. Status: todo | in-progress | done | blocked.

## Product fixes (behavior-first — fix the product, then re-pass copy to the strong promise)
| gap | fix | PR | copy re-pass |
|---|---|---|---|
| app_usage telemetry leaked which app-store methods an agent calls (CLI always, daemon ignored consent flag) | removed app_usage emission entirely from CLI + daemon adapter | web4 #366 https://github.com/pilot-protocol/pilotprotocol/pull/366 | DONE — consent.astro restored to "no per-call telemetry, ever" |
| daemon-side telemetry (install/view) | RESOLVED — daemon emitted no install/view events; only app_usage, now removed (#366). install/view are CLI-only + already consent-gated | web4 #366 | done |
| skills status runs a write-reconcile instead of previewing | FIXED — added skillinject.Plan (read-only dry run); web4 wiring deferred until skillinject releases | skillinject #26 https://github.com/pilot-protocol/skillinject/pull/26 (+ web4 follow-up) | pending release |
| set-mode disabled leaves files on disk | FIXED — set-mode disabled now runs Uninstall | web4 #366 (fix/consent-truth) | DONE — consent.astro restored to "nothing left on disk" |
| broadcasts consent gate is send-side only | decide: add receive-side gate or keep send-side + doc | (in fix/consent-truth) | done in copy |
| GA4 loads unconditionally on /plain (GDPR) | FIXED — removed GA4 from PlainLayout entirely (plain = JS-stripped agent surface) | website #116 | n/a |

## Needs user review
- **pilot-mcp npm name is squatted (UX/security hazard)**: npx -y pilot-mcp installs an unrelated browser-automation MCP server (maintainer tacosyhorchata, npm latest 0.4.2 with a postinstall script), NOT the Pilot overlay MCP server. Pilot's 0.1.0 was never published. Docs now say build-from-source. Fix: publish under a scoped name (e.g. @pilot-protocol/mcp) and update mcp-setup + any blog referencing npx -y pilot-mcp.
- **Private-node directory metadata leak (security)**: the docs claimed private agents are "invisible", but the registry's lookup RPC returns a private node's hostname/networks/tags/public_key to any caller with no trust/membership check (protocol registry server.go:4050-4104), and list_nodes enumerates non-backbone network members without membership. Only the endpoint is withheld. Docs now say "endpoint-level privacy"; if full metadata privacy is intended, the registry needs a requester gate on lookup/list_nodes.
- **Sign the handshake justification (small crypto gap)**: the Ed25519 handshake signature covers only `handshake:<node_id>:<peer_id>`, not the justification text (handshake@v0.2.1 handshake.go:37). An operator reviewing a request cannot cryptographically trust the justification. Consider including it in the signed bytes. Website copy is now honest about it.
- **Gateway positioning (product decision)**: pilot-protocol/gateway is a Go library only — the standalone pilot-gateway binary has no public cmd/ source, and the pilotctl extras gateway list/map/unmap/stop subcommands are stubs. Public users cannot use the gateway CLI workflow as documented. Options: publish cmd/gateway, or reposition the gateway as an embeddable library (docs now say library + caveated). Your call.
- **Tags not indexed for discovery (product gap)**: pilotctl set-tags stores tags on a node, but the list-agents directory search only matches hostname/category/description (search.py _doc_text), so tags do not actually aid capability discovery. Either index tags in list-agents search, or reposition tags as pure metadata. (Docs now honest about this.)
- **Per-session forward secrecy (crypto roadmap)**: the daemon generates ONE X25519 keypair at startup and reuses it for all tunnels (tunnel.go:524-526), so there is no per-session forward secrecy — a compromise of the daemon key exposes past captured sessions. Website copy is now honest about this (peer isolation, not FS). Real fix = rotating/ephemeral per-session X25519 keys (a Noise-IK-style rekey). Significant crypto work; your call.
- **install.sh `--email` flag** (product-fix candidate): the compatibility examples used `--email`, which install.sh rejects (exit 2); website now uses `PILOT_EMAIL=` env. install.sh's OWN header comment still references `--email`. Options: add a real `--email` flag to the installer parser (makes the natural UX work, matches the header) OR fix the header comment. Touches release/install.sh → needs R2 deploy via pilot-release worker, so parking for your greenlight.

- (none yet)

- **privacy.astro SMS section** (legal, needs decision): the privacy policy has a full SMS-data-collection section (phone numbers, consent records, STOP/HELP, provider DPA), but there is NO phone/SMS collection anywhere on the website or in the product. Keep as forward-looking boilerplate, or remove until an SMS program ships? (Not touched — legal-commitment change.)

- **terms.astro §5 "not open-source licensed"** (legal, needs decision): the Terms say the website, documentation, and branding "are not open-source licensed," but the website source repo is public under AGPL-3.0 with no content/branding carve-out in LICENSE — so the blanket claim is contradicted by the repo's own license. Trademark on the name/logo survives AGPL, but the clause as written is false. Fix: either add a documented content-license exception to the repo (keeping code AGPL, content proprietary), or reword the clause to match reality. Legal-commitment change, not auto-edited.

- **pilot-agents repo is private** (needs decision): docs/service-agents tells readers to `cp -r pilot-agents/template` but the repo is access-gated — make it public, or keep the "reach out for access" framing I added? Also the injected pilotctl skill (TeoSlayer/pilot-skills) still says search is "literal token match" — it is actually semantic; worth updating that skill repo too.

## Batch fixes (repo-wide, applied across all blogs)
- 2026-07-10 iter 21: fixed recurring templated errors site-wide — github.com/pilot-protocol/pilotprotocol/pkg/driver → common/driver (12 posts, incl. shorthand variant); driver.Connect() → Connect("") (21 occurrences); fictional stream.OpenEventStream pub/sub API caveated as illustrative in 4 posts (real SDK = SendTo/RecvFrom, pub/sub via pilotctl publish/subscribe). Verified against common@v0.5.7/driver (no Subscribe/Publish/EventStream method) + public pkg/ (no driver). Individual blog ledgers stay todo for their unique issues.

## Pages
| ledger | false | unverifiable | status |
|---|---:|---:|---|
| audit/docs/consent.md | 33 | 6 | done |
| audit/for/compatibility.md | 16 | 33 | done |
| audit/docs/enterprise-blueprints.md | 24 | 0 | done |
| audit/pages/privacy.md | 11 | 37 | done |
| audit/docs/cli-reference.md | 21 | 6 | done |
| audit/docs/enterprise-identity.md | 22 | 0 | done |
| audit/blog/enterprise-production-complete-identity-directory-audit-export.md | 0 | 62 | done |
| audit/for/setups/[slug].md | 0 | 56 | done |
| audit/blog/zero-dependency-encryption-x25519-aes-gcm.md | 15 | 9 | done |
| audit/blog/github-com-alternatives-6.md | 3 | 43 | done |
| audit/docs/service-agents.md | 16 | 0 | done |
| audit/blog/lightweight-swarm-communication-drones-robots.md | 9 | 20 | done |
| audit/docs/tags.md | 15 | 2 | done |
| audit/docs/gateway.md | 15 | 1 | done |
| audit/blog/benchmarking-http-vs-udp-overlay.md | 4 | 32 | done |
| audit/blog/secure-ai-agent-communication-zero-trust.md | 4 | 30 | done |
| audit/docs/comparison-networking.md | 13 | 3 | done |
| audit/blog/contributing-codebase-tour.md | 9 | 14 | done |
| audit/blog/emergent-trust-networks-agents-choose-peers.md | 1 | 37 | done |
| audit/blog/openanp-ai-alternatives-6.md | 1 | 34 | done |
| audit/blog/nat-traversal-ai-agents-deep-dive.md | 8 | 12 | done |
| audit/docs/comparison.md | 10 | 6 | done |
| audit/blog/secure-ai-agent-networking-workflow-step-by-step.md | 0 | 35 | todo |
| audit/blog/build-ai-agent-marketplace-discovery-reputation.md | 6 | 16 | done |
| audit/blog/build-multi-agent-network-five-minutes.md | 11 | 1 | done |
| audit/blog/distributed-monitoring-without-prometheus.md | 5 | 19 | done |
| audit/blog/how-626-agents-autonomously-adopted-pilot.md | 0 | 33 | todo |
| audit/blog/pilot-vs-tcp-grpc-nats-comparison.md | 3 | 24 | done |
| audit/pages/for-p2p.md | 9 | 6 | done |
| audit/blog/decentralized-networking-p2p-solutions-ai-architectures.md | 2 | 26 | done |
| audit/blog/replace-webhooks-with-persistent-agent-tunnels.md | 7 | 11 | done |
| audit/blog/private-agent-network-company.md | 7 | 10 | done |
| audit/blog/build-agent-swarm-self-organizes.md | 7 | 9 | done |
| audit/blog/connect-agents-across-aws-gcp-azure-without-vpn.md | 3 | 21 | done |
| audit/blog/encrypted-data-exchange-for-decentralized-ai-systems.md | 6 | 11 | done |
| audit/blog/build-openclaw-agent-self-organizes-pilot.md | 7 | 5 | done |
| audit/blog/cloud-networking-secure-peer-to-peer-distributed-ai.md | 6 | 8 | done |
| audit/blog/mcp-plus-pilot-tools-and-network.md | 7 | 5 | done |
| audit/blog/openclaw-agents-behind-nat-zero-config.md | 4 | 14 | todo |
| audit/blog/replace-message-broker-twelve-lines-go.md | 6 | 8 | done |
| audit/blog/run-agent-network-without-cloud-dependency.md | 4 | 13 | todo |
| audit/pages/cookies.md | 7 | 4 | done |
| audit/pages/publish.md | 3 | 16 | done |
| audit/blog/move-beyond-rest-persistent-connections-for-agents.md | 5 | 9 | done |
| audit/blog/trust-model-agents-invisible-by-default.md | 6 | 6 | done |
| audit/docs/enterprise-audit.md | 8 | 0 | done |
| audit/blog/ai-agent-discovery-process-p2p-networks.md | 3 | 14 | done |
| audit/blog/ai-agent-network-examples-secure-scalable-connectivity.md | 1 | 20 | todo |
| audit/blog/cross-company-agent-collaboration-without-shared-infrastructure.md | 5 | 8 | done |
| audit/blog/how-pilot-protocol-works.md | 5 | 8 | done |
| audit/blog/preferential-attachment-ai-networks-trust-graph.md | 0 | 23 | todo |
| audit/docs/app-store.md | 7 | 2 | done |
| audit/docs/getting-started.md | 5 | 8 | done |
| audit/docs/python-sdk.md | 7 | 2 | done |
| audit/for/mcp.md | 7 | 2 | done |
| audit/blog/building-custom-pilot-skills-openclaw.md | 4 | 10 | done |
| audit/blog/connect-ai-agents-behind-nat-without-vpn.md | 1 | 19 | todo |
| audit/blog/decentralized-communication-protocols-ai-developers.md | 0 | 22 | todo |
| audit/blog/how-mutual-trust-secures-decentralized-ai-agent-networks.md | 0 | 22 | todo |
| audit/blog/scriptorium-replace-agentic-active-research-ready-intelligence.md | 2 | 16 | todo |
| audit/blog/chain-ai-models-across-machines.md | 4 | 9 | done |
| audit/blog/http-services-over-encrypted-overlay.md | 6 | 3 | done |
| audit/docs/error-codes.md | 6 | 3 | done |
| audit/docs/networks.md | 7 | 0 | done |
| audit/docs/pubsub.md | 7 | 0 | done |
| audit/blog/multi-agent-system-networking-guide-ai-developers.md | 2 | 14 | todo |
| audit/docs/pilot-director.md | 6 | 2 | done |
| audit/pages/for-networks.md | 5 | 5 | done |
| audit/blog/ai-networking-best-practices-secure-scalable-systems.md | 0 | 19 | todo |
| audit/blog/distributed-rag-without-central-knowledge-base.md | 4 | 7 | done |
| audit/blog/smart-home-without-cloud-local-device-communication.md | 3 | 10 | todo |
| audit/docs/enterprise-rbac.md | 6 | 1 | done |
| audit/blog/ietf-internet-draft-pilot-protocol.md | 2 | 12 | todo |
| audit/blog/legacy-protocol-integration-for-secure-distributed-ai.md | 1 | 15 | todo |
| audit/blog/multi-cloud-networking-decentralized-ai-systems.md | 1 | 15 | todo |
| audit/docs/messaging.md | 6 | 0 | done |
| audit/blog/boarding-pilotagent-org-alternatives-3.md | 0 | 17 | todo |
| audit/blog/direct-communication-protocols-ai-agents-guide.md | 3 | 8 | todo |
| audit/blog/enterprise-phase-3-rbac-policies-audit-fleet.md | 4 | 5 | done |
| audit/blog/federated-learning-p2p-communication.md | 1 | 14 | todo |
| audit/blog/peer-to-peer-file-transfer-agents.md | 5 | 2 | done |
| audit/blog/secure-research-collaboration-share-models-not-data.md | 4 | 5 | done |
| audit/blog/a2a-agent-cards-over-pilot-tunnels.md | 4 | 4 | done |
| audit/blog/encryption-protocols-for-secure-ai-systems-a-practical-guide.md | 1 | 13 | todo |
| audit/blog/sociology-of-machines-626-agents.md | 3 | 7 | todo |
| audit/blog/connecting-mcp-servers-across-agents.md | 2 | 9 | todo |
| audit/blog/network-security-for-multi-agent-systems-key-strategies.md | 1 | 12 | todo |
| audit/blog/scaling-openclaw-fleets-thousands-agents.md | 1 | 12 | todo |
| audit/docs/concepts.md | 5 | 0 | done |
| audit/docs/diagnostics.md | 5 | 0 | done |
| audit/docs/webhooks.md | 5 | 0 | done |
| audit/blog/agent-communication-security-best-practices.md | 4 | 2 | done |
| audit/blog/clawhub-to-live-network-openclaw-discovery.md | 2 | 8 | todo |
| audit/blog/how-ai-agents-discover-each-other.md | 2 | 8 | todo |
| audit/blog/trustless-protocols-that-secure-decentralized-ai-systems.md | 0 | 14 | todo |
| audit/blog/userspace-tcp-over-udp-stack-pure-go.md | 3 | 5 | todo |
| audit/blog/virtual-network-addresses-for-secure-decentralized-ai.md | 2 | 8 | todo |
| audit/blog/why-ai-agents-need-network-stack.md | 2 | 8 | todo |
| audit/blog/aegis-agent-firewall-prompt-injection.md | 4 | 1 | done |
| audit/docs/configuration.md | 4 | 1 | done |
| audit/blog/autonomous-agent-networking-distributed-ai.md | 0 | 12 | todo |
| audit/blog/enterprise-private-networks-roadmap.md | 1 | 9 | todo |
| audit/blog/hipaa-compliant-agent-communication.md | 2 | 6 | todo |
| audit/blog/ietf-internet-drafts-pilot-protocol-revision-01.md | 1 | 9 | todo |
| audit/blog/multi-agent-pipelines-openclaw-encrypted-tunnels.md | 3 | 3 | done |
| audit/blog/openclaw-meets-pilot-agent-networking-one-command.md | 3 | 3 | done |
| audit/blog/overlay-networking-automation-secure-ai-agent-solutions.md | 0 | 12 | todo |
| audit/blog/overlay-networking-secure-ai-agent-communication-explained.md | 0 | 12 | todo |
| audit/blog/peer-to-peer-networking-examples-ai-engineers.md | 2 | 6 | todo |
| audit/blog/persistent-address-strategies-for-distributed-ai-systems.md | 1 | 9 | todo |
| audit/blog/protocol-wrapping-secure-peer-to-peer-ai-systems.md | 0 | 12 | todo |
| audit/blog/python-sdk-pilot-protocol.md | 3 | 3 | todo |
| audit/docs/integration.md | 4 | 0 | done |
| audit/apps/[id].md | 3 | 2 | done |
| audit/blog/overlay-network-ai-agents.md | 3 | 2 | todo |
| audit/blog/why-autonomous-agents-need-private-discovery.md | 0 | 11 | todo |
| audit/pages/index.md | 2 | 5 | done |
| audit/blog/advanced-network-automation-tips-secure-ai-systems.md | 2 | 4 | todo |
| audit/blog/claude-agent-teams-over-pilot.md | 2 | 4 | todo |
| audit/blog/peer-to-peer-agent-communication-no-server.md | 2 | 4 | todo |
| audit/docs/firewalls.md | 2 | 4 | done |
| audit/docs/mcp-setup.md | 3 | 1 | done |
| audit/blog/ai-networking-challenges-decentralized-systems.md | 0 | 9 | todo |
| audit/blog/network-tunnels-ai-secure-communication-autonomous-agents.md | 0 | 9 | todo |
| audit/docs/enterprise-policies.md | 3 | 0 | done |
| audit/docs/research.md | 3 | 0 | done |
| audit/docs/sdk-parity.md | 3 | 0 | done |
| audit/docs/services.md | 3 | 0 | done |
| audit/pages/terms.md | 2 | 3 | done |
| audit/blog/persistent-network-addressing-secure-ai-systems.md | 1 | 5 | todo |
| audit/blog/pilot-vs-tailscale-nebula-zerotier-ai-agents.md | 2 | 2 | todo |
| audit/blog/trust-network-protocols-secure-decentralized-systems.md | 0 | 8 | todo |
| audit/docs/troubleshooting.md | 2 | 2 | done |
| audit/blog/private-networks-now-in-testing.md | 0 | 7 | todo |
| audit/pages/plans.md | 0 | 7 | todo |
| audit/blog/ai-networking-terminology-a2a-mcp-anp-protocols.md | 0 | 6 | todo |
| audit/blog/encrypted-tunnel-advantages-peer-to-peer-ai-networks.md | 0 | 6 | todo |
| audit/blog/index.md | 2 | 0 | todo |
| audit/blog/secure-network-infrastructure-ai-agents-practical-guide.md | 0 | 6 | todo |
| audit/blog/securing-ai-agent-networks-multi-cloud-environments.md | 0 | 6 | todo |
| audit/blog/why-direct-p2p-connections-power-secure-ai-networking.md | 0 | 6 | todo |
| audit/docs/enterprise.md | 2 | 0 | done |
| audit/docs/go-sdk.md | 2 | 0 | done |
| audit/pages/app-store.md | 1 | 3 | done |
| audit/blog/persistent-addresses-distributed-autonomous-systems.md | 0 | 5 | todo |
| audit/blog/secure-communication-protocols-distributed-ai-systems.md | 1 | 2 | todo |
| audit/blog/what-is-protocol-overlay-fundamentals-practical.md | 0 | 5 | todo |
| audit/blog/why-secure-direct-p2p-connections-matter-for-ai-agents.md | 0 | 5 | todo |
| audit/pages/aup.md | 0 | 4 | todo |
| audit/blog/build-agent-app-turn-api-into-tool.md | 0 | 3 | todo |
| audit/blog/enterprise-identity-integration-pilot-protocol.md | 0 | 3 | todo |
| audit/docs/node-sdk.md | 1 | 0 | done |
| audit/for/skills.md | 1 | 0 | done |
| audit/pages/publisher-agreement.md | 0 | 3 | todo |
| audit/blog/secure-data-exchange-for-multi-cloud-ai-systems.md | 0 | 2 | todo |
| audit/blog/web-search-api-for-ai-agents-grounded-research.md | 0 | 2 | todo |
| audit/for/setups.md | 0 | 2 | todo |
| audit/blog/ai-agent-app-store.md | 0 | 1 | todo |
| audit/blog/build-an-agent-app.md | 0 | 1 | todo |
| audit/docs/index.md | 0 | 1 | todo |
| audit/pages/500.md | 0 | 1 | todo |
| audit/pages/press.md | 0 | 1 | todo |
| audit/docs/motd.md | 0 | 0 | todo |
| audit/docs/security.md | 0 | 0 | todo |
| audit/docs/swift-sdk.md | 0 | 0 | todo |
| audit/docs/trust.md | 0 | 0 | todo |
| audit/pages/404.md | 0 | 0 | todo |
