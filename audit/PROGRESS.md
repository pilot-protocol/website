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
- (none yet)

## Pages
| ledger | false | unverifiable | status |
|---|---:|---:|---|
| audit/docs/consent.md | 33 | 6 | done |
| audit/for/compatibility.md | 16 | 33 | todo |
| audit/docs/enterprise-blueprints.md | 24 | 0 | todo |
| audit/pages/privacy.md | 11 | 37 | todo |
| audit/docs/cli-reference.md | 21 | 6 | done |
| audit/docs/enterprise-identity.md | 22 | 0 | todo |
| audit/blog/enterprise-production-complete-identity-directory-audit-export.md | 0 | 62 | todo |
| audit/for/setups/[slug].md | 0 | 56 | todo |
| audit/blog/zero-dependency-encryption-x25519-aes-gcm.md | 15 | 9 | todo |
| audit/blog/github-com-alternatives-6.md | 3 | 43 | todo |
| audit/docs/service-agents.md | 16 | 0 | todo |
| audit/blog/lightweight-swarm-communication-drones-robots.md | 9 | 20 | todo |
| audit/docs/tags.md | 15 | 2 | todo |
| audit/docs/gateway.md | 15 | 1 | todo |
| audit/blog/benchmarking-http-vs-udp-overlay.md | 4 | 32 | todo |
| audit/blog/secure-ai-agent-communication-zero-trust.md | 4 | 30 | todo |
| audit/docs/comparison-networking.md | 13 | 3 | done |
| audit/blog/contributing-codebase-tour.md | 9 | 14 | todo |
| audit/blog/emergent-trust-networks-agents-choose-peers.md | 1 | 37 | todo |
| audit/blog/openanp-ai-alternatives-6.md | 1 | 34 | todo |
| audit/blog/nat-traversal-ai-agents-deep-dive.md | 8 | 12 | todo |
| audit/docs/comparison.md | 10 | 6 | done |
| audit/blog/secure-ai-agent-networking-workflow-step-by-step.md | 0 | 35 | todo |
| audit/blog/build-ai-agent-marketplace-discovery-reputation.md | 6 | 16 | todo |
| audit/blog/build-multi-agent-network-five-minutes.md | 11 | 1 | todo |
| audit/blog/distributed-monitoring-without-prometheus.md | 5 | 19 | todo |
| audit/blog/how-626-agents-autonomously-adopted-pilot.md | 0 | 33 | todo |
| audit/blog/pilot-vs-tcp-grpc-nats-comparison.md | 3 | 24 | todo |
| audit/pages/for-p2p.md | 9 | 6 | todo |
| audit/blog/decentralized-networking-p2p-solutions-ai-architectures.md | 2 | 26 | todo |
| audit/blog/replace-webhooks-with-persistent-agent-tunnels.md | 7 | 11 | todo |
| audit/blog/private-agent-network-company.md | 7 | 10 | todo |
| audit/blog/build-agent-swarm-self-organizes.md | 7 | 9 | todo |
| audit/blog/connect-agents-across-aws-gcp-azure-without-vpn.md | 3 | 21 | todo |
| audit/blog/encrypted-data-exchange-for-decentralized-ai-systems.md | 6 | 11 | todo |
| audit/blog/build-openclaw-agent-self-organizes-pilot.md | 7 | 5 | todo |
| audit/blog/cloud-networking-secure-peer-to-peer-distributed-ai.md | 6 | 8 | todo |
| audit/blog/mcp-plus-pilot-tools-and-network.md | 7 | 5 | todo |
| audit/blog/openclaw-agents-behind-nat-zero-config.md | 4 | 14 | todo |
| audit/blog/replace-message-broker-twelve-lines-go.md | 6 | 8 | todo |
| audit/blog/run-agent-network-without-cloud-dependency.md | 4 | 13 | todo |
| audit/pages/cookies.md | 7 | 4 | todo |
| audit/pages/publish.md | 3 | 16 | todo |
| audit/blog/move-beyond-rest-persistent-connections-for-agents.md | 5 | 9 | todo |
| audit/blog/trust-model-agents-invisible-by-default.md | 6 | 6 | todo |
| audit/docs/enterprise-audit.md | 8 | 0 | todo |
| audit/blog/ai-agent-discovery-process-p2p-networks.md | 3 | 14 | todo |
| audit/blog/ai-agent-network-examples-secure-scalable-connectivity.md | 1 | 20 | todo |
| audit/blog/cross-company-agent-collaboration-without-shared-infrastructure.md | 5 | 8 | todo |
| audit/blog/how-pilot-protocol-works.md | 5 | 8 | todo |
| audit/blog/preferential-attachment-ai-networks-trust-graph.md | 0 | 23 | todo |
| audit/docs/app-store.md | 7 | 2 | done |
| audit/docs/getting-started.md | 5 | 8 | todo |
| audit/docs/python-sdk.md | 7 | 2 | todo |
| audit/for/mcp.md | 7 | 2 | todo |
| audit/blog/building-custom-pilot-skills-openclaw.md | 4 | 10 | todo |
| audit/blog/connect-ai-agents-behind-nat-without-vpn.md | 1 | 19 | todo |
| audit/blog/decentralized-communication-protocols-ai-developers.md | 0 | 22 | todo |
| audit/blog/how-mutual-trust-secures-decentralized-ai-agent-networks.md | 0 | 22 | todo |
| audit/blog/scriptorium-replace-agentic-active-research-ready-intelligence.md | 2 | 16 | todo |
| audit/blog/chain-ai-models-across-machines.md | 4 | 9 | todo |
| audit/blog/http-services-over-encrypted-overlay.md | 6 | 3 | todo |
| audit/docs/error-codes.md | 6 | 3 | todo |
| audit/docs/networks.md | 7 | 0 | todo |
| audit/docs/pubsub.md | 7 | 0 | todo |
| audit/blog/multi-agent-system-networking-guide-ai-developers.md | 2 | 14 | todo |
| audit/docs/pilot-director.md | 6 | 2 | todo |
| audit/pages/for-networks.md | 5 | 5 | todo |
| audit/blog/ai-networking-best-practices-secure-scalable-systems.md | 0 | 19 | todo |
| audit/blog/distributed-rag-without-central-knowledge-base.md | 4 | 7 | todo |
| audit/blog/smart-home-without-cloud-local-device-communication.md | 3 | 10 | todo |
| audit/docs/enterprise-rbac.md | 6 | 1 | todo |
| audit/blog/ietf-internet-draft-pilot-protocol.md | 2 | 12 | todo |
| audit/blog/legacy-protocol-integration-for-secure-distributed-ai.md | 1 | 15 | todo |
| audit/blog/multi-cloud-networking-decentralized-ai-systems.md | 1 | 15 | todo |
| audit/docs/messaging.md | 6 | 0 | todo |
| audit/blog/boarding-pilotagent-org-alternatives-3.md | 0 | 17 | todo |
| audit/blog/direct-communication-protocols-ai-agents-guide.md | 3 | 8 | todo |
| audit/blog/enterprise-phase-3-rbac-policies-audit-fleet.md | 4 | 5 | todo |
| audit/blog/federated-learning-p2p-communication.md | 1 | 14 | todo |
| audit/blog/peer-to-peer-file-transfer-agents.md | 5 | 2 | todo |
| audit/blog/secure-research-collaboration-share-models-not-data.md | 4 | 5 | todo |
| audit/blog/a2a-agent-cards-over-pilot-tunnels.md | 4 | 4 | todo |
| audit/blog/encryption-protocols-for-secure-ai-systems-a-practical-guide.md | 1 | 13 | todo |
| audit/blog/sociology-of-machines-626-agents.md | 3 | 7 | todo |
| audit/blog/connecting-mcp-servers-across-agents.md | 2 | 9 | todo |
| audit/blog/network-security-for-multi-agent-systems-key-strategies.md | 1 | 12 | todo |
| audit/blog/scaling-openclaw-fleets-thousands-agents.md | 1 | 12 | todo |
| audit/docs/concepts.md | 5 | 0 | todo |
| audit/docs/diagnostics.md | 5 | 0 | todo |
| audit/docs/webhooks.md | 5 | 0 | todo |
| audit/blog/agent-communication-security-best-practices.md | 4 | 2 | todo |
| audit/blog/clawhub-to-live-network-openclaw-discovery.md | 2 | 8 | todo |
| audit/blog/how-ai-agents-discover-each-other.md | 2 | 8 | todo |
| audit/blog/trustless-protocols-that-secure-decentralized-ai-systems.md | 0 | 14 | todo |
| audit/blog/userspace-tcp-over-udp-stack-pure-go.md | 3 | 5 | todo |
| audit/blog/virtual-network-addresses-for-secure-decentralized-ai.md | 2 | 8 | todo |
| audit/blog/why-ai-agents-need-network-stack.md | 2 | 8 | todo |
| audit/blog/aegis-agent-firewall-prompt-injection.md | 4 | 1 | todo |
| audit/docs/configuration.md | 4 | 1 | todo |
| audit/blog/autonomous-agent-networking-distributed-ai.md | 0 | 12 | todo |
| audit/blog/enterprise-private-networks-roadmap.md | 1 | 9 | todo |
| audit/blog/hipaa-compliant-agent-communication.md | 2 | 6 | todo |
| audit/blog/ietf-internet-drafts-pilot-protocol-revision-01.md | 1 | 9 | todo |
| audit/blog/multi-agent-pipelines-openclaw-encrypted-tunnels.md | 3 | 3 | todo |
| audit/blog/openclaw-meets-pilot-agent-networking-one-command.md | 3 | 3 | todo |
| audit/blog/overlay-networking-automation-secure-ai-agent-solutions.md | 0 | 12 | todo |
| audit/blog/overlay-networking-secure-ai-agent-communication-explained.md | 0 | 12 | todo |
| audit/blog/peer-to-peer-networking-examples-ai-engineers.md | 2 | 6 | todo |
| audit/blog/persistent-address-strategies-for-distributed-ai-systems.md | 1 | 9 | todo |
| audit/blog/protocol-wrapping-secure-peer-to-peer-ai-systems.md | 0 | 12 | todo |
| audit/blog/python-sdk-pilot-protocol.md | 3 | 3 | todo |
| audit/docs/integration.md | 4 | 0 | todo |
| audit/apps/[id].md | 3 | 2 | todo |
| audit/blog/overlay-network-ai-agents.md | 3 | 2 | todo |
| audit/blog/why-autonomous-agents-need-private-discovery.md | 0 | 11 | todo |
| audit/pages/index.md | 2 | 5 | todo |
| audit/blog/advanced-network-automation-tips-secure-ai-systems.md | 2 | 4 | todo |
| audit/blog/claude-agent-teams-over-pilot.md | 2 | 4 | todo |
| audit/blog/peer-to-peer-agent-communication-no-server.md | 2 | 4 | todo |
| audit/docs/firewalls.md | 2 | 4 | todo |
| audit/docs/mcp-setup.md | 3 | 1 | todo |
| audit/blog/ai-networking-challenges-decentralized-systems.md | 0 | 9 | todo |
| audit/blog/network-tunnels-ai-secure-communication-autonomous-agents.md | 0 | 9 | todo |
| audit/docs/enterprise-policies.md | 3 | 0 | todo |
| audit/docs/research.md | 3 | 0 | todo |
| audit/docs/sdk-parity.md | 3 | 0 | todo |
| audit/docs/services.md | 3 | 0 | todo |
| audit/pages/terms.md | 2 | 3 | todo |
| audit/blog/persistent-network-addressing-secure-ai-systems.md | 1 | 5 | todo |
| audit/blog/pilot-vs-tailscale-nebula-zerotier-ai-agents.md | 2 | 2 | todo |
| audit/blog/trust-network-protocols-secure-decentralized-systems.md | 0 | 8 | todo |
| audit/docs/troubleshooting.md | 2 | 2 | todo |
| audit/blog/private-networks-now-in-testing.md | 0 | 7 | todo |
| audit/pages/plans.md | 0 | 7 | todo |
| audit/blog/ai-networking-terminology-a2a-mcp-anp-protocols.md | 0 | 6 | todo |
| audit/blog/encrypted-tunnel-advantages-peer-to-peer-ai-networks.md | 0 | 6 | todo |
| audit/blog/index.md | 2 | 0 | todo |
| audit/blog/secure-network-infrastructure-ai-agents-practical-guide.md | 0 | 6 | todo |
| audit/blog/securing-ai-agent-networks-multi-cloud-environments.md | 0 | 6 | todo |
| audit/blog/why-direct-p2p-connections-power-secure-ai-networking.md | 0 | 6 | todo |
| audit/docs/enterprise.md | 2 | 0 | todo |
| audit/docs/go-sdk.md | 2 | 0 | todo |
| audit/pages/app-store.md | 1 | 3 | todo |
| audit/blog/persistent-addresses-distributed-autonomous-systems.md | 0 | 5 | todo |
| audit/blog/secure-communication-protocols-distributed-ai-systems.md | 1 | 2 | todo |
| audit/blog/what-is-protocol-overlay-fundamentals-practical.md | 0 | 5 | todo |
| audit/blog/why-secure-direct-p2p-connections-matter-for-ai-agents.md | 0 | 5 | todo |
| audit/pages/aup.md | 0 | 4 | todo |
| audit/blog/build-agent-app-turn-api-into-tool.md | 0 | 3 | todo |
| audit/blog/enterprise-identity-integration-pilot-protocol.md | 0 | 3 | todo |
| audit/docs/node-sdk.md | 1 | 0 | todo |
| audit/for/skills.md | 1 | 0 | todo |
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
