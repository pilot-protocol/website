export interface ManagedDoc {
  title: string;
  description: string;
  body: string;
}

export const managedDocs: Record<string, ManagedDoc> = {
  'managed-control-plane': {
    title: 'Hosted Agent Control Plane',
    description: 'Architecture, operating modes, security boundaries, and data flow for the optional Pilot hosted agent management and policy platform.',
    body: `<h1>Hosted agent control plane</h1>
  <p class="subtitle">An optional Pilot-hosted federation, policy, approval, monitoring, and command plane for one agent or a managed fleet.</p>

  <div class="callout"><strong>Current availability.</strong> A live pre-release deployment exists at <a href="https://management.pilotprotocol.network/v1/auth/login">management.pilotprotocol.network</a>. It is invitation-only and currently serves the preconfigured Pilot demonstration organization. Public organization signup is not available. See <a href="/docs/managed-readiness">Availability &amp; readiness</a> for the exact launch boundary.</div>

  <div class="toc"><h4>On this page</h4><ul>
    <li><a href="#contract">Product contract</a></li>
    <li><a href="#modes">Optional operating modes</a></li>
    <li><a href="#flow">Decision and evidence flow</a></li>
    <li><a href="#location">What runs where</a></li>
    <li><a href="#data">Content and data handling</a></li>
    <li><a href="#features">Feature map</a></li>
  </ul></div>

  <h2 id="contract">Product contract</h2>
  <p>The hosted control plane lets an organization describe what its agents may do, evaluate proposed actions before execution, request human or service approval, inspect actions and exchanged content, operate nodes remotely, and retain signed evidence. It is adjacent to the open Pilot node and protocol: installing Pilot does not automatically place an agent under hosted control.</p>
  <p>Four boundaries are fundamental:</p>
  <ol>
    <li>An unmanaged node continues to behave as it did before the hosted platform existed.</li>
    <li>The management service cannot expand a node's locally pinned trust, mandate, or signed policy ceiling.</li>
    <li>Semantic analysis can preserve or narrow an executable decision; it cannot turn a deterministic deny into an allow.</li>
    <li>A configured pre-hook blocks or suspends the side effect before execution. A post-hook records the observed result; it does not retroactively authorize the action.</li>
  </ol>

  <h2 id="modes">Optional operating modes</h2>
  <table><thead><tr><th>Mode</th><th>Behavior</th><th>Hosted dependency</th></tr></thead><tbody>
    <tr><td><code>off</code> / no hook</td><td>The original agent and node behavior is unchanged.</td><td>None</td></tr>
    <tr><td><code>observe</code></td><td>Selected actions are recorded without blocking them.</td><td>Optional</td></tr>
    <tr><td><code>local_enforce</code></td><td>Signed deterministic rules may deny or constrain locally.</td><td>No per-action hosted decision</td></tr>
    <tr><td><code>managed_enforce</code></td><td>Selected actions wait for the hosted deterministic, semantic, and approval path.</td><td>Required for governed actions</td></tr>
  </tbody></table>
  <p>Action interception and <code>.pilot</code> state synchronization are separate toggles. Signed fleet reporting is required for a managed adoption because it is how the service verifies the allocated node and returns typed control operations. A newly released action is not silently governed: enforcement profiles use an explicit action inventory or a visible wildcard.</p>

  <h2 id="flow">Decision and evidence flow</h2>
  <ol>
    <li>The agent harness proposes an action with its action name, target resource, risk, request body, session identity, and available context.</li>
    <li>The native pre-hook or custom SDK wrapper signs the intent with the adopted node identity and sends it to that organization's federation endpoint.</li>
    <li>The active deterministic policy establishes the maximum authority. The first matching rule wins; the mandatory fallback is deny.</li>
    <li>If an active reviewed semantic clause applies, Pilot's hosted evaluator receives the exact eligible content and may only preserve or narrow the base result.</li>
    <li>If consent is required, the action remains suspended in an expiring transaction bound to the exact intent and payload hash. A successful quorum creates a single-use continuation.</li>
    <li>The node verifies the signed result. It releases, constrains, suspends, or blocks the side effect locally.</li>
    <li>The post-hook reports the actual result. Pilot correlates intent, policy, semantic evaluation, approval, continuation, result, receipt, fleet activity, and procedure runs.</li>
  </ol>

  <h2 id="location">What runs where</h2>
  <table><thead><tr><th>Component</th><th>Location</th><th>Responsibility</th></tr></thead><tbody>
    <tr><td>Pilot node runtime</td><td>Agent host</td><td>Node identity, trust pins, signed policy, enforcement, receipts, fleet reporting, and state reconciliation.</td></tr>
    <tr><td>Harness adapter</td><td>Agent host</td><td>Optional native pre/post hooks or MCP bridge around the action boundary exposed by the harness.</td></tr>
    <tr><td>Management service</td><td>Pilot-hosted</td><td>Accounts, organizations, policies, approvals, fleet desired state, procedures, audit, evidence, monitoring, and integrations.</td></tr>
    <tr><td>Federation service</td><td>Pilot-hosted, tenant routed</td><td>Receives signed action intents and exact eligible exchange content; returns a signed narrowed decision.</td></tr>
    <tr><td>Semantic evaluator</td><td>Pilot-hosted</td><td>Evaluates only active reviewed clauses, records model/version/usage evidence, and never grants above deterministic policy.</td></tr>
  </tbody></table>

  <h2 id="data">Content and data handling</h2>
  <p>In managed enforcement, Pilot may receive the complete tool arguments, message body, explicit file-share bytes, HTTP body, transaction details, and reported result when the selected adapter exposes them. The exchange record binds exact content to the called resource, hashes, policy revision, decision, and retention metadata. Authorized operators can inspect a bounded preview and audit access to complete retained content.</p>
  <p>No hidden local semantic inspector is installed. If content must be interpreted semantically, the eligible exchange is routed through the Pilot-hosted federation boundary. With no active semantic clause, deterministic evaluation completes without a model call. Actions configured as local-only remain metadata-governed unless an adapter deliberately federates inspectable content.</p>
  <p>Private keys, enrollment seeds, account passwords, and root signing material are not rendered in the management interface. The <code>.pilot</code> state view fingerprints protected artifacts and permits mutation only for the explicitly safe, revision-checked subset.</p>

  <h2 id="features">Feature map</h2>
  <ul>
    <li><a href="/docs/managed-accounts"><strong>Accounts &amp; organizations</strong></a> — local identity, optional OIDC, roles, invitations, launch entitlements, and tenant isolation.</li>
    <li><a href="/docs/managed-agent-adoption"><strong>Agent adoption</strong></a> — one-time tenant-bound enrollment and signed first report.</li>
    <li><a href="/docs/managed-harnesses"><strong>Harness coverage</strong></a> — exact native hook boundaries and known failure modes.</li>
    <li><a href="/docs/managed-policies"><strong>Policies &amp; approvals</strong></a> — structured rules, ordinary-language statements, semantic narrowing, rollout, and consent.</li>
    <li><a href="/docs/managed-fleet"><strong>Fleet, evidence &amp; operations</strong></a> — inventory, desired state, typed commands, exchanges, procedures, audit, and integrations.</li>
    <li><a href="/docs/managed-readiness"><strong>Availability &amp; readiness</strong></a> — what works today and what still blocks general production release.</li>
  </ul>

  <div class="notice"><strong>Shared responsibility.</strong> A harness hook observes the operation proposed through that harness. It is not an operating-system reference monitor. Keep the harness sandbox, workload identity, egress policy, endpoint controls, secret management, and ordinary host hardening.</div>`,
  },

  'managed-accounts': {
    title: 'Managed Accounts and Organizations',
    description: 'Current signup availability, account lifecycle, roles, organization isolation, launch entitlements, and multi-organization behavior in Pilot hosted management.',
    body: `<h1>Accounts and organizations</h1>
  <p class="subtitle">How people, service accounts, organizations, tenants, sessions, and adopted agents are separated.</p>

  <div class="callout"><strong>Can a new user create an account today?</strong> No, not through a public self-service flow. As verified on 8 August 2026, <code>/v1/auth/signup</code> returns <code>404 {"error":"signup_unavailable"}</code>. The live login page is available, but accounts must already exist or be created through an invitation or operator-assisted provisioning path.</div>

  <div class="toc"><h4>On this page</h4><ul>
    <li><a href="#today">Access today</a></li>
    <li><a href="#intended-flow">Intended public signup flow</a></li>
    <li><a href="#isolation">Organization and tenant isolation</a></li>
    <li><a href="#multi-org">Multiple organizations</a></li>
    <li><a href="#identity">Identity and roles</a></li>
    <li><a href="#plans">Launch entitlements and metering</a></li>
    <li><a href="#lifecycle">Lifecycle boundaries</a></li>
  </ul></div>

  <h2 id="today">Access today</h2>
  <p>The deployed management service serves a preconfigured demonstration organization and supports an ordinary login flow. It is not an open registration service. A person needs a valid existing account or an unexpired, single-use invitation issued by an organization administrator. This is intentional: the development-only open signup route is forbidden in production configuration.</p>
  <p>After account creation, the first-party identity path supports local password login, password reset, logout, session inventory and revocation, TOTP multifactor authentication, recovery codes, member suspension, and optional OIDC federation. OIDC is an integration, not a prerequisite.</p>

  <h2 id="intended-flow">Intended public signup flow</h2>
  <p>The public SaaS code implements the following workflow, but that provisioner is not deployed on the live service:</p>
  <ol>
    <li>Enter a work email, organization name, workspace slug, and region.</li>
    <li>Verify the email through a short-lived signed claim.</li>
    <li>Reserve a unique organization ID, tenant ID, and account subdomain.</li>
    <li>Provision tenant signing keys, policy, storage bindings, quotas, and either pooled or dedicated placement.</li>
    <li>Create a single-use owner invitation on the tenant-scoped identity service.</li>
    <li>Create the owner password directly on the account host, then continue to agent adoption.</li>
  </ol>
  <p>No password should pass through the global signup service. It verifies and provisions the workspace, then hands the browser to the isolated account origin.</p>

  <h2 id="isolation">Organization and tenant isolation</h2>
  <p>Each authority binds one organization to one cryptographic tenant. Browser sessions obtain tenant scope from the authenticated account context; a <code>tenant_id</code> query parameter cannot switch the user into another organization. Object stores and repository keys repeat tenant ownership checks, while signed node artifacts carry the same tenant identity.</p>
  <p>Enrollment tokens, node credentials, trust bundles, policies, decisions, receipts, fleet reports, exchanges, audit records, and usage units are tenant-bound. A token issued by Organization A cannot produce an Organization B identity. Separate authority cells are the recommended hard boundary for unrelated customers; pooled placement additionally requires database- and credential-level isolation before general release.</p>

  <h2 id="multi-org">Multiple organizations</h2>
  <p>The product model supports many organizations, each with its own slug, tenant, authority, members, policies, nodes, and evidence. The current live deployment does not yet expose that public multi-organization provisioning layer.</p>
  <ul>
    <li>One adopted agent identity belongs to exactly one tenant.</li>
    <li>The default managed attachment path supports one adopted identity per operating-system user home.</li>
    <li>Separate users, containers, or isolated homes can hold separate identities on the same physical host.</li>
    <li>The installer refuses to consume a second enrollment token while a managed attachment already exists.</li>
    <li>Moving an agent between organizations requires retiring or revoking the old identity and performing a fresh adoption. A polished self-service transfer workflow is not available today.</li>
    <li>A human who belongs to multiple organizations will require an explicit organization choice or separate host-bound sessions; URL parameter substitution is never a switch mechanism.</li>
  </ul>

  <h2 id="identity">Identity and roles</h2>
  <p>Permissions separate account administration, policy writing, independent policy approval, consent voting, trust and mandate administration, fleet commands, integration management, evidence access, and audit administration. Browser mutations require a session-bound CSRF token and same-origin validation.</p>
  <table><thead><tr><th>Identity</th><th>Use</th><th>Lifecycle</th></tr></thead><tbody>
    <tr><td>Organization owner/admin</td><td>Members, roles, security configuration, and delegated administration.</td><td>Protected against removing the final administrator.</td></tr>
    <tr><td>Member</td><td>Role-scoped console and API access.</td><td>Invite, activate, suspend, reactivate, remove.</td></tr>
    <tr><td>Service account</td><td>Non-browser automation with explicit permissions.</td><td>Create, rotate API keys, disable, revoke.</td></tr>
    <tr><td>Node identity</td><td>Signs agent intents, reports, acknowledgements, results, and receipts.</td><td>Adopt, rotate, quarantine, retire, revoke, re-adopt.</td></tr>
  </tbody></table>

  <h2 id="plans">Launch entitlements and metering</h2>
  <p>Plans are disabled for the initial public launch. Every organization receives the same launch entitlement; users do not select a tier, enter payment details, see upgrade prompts, or pass through Stripe. Billing and plan-management routes must remain hidden or return a clear disabled state.</p>
  <p>Planless does not mean unbounded. Every tenant still needs hard node, request, semantic-token, storage, retention, and event limits plus rate limiting and abuse controls. Semantic/model usage is attributed by tenant, agent, evaluator, model call, and token counts through an idempotent usage ledger for cost visibility and future product decisions, but it is not invoiced.</p>
  <p>The data model may retain internal entitlement fields so plans can be introduced later without a tenant migration. Those fields are operational defaults, not a customer-visible commercial contract while plan mode is disabled. A metering or quota failure must never expand action authority.</p>

  <h2 id="lifecycle">Lifecycle boundaries</h2>
  <p>Invitations, sessions, API keys, members, and nodes have explicit terminal states rather than destructive deletion where evidence must remain verifiable. Organization rename, export, deletion, suspension, owner transfer, legal holds, final-admin protection, node revocation, subdomain cleanup, and usage-ledger closure must behave atomically before public SaaS launch. Those complete organization-lifecycle tests remain a release gate.</p>

  <div class="notice"><strong>Practical answer.</strong> Existing invited users can log in and use the deployed demonstration organization. A new unrelated company cannot yet self-register, receive its own subdomain, and adopt an agent without operator assistance.</div>`,
  },

  'managed-agent-adoption': {
    title: 'Managed Agent Adoption',
    description: 'Step-by-step managed node adoption, one-time enrollment security, optional control toggles, signed verification, and organization reassignment.',
    body: `<h1>Managed agent adoption</h1>
  <p class="subtitle">Adopt the core Pilot node first; attach a harness action boundary only when in-flight control is wanted.</p>

  <div class="toc"><h4>On this page</h4><ul>
    <li><a href="#prerequisites">Prerequisites</a></li>
    <li><a href="#workflow">Adoption workflow</a></li>
    <li><a href="#claim">What the one-time claim installs</a></li>
    <li><a href="#options">Optional controls</a></li>
    <li><a href="#verification">How Pilot verifies adoption</a></li>
    <li><a href="#move">Moving or replacing a node</a></li>
    <li><a href="#compatibility">Unmanaged compatibility</a></li>
  </ul></div>

  <h2 id="prerequisites">Prerequisites</h2>
  <ul>
    <li>An existing account in the target organization.</li>
    <li>The administrator or <code>fleet.command</code> role.</li>
    <li>A supported host for <code>pilotctl</code> and <code>pilot-daemon</code>.</li>
    <li>Outbound HTTPS access to the organization's management and federation origins.</li>
    <li>Access to the operating-system user that will own the agent runtime. Do not run the installer as root.</li>
  </ul>

  <h2 id="workflow">Adoption workflow</h2>
  <ol>
    <li>Open <strong>Connect an agent</strong> in the management console.</li>
    <li>Select the real harness that runs the agent. The selection records the expected capability boundary; it does not pretend every harness has universal interception.</li>
    <li>Enter a node display name and choose action interception and <code>.pilot</code> state synchronization. Fleet reporting is required.</li>
    <li>Select <strong>Create one-time command</strong>. Pilot allocates the agent ID server-side and returns a high-entropy claim that expires after 15 minutes and is consumed once.</li>
    <li>Run the displayed command on the agent host:</li>
  </ol>
  <pre><code>curl -fsSL https://pilotprotocol.network/install.sh | \
  PILOT_ENROLLMENT_TOKEN='&lt;one-time token&gt;' sh -s -- \
  --managed-url https://management.pilotprotocol.network</code></pre>
  <ol start="6">
    <li>If action interception is enabled, run the separate, version-pinned harness attachment command shown by the console, for example <code>npx -y pilotprotocol-mcp@0.2.13 attach --gemini</code>.</li>
    <li>Return to the waiting page. Pilot accepts completion only after the allocated identity sends a fresh signed report carrying the exact harness and onboarding-run marker.</li>
    <li>Create and activate a language policy, then attempt a real violating action. The guided flow completes only after it observes a semantic denial for that exact agent before the side effect.</li>
  </ol>
  <p>The token is a short-lived bearer secret. Do not put the generated command in tickets, chat, source control, shared shell history, process supervisors, or screenshots.</p>

  <h2 id="claim">What the one-time claim installs</h2>
  <p>The installer downloads the management-authority-pinned managed runtime, then calls <code>pilotctl enterprise adopt</code>. The service returns exactly one delegated node identity plus the public root pin, signed trust bundle, signed bootstrap policy, organization endpoints, adoption options, and run identity. The browser never creates a node key.</p>
  <p>The client verifies that the credential, key, trust bundle, policy, tenant, agent ID, and HTTPS authority origins agree. It then atomically writes an owner-only attachment under <code>$HOME/.pilot/managed/</code>:</p>
  <ul>
    <li><code>enterprise-control.json</code> — tenant, endpoints, policy paths, action inventory, rollout, reporting, and state-sync configuration;</li>
    <li><code>trust.json</code> and <code>policy.json</code> — verified signed bootstrap artifacts;</li>
    <li><code>agent.seed</code> — the delegated node seed, stored with owner-only permissions;</li>
    <li>restart-safe receipt, continuation, and state directories.</li>
  </ul>
  <p>The enrollment token is stored server-side only as a hash, consumed before private credential material is released, removed from the process environment, and never reused. Unknown, expired, and consumed tokens return the same generic error.</p>

  <h2 id="options">Optional controls</h2>
  <table><thead><tr><th>Option</th><th>When enabled</th><th>When disabled</th></tr></thead><tbody>
    <tr><td>Fleet connection</td><td>Signed health, desired state, rollout, and typed commands.</td><td>Not a managed adoption; this option is required.</td></tr>
    <tr><td>In-flight action control</td><td>Selected harness actions wait for signed hosted decisions and produce receipts.</td><td>Ordinary harness actions remain unchanged.</td></tr>
    <tr><td><code>.pilot</code> state visibility</td><td>Safe state manifests and revision-checked mutations synchronize over the fleet channel.</td><td>No state tree or remote state mutation.</td></tr>
  </tbody></table>
  <p>Core adoption installs the node runtime; it does not install <code>pilot-mcp</code>. Harness attachment is a separate opt-in integration that reads the existing managed attachment. See <a href="/docs/managed-harnesses">Harness coverage</a>.</p>

  <h2 id="verification">How Pilot verifies adoption</h2>
  <p>The console does not trust a client-side success message. It checks:</p>
  <ul>
    <li>the report signature against the exact delegated key in tenant trust;</li>
    <li>the server-allocated agent ID;</li>
    <li>the exact harness and one-time onboarding run marker;</li>
    <li>a fresh observation time after the command was issued;</li>
    <li>the policy revision the node reports as active;</li>
    <li>for the guided proof, a durable hosted exchange with a semantic-clause denial for the same agent.</li>
  </ul>

  <h2 id="move">Moving or replacing a node</h2>
  <p>A managed identity is not portable between organizations. The installer deliberately refuses a new enrollment token when <code>$HOME/.pilot/managed/enterprise-control.json</code> already exists. To replace or move a node, an administrator must retire or revoke the old identity, preserve required evidence, remove the old managed attachment through an approved local decommissioning procedure, and issue a fresh organization-bound adoption. There is no public self-service cross-organization transfer workflow today.</p>
  <p>Do not copy <code>agent.seed</code> or the complete managed directory to clone a node. Each runtime instance should receive a distinct delegated identity and appear separately in fleet inventory.</p>

  <h2 id="compatibility">Unmanaged compatibility</h2>
  <p>Running the ordinary Pilot installer without <code>--managed-url</code> and without an enrollment token preserves unmanaged behavior. Installing a harness adapter without a valid owner-only managed attachment is a zero-side-effect pass-through. Disabling or removing an optional harness boundary should restore the harness's original execution path, subject to that harness's own configuration.</p>

  <div class="notice"><strong>Before calling a node governed:</strong> prove an allowed action, a denied action with no side effect, an approval that resumes only the exact request, an expired approval that stays blocked, a failed tool with terminal evidence, and the documented hook-timeout behavior.</div>`,
  },

  'managed-harnesses': {
    title: 'Managed Harness Coverage',
    description: 'Exact Pilot interception boundaries, attachment commands, failure modes, and production validation requirements for supported agent harnesses.',
    body: `<h1>Harness coverage</h1>
  <p class="subtitle">A connector is only as complete as the native action boundary its harness actually exposes.</p>

  <div class="callout"><strong>Core node management is harness-independent.</strong> Adoption, signed reporting, policy rollout, typed commands, and safe state synchronization belong to core Pilot. The optional harness adapter adds in-flight control only around the tool, message, or SDK events listed here.</div>

  <h2 id="matrix">Coverage matrix</h2>
  <table><thead><tr><th>Harness</th><th>Current boundary</th><th>Important limitation</th></tr></thead><tbody>
    <tr><td>Claude Code</td><td>Live-verified <code>PreToolUse</code>, <code>PostToolUse</code>, and failure events for built-in and MCP tools.</td><td>A Bash hook sees the proposed command, not every syscall made by its child process.</td></tr>
    <tr><td>Codex CLI</td><td>Native pre/post tool hooks plus Pilot MCP.</td><td>User hooks require review/trust; specialized hosted paths may opt out unless managed requirements cover them.</td></tr>
    <tr><td>Gemini CLI</td><td>Native <code>BeforeTool</code>/<code>AfterTool</code>; real allow, result, and denial paths exercised.</td><td>Model-request interception is separate, and identical parallel calls have limited post-call correlation.</td></tr>
    <tr><td>GitHub Copilot CLI</td><td>Local and repository <code>preToolUse</code>/<code>postToolUse</code> contracts.</td><td>Documented timeouts fail open; cloud agents need committed repository hooks and reachable ingress.</td></tr>
    <tr><td>OpenHands</td><td>Claude-compatible pre/post hooks per repository.</td><td>User-home configuration is not fleet-wide; distribute the repository contract to every workspace.</td></tr>
    <tr><td>OpenClaw</td><td>Bundled plugin for built-in tools, results, and outbound messages.</td><td>Only OpenClaw-owned paths are covered; retain sandbox and egress controls.</td></tr>
    <tr><td>Hermes Agent</td><td>Native CLI/Gateway pre/post tool hooks; pinned wire protocol verified.</td><td>Malformed output, process death, and timeout behavior requires additional containment because upstream failure modes may be fail open.</td></tr>
    <tr><td>Cline</td><td>Global <code>PreToolUse</code>/<code>PostToolUse</code> scripts for desktop and SDK-hosted tools.</td><td>Hook crashes and timeouts are documented as fail open; existing global hooks must be composed explicitly.</td></tr>
    <tr><td>Cursor</td><td>Native pre/post tool hooks with fail-closed Pilot preflights.</td><td>User hooks do not reach cloud agents; use repository, team, or enterprise distribution there.</td></tr>
    <tr><td>Continue</td><td>Pilot MCP calls plus Continue's static allow/ask/exclude permissions.</td><td>No universal external pre/post hook was found; do not claim whole-agent semantic control.</td></tr>
    <tr><td>JetBrains Junie</td><td>Pilot MCP plus Junie's action allowlist.</td><td>Native Junie actions remain outside Pilot evaluation without a supported interception API.</td></tr>
    <tr><td>PicoClaw</td><td>JSON-RPC process hooks for <code>before_tool</code>/<code>after_tool</code>.</td><td>The upstream runtime is pre-1.0. Pin and certify an exact build; it is not production-certified.</td></tr>
    <tr><td>Any MCP client</td><td>Complete arguments and results for calls to the Pilot MCP server.</td><td>Installing Pilot MCP does not intercept other MCP servers or built-in shell, browser, or file tools.</td></tr>
    <tr><td>Custom SDK host</td><td>Potentially complete <code>BeforeAction</code>/<code>AfterAction</code> wrapping around host-owned side effects.</td><td>Unwrapped adapters remain outside control; the host must attest and test the complete action inventory.</td></tr>
  </tbody></table>

  <h2 id="attach">Attach after adoption</h2>
  <p>Use the version-pinned command shown by the onboarding page. Examples:</p>
  <pre><code>npx -y pilotprotocol-mcp@0.2.13 attach --claude
npx -y pilotprotocol-mcp@0.2.13 attach --codex
npx -y pilotprotocol-mcp@0.2.13 attach --gemini
npx -y pilotprotocol-mcp@0.2.13 attach --openclaw
npx -y pilotprotocol-mcp@0.2.13 attach --hermes</code></pre>
  <p>The adapter verifies that <code>$HOME/.pilot/managed/enterprise-control.json</code> is a regular owner-owned file with owner-only permissions. It merges supported hook configuration without deliberately replacing an unrelated existing hook. Some harnesses require an explicit restart, trust review, repository-level file, or first-use command approval; follow the connector-specific instructions displayed in the console.</p>

  <h2 id="events">What Pilot receives</h2>
  <p>Where the harness supplies it, a pre-hook sends the canonical action, called tool, complete parameters, explicit file bytes, destination, session and working-directory correlation, permission mode, and timing metadata. A post-hook adds the result, response content, duration, or failure. The hosted exchange makes those fields visible alongside the signed policy and decision.</p>
  <p>Coverage must be stated per event. An outbound-message hook can govern message delivery even when it is not a general tool hook. MCP coverage means Pilot sees calls to Pilot MCP, not the entire agent. A shell hook is not kernel mediation.</p>

  <h2 id="failure">Failure posture</h2>
  <p>Pilot can emit a valid deny when the hosted decision service is reachable but rejects or times out according to policy. It cannot prevent a harness from killing or bypassing its hook process if the harness itself defines that path as fail open. For high-risk actions, choose harnesses and deployment controls that can enforce the required failure posture.</p>
  <ul>
    <li>Use managed hook requirements or repository-distributed hooks where user configuration is optional.</li>
    <li>Keep host sandboxing and outbound network policy for child-process containment.</li>
    <li>Do not give the Pilot adapter unrelated model-provider or application secrets.</li>
    <li>Version-pin both the harness and adapter, then retest after either changes.</li>
  </ul>

  <h2 id="certification">Production certification checklist</h2>
  <ol>
    <li>Inventory every side-effect path: process, file, browser, HTTP, MCP, messages, transfers, trust, events, and payments.</li>
    <li>Prove an allowed action runs and produces a completed exchange.</li>
    <li>Prove a denied action leaves no external artifact.</li>
    <li>Prove approval, exact continuation, expiry, cancellation, and replay rejection.</li>
    <li>Prove failed tool and post-hook evidence is terminal and non-replaying.</li>
    <li>Kill and time out the hook to confirm the actual failure posture.</li>
    <li>Disable the attachment and verify the original unmanaged behavior returns.</li>
  </ol>

  <div class="notice"><strong>Do not infer coverage from a logo.</strong> The connector's signed capability report and recent runtime evidence determine what a policy can truthfully claim to enforce.</div>`,
  },

  'managed-policies': {
    title: 'Managed Policies and Approvals',
    description: 'Create deterministic and natural-language agent policies, use hosted semantic narrowing, request expiring approval, and deploy signed revisions.',
    body: `<h1>Policies and approvals</h1>
  <p class="subtitle">Pilot separates operator intent, executable policy, semantic interpretation, consent, rollout, and post-action response.</p>

  <div class="toc"><h4>On this page</h4><ul>
    <li><a href="#surfaces">Choose a control surface</a></li>
    <li><a href="#actions">Governed actions</a></li>
    <li><a href="#language">Natural-language policy workflow</a></li>
    <li><a href="#structured">Structured policy workflow</a></li>
    <li><a href="#order">Runtime order and composition</a></li>
    <li><a href="#approval">Approval and continuation</a></li>
    <li><a href="#examples">Examples</a></li>
    <li><a href="#test">Prove enforcement</a></li>
  </ul></div>

  <h2 id="surfaces">Choose a control surface</h2>
  <table><thead><tr><th>Surface</th><th>Use it for</th><th>Runtime effect</th></tr></thead><tbody>
    <tr><td>Signed policy rule</td><td>Exact node, action, resource, risk, disclosure, amount, destination, or approval behavior.</td><td>The first matching rule establishes the deterministic ceiling.</td></tr>
    <tr><td>Policy statement</td><td>Human-readable restrictions such as “Do not accept trust from anyone.”</td><td>Compiles into reviewed deterministic rules and/or semantic clauses; no effect until rollout activation.</td></tr>
    <tr><td>Semantic clause</td><td>Meaning that cannot be resolved from exact metadata, such as confidential content leaving the company.</td><td>A hosted evaluator may deny or request the pinned approval plan; it never grants above the base answer.</td></tr>
    <tr><td>Approval plan</td><td>Eligible approvers, quorum, validity, approved outcome, and constraints.</td><td>May create one payload-bound, single-use continuation after quorum.</td></tr>
    <tr><td>Procedure</td><td>Alert, investigate, quarantine, refresh, export, or notify after an outcome.</td><td>Runs after durable activity and cannot modify the original authorization.</td></tr>
  </tbody></table>

  <h2 id="actions">Governed actions</h2>
  <p>The managed action vocabulary covers browser navigation; process execution; arbitrary tool invocation; HTTP and webhook requests; data read, export, and text/JSON/binary send; file read, write, delete, and share; event publication; trust request, accept, auto-accept, reject, revoke; wallet payment; and custom registered actions.</p>
  <p>Policies also bind the target resource, risk, recipient, purpose, labels, content type, residency, retention class, transaction value, destination, and node scope where relevant. An adapter must report an action before Pilot can govern it. Publishing a rule does not create interception.</p>

  <h2 id="language">Natural-language policy workflow</h2>
  <ol>
    <li>Create or select an approval-plan revision first if the desired semantic outcome is approval.</li>
    <li>Open <strong>Policy statements</strong> and create a statement with an explicit node scope. <code>*</code> means all nodes in the tenant.</li>
    <li>Enter the ordinary-language instruction. Add entity-to-resource bindings when a human name must map to a canonical target.</li>
    <li>Select exact action hints for content-sensitive meaning. Semantic fallback is opt-in and limited to the reviewed deny or approval outcome.</li>
    <li>Compile the statement. Inspect the source hash, compiler version, deterministic rules, semantic clauses, failure posture, warnings, and unresolved phrases.</li>
    <li>Edit and recompile until the interpretation is exact. Unresolved compilation cannot enter review.</li>
    <li>Submit review, approve the source, create a signed rollout draft, inspect its diff and simulations, publish it, obtain signed node acknowledgements, and activate it.</li>
  </ol>
  <p>A prose sentence is never sent directly to a model as unrestricted authority. It remains a revisioned source object bound to the reviewed compilation and active signed policy revision.</p>

  <h2 id="structured">Structured policy workflow</h2>
  <ol>
    <li>Select the target node or fleet scope.</li>
    <li>Choose registered actions, resource prefixes, and applicable risk classes.</li>
    <li>Select deny, allow, allow with constraints, or approval required.</li>
    <li>For constraints, set maximum value, allowed destinations, and typed disclosure requirements.</li>
    <li>For approval, select the exact immutable approval-plan revision.</li>
    <li>Enter a title and auditable reason; choose full-fleet or canary rollout and acknowledgement thresholds.</li>
    <li>Create the inactive candidate, run diff and deterministic simulation, obtain required independent approval, publish, then activate.</li>
  </ol>
  <p>Editing produces a higher immutable revision. Removing a rule is also a reviewed signed change. Rollback creates a new higher revision rather than lowering a node's rollback floor.</p>

  <h2 id="order">Runtime order and composition</h2>
  <ol>
    <li>Locally pinned trust and mandate define the hard maximum.</li>
    <li>The active signed policy evaluates deterministic rules in document order. The first match wins; no match means deny.</li>
    <li>An eligible active semantic clause may inspect exact hosted content. Semantic allow preserves the base result; deny or approval may narrow it. A base deny remains deny.</li>
    <li>Conflicting semantic approval plans fail closed. Evaluator, model, prompt, policy, clause, timeout, failure mode, and usage metadata are journaled.</li>
    <li>The node verifies the final signed result before releasing or blocking the side effect.</li>
  </ol>
  <p>No active semantic clause means no model call and no semantic usage charge. High- and critical-risk failure posture should be explicitly fail closed when the business requirement cannot tolerate an unevaluated action.</p>

  <h2 id="approval">Approval and continuation</h2>
  <p>An approval plan is tenant-scoped and immutable by revision. It lists purpose-limited approver keys, required quorum, validity duration, approved outcome, and optional constraints. A transaction binds the exact signed intent and payload hash. Distinct eligible signatures count toward quorum.</p>
  <p>Approval is not a reusable exception. Quorum creates one single-use continuation for the same request. Rejection, cancellation, expiry, payload mismatch, agent mismatch, plan mismatch, or replay remains blocked. The node stores payload-free continuation state with exclusive creation and a restart-safe lease so at most one resume attempt can occur.</p>

  <h2 id="examples">Examples</h2>
  <table><thead><tr><th>Operator statement</th><th>Compiled or runtime meaning</th></tr></thead><tbody>
    <tr><td>Don't accept trust from anyone.</td><td>Deterministic deny for <code>trust.accept</code> and <code>trust.auto_accept</code> on the selected nodes.</td></tr>
    <tr><td>Do not transact with Acme.</td><td>After binding Acme to a canonical merchant resource, deny matching <code>wallet.pay</code> actions.</td></tr>
    <tr><td>Do not send confidential material outside the company.</td><td>Explicit send/share scope plus a reviewed hosted semantic clause that may deny or request security approval.</td></tr>
    <tr><td>Finance may pay approved-vendor up to 1,000 USD.</td><td>Structured node/action/resource rule with amount and destination constraints.</td></tr>
  </tbody></table>

  <h2 id="test">Prove enforcement</h2>
  <ol>
    <li>Confirm the target node reports a blocking capability for the governed action.</li>
    <li>Activate the exact signed policy revision and wait for the node acknowledgement.</li>
    <li>Run one allowed action and inspect its complete exchange and post-hook result.</li>
    <li>Run a violation with a distinctive inert marker.</li>
    <li>Confirm the decision cites the expected deterministic rule or semantic clause.</li>
    <li>Confirm the external side effect or marker does not exist.</li>
    <li>Test approval, expiry, cancellation, replay, evaluator outage, and hook timeout separately.</li>
  </ol>

  <div class="notice"><strong>Policy presence is not enforcement proof.</strong> Pilot's coverage report combines the signed connector capability, action inventory, blocking/approval support, receipts, and recent runtime evidence. Uncovered targets require an explicit audited exception.</div>`,
  },

  'managed-fleet': {
    title: 'Managed Fleet and Evidence',
    description: 'Operate Pilot nodes remotely, inspect signed state and exchanges, monitor health, automate responses, and retain tenant-scoped audit evidence.',
    body: `<h1>Fleet, evidence, and operations</h1>
  <p class="subtitle">Signed inventory, desired state, typed control, exact exchange evidence, audit, monitoring, and bounded automation.</p>

  <div class="toc"><h4>On this page</h4><ul>
    <li><a href="#inventory">Inventory and health</a></li>
    <li><a href="#desired">Desired state and drift</a></li>
    <li><a href="#commands">Remote commands</a></li>
    <li><a href="#state">.pilot state visibility</a></li>
    <li><a href="#exchanges">Exchanges and tracing</a></li>
    <li><a href="#audit">Audit and investigations</a></li>
    <li><a href="#procedures">Procedures</a></li>
    <li><a href="#integrations">External integrations</a></li>
    <li><a href="#lifecycle">Object lifecycle</a></li>
  </ul></div>

  <h2 id="inventory">Inventory and health</h2>
  <p>The native management dashboard summarizes connected nodes, policy coverage, decision outcomes, pending approvals, evaluator health, command state, and recent activity. Fleet views support server-side filters and pagination for node status, group, tag, policy drift, connector capability, runtime version, and last report time.</p>
  <p>Each node detail joins its signed identity, harness and connector versions, uptime, counters, connectivity, current and desired policy revisions, groups, tags, quarantine posture, recent actions, receipts, commands, state root, and acknowledgements. A stale or missing report is visible; the UI does not silently treat configured state as observed state.</p>

  <h2 id="desired">Desired state and drift</h2>
  <p>Authority-signed desired state can set group, tags, desired runtime version, desired policy revision, and quarantine posture. The node verifies the command key and monotonic floors, persists before applying, reconciles locally, then returns a signed <code>applied</code>, <code>partially_applied</code>, or <code>rejected</code> acknowledgement. Drift remains visible until the reported state converges.</p>
  <p>Runtime version is a desired target, not permission for the control plane to replace arbitrary executables. The deployment supervisor remains responsible for changing installed software.</p>

  <h2 id="commands">Remote commands</h2>
  <p>Remote operations are typed, targeted, authority-signed, reason-bound, expiring, cancellable, and auditable. Supported commands are:</p>
  <ul>
    <li><code>refresh_policy</code> — fetch and acknowledge the current signed rollout;</li>
    <li><code>export_receipts</code> — flush pending signed receipt evidence;</li>
    <li><code>reload_control</code> — reload the verified local control attachment;</li>
    <li><code>sync_state</code> — report and reconcile the safe state tree;</li>
    <li><code>collect_diagnostics</code> — return bounded diagnostic status;</li>
    <li><code>restart_runtime</code> and <code>shutdown_runtime</code> — graceful typed lifecycle requests.</li>
  </ul>
  <p>Pilot is not a remote shell. Operators cannot type arbitrary commands into the fleet console. Nodes return bounded signed result codes, and protected local authority cannot be widened through command parameters.</p>

  <h2 id="state"><code>.pilot</code> state visibility</h2>
  <p>An adopted node can report a signed manifest of its managed state directory: relative paths, file or directory kind, size, mode, modification time, content hash, revision, and root hash. Safe text files may expose sanitized or bounded content. Keys, seeds, credentials, identity, policy internals, trust material, and rollback floors are fingerprint-only and immutable through this channel.</p>
  <p>Supported state changes use optimistic concurrency. A mutation names the expected tree revision and existing file hash, contains an auditable reason, expires, and is signed by the authority. The node independently validates safe paths and modes, applies the change locally, and reports the resulting signed revision. History records additions, changes, removals, and root hashes.</p>

  <h2 id="exchanges">Exchanges and tracing</h2>
  <p>The Exchanges workspace stores tenant-scoped request and response evidence with server-side search and pagination. A detail view correlates:</p>
  <ul>
    <li>agent, action, called resource, intent ID, session, and signing key;</li>
    <li>exact request and reported response content, content type, length, encryption key ID, hash, and retention;</li>
    <li>recipient, purpose, labels, residency, and retention class;</li>
    <li>deterministic and semantic decisions, matched rules and clauses, evaluator/model/prompt versions;</li>
    <li>approval transaction, votes, expiry, continuation, and execution state;</li>
    <li>post-hook result, receipt, fleet activity, audit entries, and procedure runs.</li>
  </ul>
  <p>Browser previews are bounded. Complete retained objects require explicit evidence permission and an audited download. Audit metadata and exact exchange content are separate stores with different access and retention concerns.</p>

  <h2 id="audit">Audit and investigations</h2>
  <p>Management mutations write an append-only attempt event and a terminal result event. Records include actor, roles, authentication method, operation, reason, correlation ID, status, duration, and request/response hashes without copying secrets. Operators can filter, paginate, inspect, export NDJSON, monitor continuous delivery, and retry dead-letter exports.</p>
  <p>Investigations have assignee, severity, status, resolution, timestamps, and links to action, exchange, receipt, command, and audit evidence. Legal hold and retention policy preserve required objects. Signed action receipts are verified at ingest and may be mirrored into compliance-retention object storage.</p>

  <h2 id="procedures">Procedures</h2>
  <p>Procedures are immutable, revisioned, post-action response policies. Triggers match action, node, risk, decision, or observed result. The closed response vocabulary can create an alert, open an investigation, quarantine a node, request policy refresh, request receipt export, or notify an active integration.</p>
  <p>A run is durable and idempotent for the activity and procedure revision. Procedures cannot grant or retry the original action, inspect arbitrary content, execute shell commands, or invent remote methods.</p>

  <h2 id="integrations">External integrations</h2>
  <table><thead><tr><th>Kind</th><th>Purpose</th><th>Lifecycle</th></tr></thead><tbody>
    <tr><td>OIDC / Keycloak</td><td>Optional workforce identity federation.</td><td>Stage, inspect, probe, activate, rotate, disable.</td></tr>
    <tr><td>OpenBao / KMS</td><td>External signing-key custody.</td><td>Reference-only secrets and signature verification.</td></tr>
    <tr><td>S3-compatible Object Lock</td><td>Immutable receipt and evidence mirror.</td><td>Retention and legal-hold evidence.</td></tr>
    <tr><td>PostgreSQL</td><td>Replica-safe shared authority state.</td><td>TLS, migrations, backup, restore, and health.</td></tr>
    <tr><td>Prometheus-compatible storage</td><td>Metrics retention.</td><td>Pilot's native UI remains the operator dashboard.</td></tr>
    <tr><td>Usage sink</td><td>Asynchronous idempotent commercial usage delivery.</td><td>Tenant-scoped credentials and delivery health.</td></tr>
    <tr><td>Audit/SIEM and webhook</td><td>Management export, approval, and procedure notifications.</td><td>Retry, dead letter, health, and rotation.</td></tr>
  </tbody></table>
  <p>Connectors store secret references, not rendered secret values. Hosted semantic evaluation is Pilot platform infrastructure and is not configured as a customer-owned integration.</p>

  <h2 id="lifecycle">Object lifecycle</h2>
  <table><thead><tr><th>Object</th><th>Create</th><th>Change</th><th>Terminal behavior</th></tr></thead><tbody>
    <tr><td>Node</td><td>One-time adopted identity and signed report.</td><td>Desired state, tags, groups, quarantine, commands.</td><td>Retire or revoke; reactivate only where policy permits.</td></tr>
    <tr><td>Policy statement</td><td>Inactive source revision.</td><td>Compile, review, approve, deploy.</td><td>Reject or retire; signed policy removal is a higher revision.</td></tr>
    <tr><td>Policy change</td><td>Draft candidate.</td><td>Diff, simulate, approve, publish, canary, promote.</td><td>Withdraw, terminate, or monotonic rollback.</td></tr>
    <tr><td>Approval transaction</td><td>Exact intent and payload binding.</td><td>Vote, escalate, cancel.</td><td>Execute once, reject, cancel, or expire.</td></tr>
    <tr><td>Procedure</td><td>Inactive draft revision.</td><td>New revision, activate, disable.</td><td>Retire while retaining run evidence.</td></tr>
    <tr><td>Integration</td><td>Staged revision.</td><td>Probe, activate, rotate, disable.</td><td>Retain revision and audit history.</td></tr>
  </tbody></table>

  <div class="notice"><strong>High-volume behavior.</strong> Fleet, exchanges, approvals, receipts, audit, procedures, and activity lists use tenant-scoped server-side filters and pagination. Production sizing still requires load, retention, backup, and failover evidence for the intended fleet and event rate.</div>`,
  },

  'managed-readiness': {
    title: 'Hosted Availability and Readiness',
    description: 'Honest current availability, production-readiness status, validated control-plane functionality, remaining launch blockers, and deployment guidance.',
    body: `<h1>Availability and production readiness</h1>
  <p class="subtitle">What is live, what has been proved, and what still prevents a general production launch.</p>

  <div class="callout"><strong>Verdict as of 8 August 2026.</strong> The hosted management deployment is online and its central enforcement path has been validated with real adopted agents. It is <strong>not production-grade as a public multi-tenant SaaS</strong>. It should be described as a production-hosted pre-release or design-partner environment, not generally available production service.</div>

  <div class="toc"><h4>On this page</h4><ul>
    <li><a href="#status">Current live status</a></li>
    <li><a href="#proved">What has been proved</a></li>
    <li><a href="#not-ready">Actual public SaaS blockers</a></li>
    <li><a href="#grade">Production-grade criteria</a></li>
    <li><a href="#use">Where it is appropriate today</a></li>
  </ul></div>

  <h2 id="status">Current live status</h2>
  <table><thead><tr><th>Capability</th><th>Status</th><th>Meaning</th></tr></thead><tbody>
    <tr><td>Management login</td><td>Live</td><td>The HTTPS login page is reachable and existing accounts can authenticate.</td></tr>
    <tr><td>Public account signup</td><td>Not deployed</td><td><code>/v1/auth/signup</code> returns <code>signup_unavailable</code>; new unrelated organizations cannot self-register.</td></tr>
    <tr><td>Organization availability</td><td>Single preconfigured tenant</td><td>The live service currently serves the Pilot demonstration organization.</td></tr>
    <tr><td>Managed node adoption</td><td>Live for the configured tenant</td><td>Short-lived one-time enrollment, verified delegated identity, bootstrap policy, and signed first report work.</td></tr>
    <tr><td>Policy and semantic denial</td><td>Validated</td><td>A real Gemini-driven adopted agent was denied before executing a prohibited command; the expected filesystem side effect was absent.</td></tr>
    <tr><td>Policy, approval, fleet, state, audit UI</td><td>Validated pre-release</td><td>Primary CRUD/lifecycle paths and 31 management pages have passed production-host UI sweeps.</td></tr>
    <tr><td>Harness adapters</td><td>Mixed by harness</td><td>Several native paths are verified; partial and fail-open connectors remain explicitly labelled.</td></tr>
    <tr><td>Plans and payments</td><td>Disabled by product decision</td><td>Public launch has one common entitlement, no checkout, no upgrade UI, and no customer charging. Usage remains measured for cost control.</td></tr>
    <tr><td>Public multi-tenant platform</td><td>Not deployed</td><td>The SaaS provisioner, pooled runtime, account subdomains, and workspace controller are implemented/tested locally but not installed in the hosted GCP environment.</td></tr>
  </tbody></table>

  <h2 id="proved">What has been proved</h2>
  <ul>
    <li>HTTPS management health, invitation-oriented login, tenant-scoped browser access, and cross-tenant query rejection.</li>
    <li>One-time managed adoption with server-assigned identity, signed trust and policy verification, secure local attachment, and fresh signed check-in.</li>
    <li>Structured policy creation, review, activation, semantic-clause evaluation, signed denial, post-hook evidence, and deletion/retirement paths.</li>
    <li>A real agent model proposed a prohibited <code>process.execute</code> action; Pilot denied it and the intended file was not created.</li>
    <li>Fleet detail, desired state, commands, acknowledgements, safe <code>.pilot</code> state create/read/history/delete, monitoring, traffic, approvals, audit, investigations, integrations, and readiness pages.</li>
    <li>Tenant-attributed evaluator usage and idempotent usage-ledger behavior in local full-stack and Kubernetes acceptance environments.</li>
    <li>Version-pinned adapter packaging and regression coverage, including compatibility for the removed legacy heartbeat hook command.</li>
  </ul>
  <p>These proofs establish that the core security concept works. They do not establish the operational, organizational, and provider controls required for a generally available SaaS.</p>

  <h2 id="not-ready">Actual public SaaS blockers</h2>
  <p>There are seven launch gates. Plans and Stripe are deliberately disabled and are not an eighth gate.</p>
  <ol>
    <li><strong>Signup and provisioning:</strong> deploy and prove the full email verification, workspace reservation, owner creation, exact account subdomain, first session, adoption, retry, rollback, and cleanup journey without operator intervention.</li>
    <li><strong>Tenant isolation:</strong> add a database-enforced boundary such as PostgreSQL RLS with mandatory tenant context or separate credentials/schema, then prove host routing, secrets, workers, caches, exports, logs, metrics, and backups cannot cross organizations.</li>
    <li><strong>GCP KMS and storage integration:</strong> exercise native Cloud KMS signing/content-key wrapping and native Cloud Storage conditional writes, locked retention, legal hold, rotation, restore, outage, and cross-tenant denial through workload identity.</li>
    <li><strong>Quotas and abuse controls:</strong> enforce distributed signup defenses plus hard node, request, event, content, storage, retention, queue, and semantic-spend ceilings, noisy-neighbor isolation, reservation cleanup, and operator response.</li>
    <li><strong>Organization lifecycle:</strong> prove audited rename, owner transfer, suspension/resume, export, deletion, legal hold, node and credential revocation, usage closure, subdomain cleanup, retry, and partial-failure recovery.</li>
    <li><strong>Load and disaster-recovery evidence:</strong> retain the declared workload envelope, latency/error/saturation and soak results, backup/PITR and object restore, key recovery, failover, provider outage, rolling upgrade, rollback, and measured RPO/RTO.</li>
    <li><strong>Security assurance:</strong> complete independent penetration and architecture review, close findings, approve the pooled-tenancy, hosted-content/LLM, hook-bypass, privileged-support, supply-chain, recovery, and abuse threat models, and retain exact-release security evidence.</li>
  </ol>

  <h2 id="grade">What production-grade means here</h2>
  <p>A service being deployed on a production hostname is not enough. General production readiness requires all of the following:</p>
  <ul>
    <li>new account to isolated tenant to real-agent denial works without operator intervention;</li>
    <li>cross-tenant reads, writes, host routing, secrets, usage, and backups fail closed under adversarial tests;</li>
    <li>every marketed harness claim is version-pinned and has allowed, denied, approval, timeout, and bypass evidence;</li>
    <li>provider credentials, keys, content, logs, evidence, and backups have reviewed retention and recovery controls;</li>
    <li>quota and usage-metering failures cannot expand authority or create unbounded model or infrastructure spend;</li>
    <li>documented SLOs, support, incident response, vulnerability handling, deployment rollback, and change management are staffed and exercised.</li>
  </ul>

  <h2 id="use">Where it is appropriate today</h2>
  <table><thead><tr><th>Use case</th><th>Recommendation</th></tr></thead><tbody>
    <tr><td>Internal demonstration with the existing tenant</td><td>Yes. The live environment and permanent proof agents support this use.</td></tr>
    <tr><td>Supervised design-partner evaluation</td><td>Yes, with a written scope, connector boundary, data/retention agreement, and operational owner.</td></tr>
    <tr><td>Single-organization production pilot</td><td>Conditional. Perform organization-specific threat modelling, capacity tests, backup/restore, key custody, and incident readiness first.</td></tr>
    <tr><td>Open public self-service SaaS</td><td>No. Signup, provisioning, multi-tenant hardening, planless cost controls, and cloud platform gates remain.</td></tr>
    <tr><td>Regulated or safety-critical autonomous production</td><td>No general approval. It requires independent assurance, exact harness certification, retention/legal review, and customer-specific controls.</td></tr>
  </tbody></table>

  <div class="notice"><strong>Status discipline.</strong> This page records a dated deployment assessment, not a permanent guarantee. Reassess it after every authority, adapter, cloud, identity, evaluator, entitlement, or quota release.</div>`,
  },
};
