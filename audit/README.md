# Website claim audit — sentence-level ledger

Run: 2026-07-10 · 87 auditor agents · every user-visible sentence validated against: web4 Go source, pinned module caches (skillinject@v0.2.3 / common@v0.5.0 / protocol@v1.10.5), release/install.sh, live HTTP endpoints, GitHub API, and local site files. One ledger per page in this directory.

**Totals:** 16,608 sentences examined · 11,054 verified · **627 FALSE** · **1,466 UNVERIFIABLE** (remainder: opinion / illustrative example).

FALSE = contradicts a source (evidence in the ledger). UNVERIFIABLE = factual claim nothing available could confirm — each ledger row records what WOULD verify it.

## Pages ranked by severity (false×3 + unverifiable)

| Page | Ledger | Sentences | FALSE | Unverifiable |
|---|---|---:|---:|---:|
| docs/consent.astro | [docs/consent.md](docs/consent.md) | 170 | 33 | 6 |
| for/compatibility.astro | [for/compatibility.md](for/compatibility.md) | 140 | 16 | 33 |
| docs/enterprise-blueprints.astro | [docs/enterprise-blueprints.md](docs/enterprise-blueprints.md) | 87 | 24 | 0 |
| privacy.astro | [pages/privacy.md](pages/privacy.md) | 117 | 11 | 37 |
| docs/cli-reference.astro | [docs/cli-reference.md](docs/cli-reference.md) | 319 | 21 | 6 |
| docs/enterprise-identity.astro | [docs/enterprise-identity.md](docs/enterprise-identity.md) | 106 | 22 | 0 |
| blog/enterprise-production-complete-identity-directory-audit-export.astro | [blog/enterprise-production-complete-identity-directory-audit-export.md](blog/enterprise-production-complete-identity-directory-audit-export.md) | 118 | 0 | 62 |
| for/setups/[slug].astro | [for/setups/[slug].md](for/setups/[slug].md) | 2370 | 0 | 56 |
| blog/zero-dependency-encryption-x25519-aes-gcm.astro | [blog/zero-dependency-encryption-x25519-aes-gcm.md](blog/zero-dependency-encryption-x25519-aes-gcm.md) | 96 | 15 | 9 |
| blog/github-com-alternatives-6.astro | [blog/github-com-alternatives-6.md](blog/github-com-alternatives-6.md) | 121 | 3 | 43 |
| docs/service-agents.astro | [docs/service-agents.md](docs/service-agents.md) | 125 | 16 | 0 |
| blog/lightweight-swarm-communication-drones-robots.astro | [blog/lightweight-swarm-communication-drones-robots.md](blog/lightweight-swarm-communication-drones-robots.md) | 118 | 9 | 20 |
| docs/tags.astro | [docs/tags.md](docs/tags.md) | 87 | 15 | 2 |
| docs/gateway.astro | [docs/gateway.md](docs/gateway.md) | 81 | 15 | 1 |
| blog/benchmarking-http-vs-udp-overlay.astro | [blog/benchmarking-http-vs-udp-overlay.md](blog/benchmarking-http-vs-udp-overlay.md) | 130 | 4 | 32 |
| blog/secure-ai-agent-communication-zero-trust.astro | [blog/secure-ai-agent-communication-zero-trust.md](blog/secure-ai-agent-communication-zero-trust.md) | 95 | 4 | 30 |
| docs/comparison-networking.astro | [docs/comparison-networking.md](docs/comparison-networking.md) | 144 | 13 | 3 |
| blog/contributing-codebase-tour.astro | [blog/contributing-codebase-tour.md](blog/contributing-codebase-tour.md) | 122 | 9 | 14 |
| blog/emergent-trust-networks-agents-choose-peers.astro | [blog/emergent-trust-networks-agents-choose-peers.md](blog/emergent-trust-networks-agents-choose-peers.md) | 62 | 1 | 37 |
| blog/openanp-ai-alternatives-6.astro | [blog/openanp-ai-alternatives-6.md](blog/openanp-ai-alternatives-6.md) | 140 | 1 | 34 |
| blog/nat-traversal-ai-agents-deep-dive.astro | [blog/nat-traversal-ai-agents-deep-dive.md](blog/nat-traversal-ai-agents-deep-dive.md) | 102 | 8 | 12 |
| docs/comparison.astro | [docs/comparison.md](docs/comparison.md) | 184 | 10 | 6 |
| blog/secure-ai-agent-networking-workflow-step-by-step.astro | [blog/secure-ai-agent-networking-workflow-step-by-step.md](blog/secure-ai-agent-networking-workflow-step-by-step.md) | 85 | 0 | 35 |
| blog/build-ai-agent-marketplace-discovery-reputation.astro | [blog/build-ai-agent-marketplace-discovery-reputation.md](blog/build-ai-agent-marketplace-discovery-reputation.md) | 92 | 6 | 16 |
| blog/build-multi-agent-network-five-minutes.astro | [blog/build-multi-agent-network-five-minutes.md](blog/build-multi-agent-network-five-minutes.md) | 72 | 11 | 1 |
| blog/distributed-monitoring-without-prometheus.astro | [blog/distributed-monitoring-without-prometheus.md](blog/distributed-monitoring-without-prometheus.md) | 108 | 5 | 19 |
| blog/how-626-agents-autonomously-adopted-pilot.astro | [blog/how-626-agents-autonomously-adopted-pilot.md](blog/how-626-agents-autonomously-adopted-pilot.md) | 62 | 0 | 33 |
| blog/pilot-vs-tcp-grpc-nats-comparison.astro | [blog/pilot-vs-tcp-grpc-nats-comparison.md](blog/pilot-vs-tcp-grpc-nats-comparison.md) | 138 | 3 | 24 |
| for/p2p.astro | [pages/for-p2p.md](pages/for-p2p.md) | 85 | 9 | 6 |
| blog/decentralized-networking-p2p-solutions-ai-architectures.astro | [blog/decentralized-networking-p2p-solutions-ai-architectures.md](blog/decentralized-networking-p2p-solutions-ai-architectures.md) | 104 | 2 | 26 |
| blog/replace-webhooks-with-persistent-agent-tunnels.astro | [blog/replace-webhooks-with-persistent-agent-tunnels.md](blog/replace-webhooks-with-persistent-agent-tunnels.md) | 78 | 7 | 11 |
| blog/private-agent-network-company.astro | [blog/private-agent-network-company.md](blog/private-agent-network-company.md) | 96 | 7 | 10 |
| blog/build-agent-swarm-self-organizes.astro | [blog/build-agent-swarm-self-organizes.md](blog/build-agent-swarm-self-organizes.md) | 96 | 7 | 9 |
| blog/connect-agents-across-aws-gcp-azure-without-vpn.astro | [blog/connect-agents-across-aws-gcp-azure-without-vpn.md](blog/connect-agents-across-aws-gcp-azure-without-vpn.md) | 112 | 3 | 21 |
| blog/encrypted-data-exchange-for-decentralized-ai-systems.astro | [blog/encrypted-data-exchange-for-decentralized-ai-systems.md](blog/encrypted-data-exchange-for-decentralized-ai-systems.md) | 118 | 6 | 11 |
| blog/build-openclaw-agent-self-organizes-pilot.astro | [blog/build-openclaw-agent-self-organizes-pilot.md](blog/build-openclaw-agent-self-organizes-pilot.md) | 62 | 7 | 5 |
| blog/cloud-networking-secure-peer-to-peer-distributed-ai.astro | [blog/cloud-networking-secure-peer-to-peer-distributed-ai.md](blog/cloud-networking-secure-peer-to-peer-distributed-ai.md) | 85 | 6 | 8 |
| blog/mcp-plus-pilot-tools-and-network.astro | [blog/mcp-plus-pilot-tools-and-network.md](blog/mcp-plus-pilot-tools-and-network.md) | 84 | 7 | 5 |
| blog/openclaw-agents-behind-nat-zero-config.astro | [blog/openclaw-agents-behind-nat-zero-config.md](blog/openclaw-agents-behind-nat-zero-config.md) | 62 | 4 | 14 |
| blog/replace-message-broker-twelve-lines-go.astro | [blog/replace-message-broker-twelve-lines-go.md](blog/replace-message-broker-twelve-lines-go.md) | 72 | 6 | 8 |
| blog/run-agent-network-without-cloud-dependency.astro | [blog/run-agent-network-without-cloud-dependency.md](blog/run-agent-network-without-cloud-dependency.md) | 86 | 4 | 13 |
| cookies.astro | [pages/cookies.md](pages/cookies.md) | 52 | 7 | 4 |
| publish.astro | [pages/publish.md](pages/publish.md) | 96 | 3 | 16 |
| blog/move-beyond-rest-persistent-connections-for-agents.astro | [blog/move-beyond-rest-persistent-connections-for-agents.md](blog/move-beyond-rest-persistent-connections-for-agents.md) | 102 | 5 | 9 |
| blog/trust-model-agents-invisible-by-default.astro | [blog/trust-model-agents-invisible-by-default.md](blog/trust-model-agents-invisible-by-default.md) | 108 | 6 | 6 |
| docs/enterprise-audit.astro | [docs/enterprise-audit.md](docs/enterprise-audit.md) | 78 | 8 | 0 |
| blog/ai-agent-discovery-process-p2p-networks.astro | [blog/ai-agent-discovery-process-p2p-networks.md](blog/ai-agent-discovery-process-p2p-networks.md) | 104 | 3 | 14 |
| blog/ai-agent-network-examples-secure-scalable-connectivity.astro | [blog/ai-agent-network-examples-secure-scalable-connectivity.md](blog/ai-agent-network-examples-secure-scalable-connectivity.md) | 110 | 1 | 20 |
| blog/cross-company-agent-collaboration-without-shared-infrastructure.astro | [blog/cross-company-agent-collaboration-without-shared-infrastructure.md](blog/cross-company-agent-collaboration-without-shared-infrastructure.md) | 108 | 5 | 8 |
| blog/how-pilot-protocol-works.astro | [blog/how-pilot-protocol-works.md](blog/how-pilot-protocol-works.md) | 96 | 5 | 8 |
| blog/preferential-attachment-ai-networks-trust-graph.astro | [blog/preferential-attachment-ai-networks-trust-graph.md](blog/preferential-attachment-ai-networks-trust-graph.md) | 42 | 0 | 23 |
| docs/app-store.astro | [docs/app-store.md](docs/app-store.md) | 141 | 7 | 2 |
| docs/getting-started.astro | [docs/getting-started.md](docs/getting-started.md) | 96 | 5 | 8 |
| docs/python-sdk.astro | [docs/python-sdk.md](docs/python-sdk.md) | 110 | 7 | 2 |
| for/mcp.astro | [for/mcp.md](for/mcp.md) | 58 | 7 | 2 |
| blog/building-custom-pilot-skills-openclaw.astro | [blog/building-custom-pilot-skills-openclaw.md](blog/building-custom-pilot-skills-openclaw.md) | 58 | 4 | 10 |
| blog/connect-ai-agents-behind-nat-without-vpn.astro | [blog/connect-ai-agents-behind-nat-without-vpn.md](blog/connect-ai-agents-behind-nat-without-vpn.md) | 96 | 1 | 19 |
| blog/decentralized-communication-protocols-ai-developers.astro | [blog/decentralized-communication-protocols-ai-developers.md](blog/decentralized-communication-protocols-ai-developers.md) | 96 | 0 | 22 |
| blog/how-mutual-trust-secures-decentralized-ai-agent-networks.astro | [blog/how-mutual-trust-secures-decentralized-ai-agent-networks.md](blog/how-mutual-trust-secures-decentralized-ai-agent-networks.md) | 88 | 0 | 22 |
| blog/scriptorium-replace-agentic-active-research-ready-intelligence.astro | [blog/scriptorium-replace-agentic-active-research-ready-intelligence.md](blog/scriptorium-replace-agentic-active-research-ready-intelligence.md) | 45 | 2 | 16 |
| blog/chain-ai-models-across-machines.astro | [blog/chain-ai-models-across-machines.md](blog/chain-ai-models-across-machines.md) | 85 | 4 | 9 |
| blog/http-services-over-encrypted-overlay.astro | [blog/http-services-over-encrypted-overlay.md](blog/http-services-over-encrypted-overlay.md) | 78 | 6 | 3 |
| docs/error-codes.astro | [docs/error-codes.md](docs/error-codes.md) | 125 | 6 | 3 |
| docs/networks.astro | [docs/networks.md](docs/networks.md) | 158 | 7 | 0 |
| docs/pubsub.astro | [docs/pubsub.md](docs/pubsub.md) | 96 | 7 | 0 |
| blog/multi-agent-system-networking-guide-ai-developers.astro | [blog/multi-agent-system-networking-guide-ai-developers.md](blog/multi-agent-system-networking-guide-ai-developers.md) | 74 | 2 | 14 |
| docs/pilot-director.astro | [docs/pilot-director.md](docs/pilot-director.md) | 42 | 6 | 2 |
| for/networks.astro | [pages/for-networks.md](pages/for-networks.md) | 79 | 5 | 5 |
| blog/ai-networking-best-practices-secure-scalable-systems.astro | [blog/ai-networking-best-practices-secure-scalable-systems.md](blog/ai-networking-best-practices-secure-scalable-systems.md) | 102 | 0 | 19 |
| blog/distributed-rag-without-central-knowledge-base.astro | [blog/distributed-rag-without-central-knowledge-base.md](blog/distributed-rag-without-central-knowledge-base.md) | 88 | 4 | 7 |
| blog/smart-home-without-cloud-local-device-communication.astro | [blog/smart-home-without-cloud-local-device-communication.md](blog/smart-home-without-cloud-local-device-communication.md) | 112 | 3 | 10 |
| docs/enterprise-rbac.astro | [docs/enterprise-rbac.md](docs/enterprise-rbac.md) | 117 | 6 | 1 |
| blog/ietf-internet-draft-pilot-protocol.astro | [blog/ietf-internet-draft-pilot-protocol.md](blog/ietf-internet-draft-pilot-protocol.md) | 64 | 2 | 12 |
| blog/legacy-protocol-integration-for-secure-distributed-ai.astro | [blog/legacy-protocol-integration-for-secure-distributed-ai.md](blog/legacy-protocol-integration-for-secure-distributed-ai.md) | 96 | 1 | 15 |
| blog/multi-cloud-networking-decentralized-ai-systems.astro | [blog/multi-cloud-networking-decentralized-ai-systems.md](blog/multi-cloud-networking-decentralized-ai-systems.md) | 88 | 1 | 15 |
| docs/messaging.astro | [docs/messaging.md](docs/messaging.md) | 77 | 6 | 0 |
| blog/boarding-pilotagent-org-alternatives-3.astro | [blog/boarding-pilotagent-org-alternatives-3.md](blog/boarding-pilotagent-org-alternatives-3.md) | 88 | 0 | 17 |
| blog/direct-communication-protocols-ai-agents-guide.astro | [blog/direct-communication-protocols-ai-agents-guide.md](blog/direct-communication-protocols-ai-agents-guide.md) | 102 | 3 | 8 |
| blog/enterprise-phase-3-rbac-policies-audit-fleet.astro | [blog/enterprise-phase-3-rbac-policies-audit-fleet.md](blog/enterprise-phase-3-rbac-policies-audit-fleet.md) | 102 | 4 | 5 |
| blog/federated-learning-p2p-communication.astro | [blog/federated-learning-p2p-communication.md](blog/federated-learning-p2p-communication.md) | 68 | 1 | 14 |
| blog/peer-to-peer-file-transfer-agents.astro | [blog/peer-to-peer-file-transfer-agents.md](blog/peer-to-peer-file-transfer-agents.md) | 105 | 5 | 2 |
| blog/secure-research-collaboration-share-models-not-data.astro | [blog/secure-research-collaboration-share-models-not-data.md](blog/secure-research-collaboration-share-models-not-data.md) | 110 | 4 | 5 |
| blog/a2a-agent-cards-over-pilot-tunnels.astro | [blog/a2a-agent-cards-over-pilot-tunnels.md](blog/a2a-agent-cards-over-pilot-tunnels.md) | 72 | 4 | 4 |
| blog/encryption-protocols-for-secure-ai-systems-a-practical-guide.astro | [blog/encryption-protocols-for-secure-ai-systems-a-practical-guide.md](blog/encryption-protocols-for-secure-ai-systems-a-practical-guide.md) | 94 | 1 | 13 |
| blog/sociology-of-machines-626-agents.astro | [blog/sociology-of-machines-626-agents.md](blog/sociology-of-machines-626-agents.md) | 62 | 3 | 7 |
| blog/connecting-mcp-servers-across-agents.astro | [blog/connecting-mcp-servers-across-agents.md](blog/connecting-mcp-servers-across-agents.md) | 76 | 2 | 9 |
| blog/network-security-for-multi-agent-systems-key-strategies.astro | [blog/network-security-for-multi-agent-systems-key-strategies.md](blog/network-security-for-multi-agent-systems-key-strategies.md) | 115 | 1 | 12 |
| blog/scaling-openclaw-fleets-thousands-agents.astro | [blog/scaling-openclaw-fleets-thousands-agents.md](blog/scaling-openclaw-fleets-thousands-agents.md) | 40 | 1 | 12 |
| docs/concepts.astro | [docs/concepts.md](docs/concepts.md) | 81 | 5 | 0 |
| docs/diagnostics.astro | [docs/diagnostics.md](docs/diagnostics.md) | 37 | 5 | 0 |
| docs/webhooks.astro | [docs/webhooks.md](docs/webhooks.md) | 96 | 5 | 0 |
| blog/agent-communication-security-best-practices.astro | [blog/agent-communication-security-best-practices.md](blog/agent-communication-security-best-practices.md) | 64 | 4 | 2 |
| blog/clawhub-to-live-network-openclaw-discovery.astro | [blog/clawhub-to-live-network-openclaw-discovery.md](blog/clawhub-to-live-network-openclaw-discovery.md) | 70 | 2 | 8 |
| blog/how-ai-agents-discover-each-other.astro | [blog/how-ai-agents-discover-each-other.md](blog/how-ai-agents-discover-each-other.md) | 102 | 2 | 8 |
| blog/trustless-protocols-that-secure-decentralized-ai-systems.astro | [blog/trustless-protocols-that-secure-decentralized-ai-systems.md](blog/trustless-protocols-that-secure-decentralized-ai-systems.md) | 82 | 0 | 14 |
| blog/userspace-tcp-over-udp-stack-pure-go.astro | [blog/userspace-tcp-over-udp-stack-pure-go.md](blog/userspace-tcp-over-udp-stack-pure-go.md) | 58 | 3 | 5 |
| blog/virtual-network-addresses-for-secure-decentralized-ai.astro | [blog/virtual-network-addresses-for-secure-decentralized-ai.md](blog/virtual-network-addresses-for-secure-decentralized-ai.md) | 88 | 2 | 8 |
| blog/why-ai-agents-need-network-stack.astro | [blog/why-ai-agents-need-network-stack.md](blog/why-ai-agents-need-network-stack.md) | 78 | 2 | 8 |
| blog/aegis-agent-firewall-prompt-injection.astro | [blog/aegis-agent-firewall-prompt-injection.md](blog/aegis-agent-firewall-prompt-injection.md) | 62 | 4 | 1 |
| docs/configuration.astro | [docs/configuration.md](docs/configuration.md) | 113 | 4 | 1 |
| blog/autonomous-agent-networking-distributed-ai.astro | [blog/autonomous-agent-networking-distributed-ai.md](blog/autonomous-agent-networking-distributed-ai.md) | 100 | 0 | 12 |
| blog/enterprise-private-networks-roadmap.astro | [blog/enterprise-private-networks-roadmap.md](blog/enterprise-private-networks-roadmap.md) | 46 | 1 | 9 |
| blog/hipaa-compliant-agent-communication.astro | [blog/hipaa-compliant-agent-communication.md](blog/hipaa-compliant-agent-communication.md) | 96 | 2 | 6 |
| blog/ietf-internet-drafts-pilot-protocol-revision-01.astro | [blog/ietf-internet-drafts-pilot-protocol-revision-01.md](blog/ietf-internet-drafts-pilot-protocol-revision-01.md) | 72 | 1 | 9 |
| blog/multi-agent-pipelines-openclaw-encrypted-tunnels.astro | [blog/multi-agent-pipelines-openclaw-encrypted-tunnels.md](blog/multi-agent-pipelines-openclaw-encrypted-tunnels.md) | 46 | 3 | 3 |
| blog/openclaw-meets-pilot-agent-networking-one-command.astro | [blog/openclaw-meets-pilot-agent-networking-one-command.md](blog/openclaw-meets-pilot-agent-networking-one-command.md) | 55 | 3 | 3 |
| blog/overlay-networking-automation-secure-ai-agent-solutions.astro | [blog/overlay-networking-automation-secure-ai-agent-solutions.md](blog/overlay-networking-automation-secure-ai-agent-solutions.md) | 76 | 0 | 12 |
| blog/overlay-networking-secure-ai-agent-communication-explained.astro | [blog/overlay-networking-secure-ai-agent-communication-explained.md](blog/overlay-networking-secure-ai-agent-communication-explained.md) | 96 | 0 | 12 |
| blog/peer-to-peer-networking-examples-ai-engineers.astro | [blog/peer-to-peer-networking-examples-ai-engineers.md](blog/peer-to-peer-networking-examples-ai-engineers.md) | 110 | 2 | 6 |
| blog/persistent-address-strategies-for-distributed-ai-systems.astro | [blog/persistent-address-strategies-for-distributed-ai-systems.md](blog/persistent-address-strategies-for-distributed-ai-systems.md) | 118 | 1 | 9 |
| blog/protocol-wrapping-secure-peer-to-peer-ai-systems.astro | [blog/protocol-wrapping-secure-peer-to-peer-ai-systems.md](blog/protocol-wrapping-secure-peer-to-peer-ai-systems.md) | 78 | 0 | 12 |
| blog/python-sdk-pilot-protocol.astro | [blog/python-sdk-pilot-protocol.md](blog/python-sdk-pilot-protocol.md) | 54 | 3 | 3 |
| docs/integration.astro | [docs/integration.md](docs/integration.md) | 113 | 4 | 0 |
| apps/[id].astro | [apps/[id].md](apps/[id].md) | 46 | 3 | 2 |
| blog/overlay-network-ai-agents.astro | [blog/overlay-network-ai-agents.md](blog/overlay-network-ai-agents.md) | 62 | 3 | 2 |
| blog/why-autonomous-agents-need-private-discovery.astro | [blog/why-autonomous-agents-need-private-discovery.md](blog/why-autonomous-agents-need-private-discovery.md) | 52 | 0 | 11 |
| index.astro | [pages/index.md](pages/index.md) | 121 | 2 | 5 |
| blog/advanced-network-automation-tips-secure-ai-systems.astro | [blog/advanced-network-automation-tips-secure-ai-systems.md](blog/advanced-network-automation-tips-secure-ai-systems.md) | 66 | 2 | 4 |
| blog/claude-agent-teams-over-pilot.astro | [blog/claude-agent-teams-over-pilot.md](blog/claude-agent-teams-over-pilot.md) | 95 | 2 | 4 |
| blog/peer-to-peer-agent-communication-no-server.astro | [blog/peer-to-peer-agent-communication-no-server.md](blog/peer-to-peer-agent-communication-no-server.md) | 92 | 2 | 4 |
| docs/firewalls.astro | [docs/firewalls.md](docs/firewalls.md) | 69 | 2 | 4 |
| docs/mcp-setup.astro | [docs/mcp-setup.md](docs/mcp-setup.md) | 30 | 3 | 1 |
| blog/ai-networking-challenges-decentralized-systems.astro | [blog/ai-networking-challenges-decentralized-systems.md](blog/ai-networking-challenges-decentralized-systems.md) | 118 | 0 | 9 |
| blog/network-tunnels-ai-secure-communication-autonomous-agents.astro | [blog/network-tunnels-ai-secure-communication-autonomous-agents.md](blog/network-tunnels-ai-secure-communication-autonomous-agents.md) | 95 | 0 | 9 |
| docs/enterprise-policies.astro | [docs/enterprise-policies.md](docs/enterprise-policies.md) | 49 | 3 | 0 |
| docs/research.astro | [docs/research.md](docs/research.md) | 77 | 3 | 0 |
| docs/sdk-parity.astro | [docs/sdk-parity.md](docs/sdk-parity.md) | 65 | 3 | 0 |
| docs/services.astro | [docs/services.md](docs/services.md) | 79 | 3 | 0 |
| terms.astro | [pages/terms.md](pages/terms.md) | 86 | 2 | 3 |
| blog/persistent-network-addressing-secure-ai-systems.astro | [blog/persistent-network-addressing-secure-ai-systems.md](blog/persistent-network-addressing-secure-ai-systems.md) | 104 | 1 | 5 |
| blog/pilot-vs-tailscale-nebula-zerotier-ai-agents.astro | [blog/pilot-vs-tailscale-nebula-zerotier-ai-agents.md](blog/pilot-vs-tailscale-nebula-zerotier-ai-agents.md) | 82 | 2 | 2 |
| blog/trust-network-protocols-secure-decentralized-systems.astro | [blog/trust-network-protocols-secure-decentralized-systems.md](blog/trust-network-protocols-secure-decentralized-systems.md) | 74 | 0 | 8 |
| docs/troubleshooting.astro | [docs/troubleshooting.md](docs/troubleshooting.md) | 108 | 2 | 2 |
| blog/private-networks-now-in-testing.astro | [blog/private-networks-now-in-testing.md](blog/private-networks-now-in-testing.md) | 40 | 0 | 7 |
| plans.astro | [pages/plans.md](pages/plans.md) | 85 | 0 | 7 |
| blog/ai-networking-terminology-a2a-mcp-anp-protocols.astro | [blog/ai-networking-terminology-a2a-mcp-anp-protocols.md](blog/ai-networking-terminology-a2a-mcp-anp-protocols.md) | 95 | 0 | 6 |
| blog/encrypted-tunnel-advantages-peer-to-peer-ai-networks.astro | [blog/encrypted-tunnel-advantages-peer-to-peer-ai-networks.md](blog/encrypted-tunnel-advantages-peer-to-peer-ai-networks.md) | 88 | 0 | 6 |
| blog/index.astro | [blog/index.md](blog/index.md) | 21 | 2 | 0 |
| blog/secure-network-infrastructure-ai-agents-practical-guide.astro | [blog/secure-network-infrastructure-ai-agents-practical-guide.md](blog/secure-network-infrastructure-ai-agents-practical-guide.md) | 90 | 0 | 6 |
| blog/securing-ai-agent-networks-multi-cloud-environments.astro | [blog/securing-ai-agent-networks-multi-cloud-environments.md](blog/securing-ai-agent-networks-multi-cloud-environments.md) | 88 | 0 | 6 |
| blog/why-direct-p2p-connections-power-secure-ai-networking.astro | [blog/why-direct-p2p-connections-power-secure-ai-networking.md](blog/why-direct-p2p-connections-power-secure-ai-networking.md) | 78 | 0 | 6 |
| docs/enterprise.astro | [docs/enterprise.md](docs/enterprise.md) | 58 | 2 | 0 |
| docs/go-sdk.astro | [docs/go-sdk.md](docs/go-sdk.md) | 92 | 2 | 0 |
| app-store.astro | [pages/app-store.md](pages/app-store.md) | 30 | 1 | 3 |
| blog/persistent-addresses-distributed-autonomous-systems.astro | [blog/persistent-addresses-distributed-autonomous-systems.md](blog/persistent-addresses-distributed-autonomous-systems.md) | 96 | 0 | 5 |
| blog/secure-communication-protocols-distributed-ai-systems.astro | [blog/secure-communication-protocols-distributed-ai-systems.md](blog/secure-communication-protocols-distributed-ai-systems.md) | 95 | 1 | 2 |
| blog/what-is-protocol-overlay-fundamentals-practical.astro | [blog/what-is-protocol-overlay-fundamentals-practical.md](blog/what-is-protocol-overlay-fundamentals-practical.md) | 74 | 0 | 5 |
| blog/why-secure-direct-p2p-connections-matter-for-ai-agents.astro | [blog/why-secure-direct-p2p-connections-matter-for-ai-agents.md](blog/why-secure-direct-p2p-connections-matter-for-ai-agents.md) | 86 | 0 | 5 |
| aup.astro | [pages/aup.md](pages/aup.md) | 72 | 0 | 4 |
| blog/build-agent-app-turn-api-into-tool.astro | [blog/build-agent-app-turn-api-into-tool.md](blog/build-agent-app-turn-api-into-tool.md) | 58 | 0 | 3 |
| blog/enterprise-identity-integration-pilot-protocol.astro | [blog/enterprise-identity-integration-pilot-protocol.md](blog/enterprise-identity-integration-pilot-protocol.md) | 96 | 0 | 3 |
| docs/node-sdk.astro | [docs/node-sdk.md](docs/node-sdk.md) | 30 | 1 | 0 |
| for/skills.astro | [for/skills.md](for/skills.md) | 25 | 1 | 0 |
| publisher-agreement.astro | [pages/publisher-agreement.md](pages/publisher-agreement.md) | 99 | 0 | 3 |
| blog/secure-data-exchange-for-multi-cloud-ai-systems.astro | [blog/secure-data-exchange-for-multi-cloud-ai-systems.md](blog/secure-data-exchange-for-multi-cloud-ai-systems.md) | 92 | 0 | 2 |
| blog/web-search-api-for-ai-agents-grounded-research.astro | [blog/web-search-api-for-ai-agents-grounded-research.md](blog/web-search-api-for-ai-agents-grounded-research.md) | 56 | 0 | 2 |
| for/setups.astro | [for/setups.md](for/setups.md) | 20 | 0 | 2 |
| blog/ai-agent-app-store.astro | [blog/ai-agent-app-store.md](blog/ai-agent-app-store.md) | 88 | 0 | 1 |
| blog/build-an-agent-app.astro | [blog/build-an-agent-app.md](blog/build-an-agent-app.md) | 56 | 0 | 1 |
| docs/index.astro | [docs/index.md](docs/index.md) | 67 | 0 | 1 |
| 500.astro | [pages/500.md](pages/500.md) | 14 | 0 | 1 |
| press.astro | [pages/press.md](pages/press.md) | 68 | 0 | 1 |

**5 page(s) fully clean:** docs/motd.astro, docs/security.astro, docs/swift-sdk.astro, docs/trust.astro, 404.astro

## Worst offenders — sample flags

### docs/consent.astro — 33 false / 6 unverifiable
- 42
- "No payload beyond a timestamp and your identity signature."
- "What we receive: The app ID, the action type, and a signature from your Ed25519 key."
- "What we do not receive: … or any data about what your agent is actually doing."

### for/compatibility.astro — 16 false / 33 unverifiable
- 447–448
- k8s sidecar args: `curl … install.sh \
- macOS example: `curl -fsSL https://pilotprotocol.network/install.sh \
- `sudo curl … \

### docs/enterprise-blueprints.astro — 24 false / 0 unverifiable
- 31, 67, 111
- Step 5 "Configure audit export" / step 6 "Configure webhooks" (list is explicitly "in order")
- "Nodes must already be members of the network."
- "The result includes which actions were taken and which failed."

### privacy.astro — 11 false / 37 unverifiable
- 37
- "LAN IP address (optional) — If you enable local-network discovery, your private LAN IP is exchanged with peers on the same subnet."
- "Peer-to-peer traffic (data sent directly between agents after tunnel establishment) never touches our infrastructure."
- "Review prompts — Occasionally prompts you to leave a short review of Pilot or an app."

### docs/cli-reference.astro — 21 false / 6 unverifiable
- 65
- "If the daemon isn't running, quickstart prints the start command with a description. If it's already running, it shows a checkmark and proceeds to step 2."
- "Returns (--json): quickstart [{step, title, command, description, done}]."
- "when supplied, it persists to ~/.pilot/config.json and is not needed on subsequent starts" (--email)

### docs/enterprise-identity.astro — 22 false / 0 unverifiable
- 26
- "Each network can have its own IDP configuration, allowing different teams or environments to use different providers."
- "Returns: `valid` (bool), `claims` (the decoded JWT claims if valid), or `error` (string...)"
- "**Issued-at** (`iat`) - checked for reasonableness"

### blog/enterprise-production-complete-identity-directory-audit-export.astro — 0 false / 62 unverifiable
- "Pilot Protocol now ships 99 features across 53 protocol commands, backed by 234 tests."
- "Every feature described here is implemented, tested, and running in production on the live registry."
- Enterprise gating behavior ("Seven registry handlers enforce the enterprise gate...", RBAC init on toggle)
- IDP details: five provider types, RS256/HS256, claims validated, 60s clock skew, algorithm-confusion blocking

### blog/zero-dependency-encryption-x25519-aes-gcm.astro — 15 false / 9 unverifiable
- 58
- "the daemon uses the full 32 bytes as the AES-256-GCM key rather than truncating" and "using all of it for AES-256 avoids a truncation or key-derivation step"
- FAQ answers: "Pilot Protocol uses the full 256-bit ECDH output for AES-256-GCM" / "avoids an extra truncation or key-derivation step"
- "PILK = 0x50494C4B... 4 bytes magic + 32 bytes public key" / "Total key exchange overhead: 72 bytes (36 bytes per direction)"

### blog/github-com-alternatives-6.astro — 3 false / 43 unverifiable
- 155
- Comparison table cell: "Free tier available, Premium at $6/month"
- "Your fleet keeps operating when cloud services fail because routing and discovery are distributed."
- "Its architecture delivers unmatched scale and security" / "leading peer-to-peer network"

### docs/service-agents.astro — 16 false / 0 unverifiable
- 75
- "Use short, generic, single-word keywords … search matches tokens in agent names and descriptions, so multi-word phrases rarely improve recall."
- "the daemon transport caps each inbox reply at roughly 8–9 KB, splicing `... (truncated, N bytes total)` into the JSON value mid-stream"
- "…continuously polling the pilot inbox for incoming messages…"

### blog/lightweight-swarm-communication-drones-robots.astro — 9 false / 20 unverifiable
- 48
- `pilotctl extras set-tags swarm-member drone drone-07 survey-team-alpha`
- `pilotctl subscribe "swarm.telemetry.*"` (and `"swarm.events.*"`)
- `pilotctl subscribe "swarm.telemetry.*"` (getting-started block)

### docs/tags.astro — 15 false / 2 unverifiable
- 25
- Heading: "Search peers by tag"
- "The `--search` flag filters your connected peers by tag substring match."
- "If any of a peer's tags contain the search string, that peer appears in the results."

### docs/gateway.astro — 15 false / 1 unverifiable
- 19
- "pilotctl extras gateway … resolves it in that order."
- "To let a trusted peer reach a service running on your machine, you just run the server - no special gateway setup needed on your side."
- "# nginx, caddy, your app - anything that listens on a TCP port"

### blog/benchmarking-http-vs-udp-overlay.astro — 4 false / 32 unverifiable
- 136
- "# Connection timing (included in bench output) / # Latency histogram at 1KB, 10KB, 100KB, 1MB / # Throughput over 60-second window"
- "All benchmark tooling is included in the repository."
- "See the documentation for full setup instructions, including GCP deployment scripts for the cross-region configuration used in these tests."

