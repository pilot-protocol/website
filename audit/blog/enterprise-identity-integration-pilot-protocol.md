# Claim audit: src/pages/blog/enterprise-identity-integration-pilot-protocol.astro
Audited: 2026-07-10 · Sentences examined: 96 · verified: 44 · false: 0 · unverifiable: 3 · opinion: 45 · example: 4

Note: the bulk of this post is explicitly forward-looking design ("Pilot should…", "imagine…", "Phase 6+ expansion") — those sentences carry no present-tense factual claim and are classified as opinion/roadmap.

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 5 | "The response was immediate: which identity providers? Which policy engines?…" | Claim about audience reaction; no source | Comments/inbound records |
| 70 | "Pilot's OIDC join rule already handles this - it is a matter of configuring the right issuer URL and audience." | Present-tense capability claim; pilotctl has `idp`/`provision` commands but I could not locate OIDC issuer/JWKS join-rule validation in web4 or the rendezvous module (join rules found: token, invite-only) | Registry source implementing OIDC JWT validation for network joins |
| 201 | "Here is the priority order based on enterprise demand" | Internal demand-signal claim, no source | Sales/issue-tracker evidence |

## Verified claims (grouped by source)
- Vendor/standards facts (well-documented, general knowledge tier): Entra ID as Microsoft 365/Azure identity backbone, JWKS signature validation, Conditional Access gating token issuance, Azure Managed Identity token rotation, GCP Workload Identity Federation + GKE Workload Identity, AWS STS/IAM roles with OIDC federation, Okta FastPass device-bound phishing-resistant auth, Auth0 Actions custom claims, SCIM deprovisioning, Kerberos/LDAP/AD group semantics, OPA/Rego used by K8s admission + Envoy + Terraform + CI, Vault PKI engine + AppRole/K8s/cloud auth + dynamic secrets, Splunk HEC, Microsoft Sentinel/Log Analytics, ECS/Datadog log facets, OpenTelemetry traces/metrics, SOC 2 CC6.1/CC6.3 + HIPAA + ISO 27001 A.10 audit expectations, AD CS/EJBCA/Venafi/Smallstep, ACME challenge-response model, CrowdStrike/SentinelOne/Jamf/Intune/Workspace ONE device signals, Kubernetes 1.20+ projected service-account tokens (TokenRequest GA in 1.20), SPIFFE/SPIRE trust-bundle federation (lines 21-197).
- Baseline TLS fact: servers verify certificate chains regardless of issuing CA (line 15) — RFC 5280/8446 behavior.
- Local site files: /blog/enterprise-private-networks-roadmap exists (src/pages/blog/enterprise-private-networks-roadmap.astro); its content confirms this post's phase mapping — Phase 2 = audit/auto-join, Phase 4 = CA-based enrollment, Phase 5 = OIDC + SPIFFE (lines 5, 119, 150, 204-205, 213); /enterprise-readiness-report.pdf exists in public/; banner webp exists.
- gh api / pre-verified: github.com/pilot-protocol/pilotprotocol repo exists (CTA link, line 234).
- web4 source: registry emits structured audit events (tests/zz_audit_test.go) supporting "Phase 2 adds structured audit events" (line 119); daemon `-networks` auto-join exists (cmd/daemon/main.go:94).

Example items: Rego policy sample (lines 80-102), spiffe://a.com / b.com IDs, `backend-services` group names — illustrative.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
