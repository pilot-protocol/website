export type InfographicKind =
  | 'topology'
  | 'bridge'
  | 'constellation'
  | 'guardrails'
  | 'retrieval'
  | 'router'
  | 'sandbox'
  | 'channels'
  | 'pipeline'
  | 'transaction'
  | 'distribution'
  | 'research';

export interface InfographicStage {
  label: string;
  title: string;
  body: string;
  items: string[];
}

export interface ArtifactRow {
  key: string;
  value: string;
  tone?: 'accent' | 'good' | 'muted';
}

export interface SolutionStory {
  slug: string;
  heroLead: string;
  heroEmphasis: string;
  lede: string;
  capabilityHeading: { lead: string; emphasis: string };
  workflowHeading: { lead: string; emphasis: string; body: string };
  closeHeading: { lead: string; emphasis: string };
  infographic: {
    kind: InfographicKind;
    eyebrow: string;
    title: string;
    summary: string;
    stages: InfographicStage[];
    artifact: {
      label: string;
      title: string;
      status: string;
      summary: string;
      rows: ArtifactRow[];
      footer: string;
    };
  };
}

export type SolutionSection = 'problem' | 'infographic' | 'capabilities' | 'workflow' | 'proof' | 'related' | 'funnel';

export interface SolutionFunnel {
  eyebrow: string;
  title: string;
  emphasis: string;
  body: string;
  choiceLabel: string;
  choices: string[];
  contextLabel: string;
  contextPlaceholder: string;
  submitLabel: string;
  deliverables: string[];
  success: string;
}

export const solutionStories: Record<string, SolutionStory> = {
  'private-agent-network': {
    slug: 'private-agent-network',
    heroLead: 'Agents should know how to reach each other.',
    heroEmphasis: 'Not where they happen to run.',
    lede: 'Give every agent a durable identity, an approved peer set, and an encrypted route that survives changing IPs, clouds, and network boundaries.',
    capabilityHeading: { lead: 'The network details disappear.', emphasis: 'The trust decision does not.' },
    workflowHeading: {
      lead: 'From unknown endpoint',
      emphasis: 'to verified peer.',
      body: 'The application asks for an agent by name. Pilot resolves the identity, verifies the relationship, selects the best available path, and returns an observable connection state.',
    },
    closeHeading: { lead: 'Give your agents', emphasis: 'a network they can understand.' },
    infographic: {
      kind: 'topology',
      eyebrow: 'Connection anatomy',
      title: 'A connection is more than an open socket.',
      summary: 'It is a named counterparty, an explicit trust relationship, an encrypted route, and a transport the application can use without knowing the underlying topology.',
      stages: [
        { label: 'Resolve', title: 'Find agent-research', body: 'A stable hostname resolves to a persistent Pilot identity—not a temporary IP address.', items: ['hostname', '48-bit address', 'Ed25519 key'] },
        { label: 'Authorize', title: 'Confirm mutual trust', body: 'Both peers have approved the relationship before the transport becomes reachable.', items: ['handshake', 'peer key', 'trust state'] },
        { label: 'Route', title: 'Select the live path', body: 'Pilot attempts a direct NAT-traversed path and retains encrypted relay fallback.', items: ['direct', 'NAT traversal', 'relay fallback'] },
        { label: 'Exchange', title: 'Use the right transport', body: 'The application sends a stream, message, file, datagram, or publication.', items: ['stream', 'file', 'pub/sub'] },
      ],
      artifact: {
        label: 'connection.receipt',
        title: 'agent-research ↔ agent-ops',
        status: 'Connected',
        summary: 'A machine-readable view of who is connected, how they were authenticated, and which path carries the payload.',
        rows: [
          { key: 'identity', value: 'ed25519:7c2e…91af', tone: 'accent' },
          { key: 'trust', value: 'mutual · approved', tone: 'good' },
          { key: 'route', value: 'direct · encrypted', tone: 'good' },
          { key: 'transport', value: 'reliable stream :443' },
        ],
        footer: 'Payload encryption: X25519 + AES-256-GCM',
      },
    },
  },
  'agent-integration': {
    slug: 'agent-integration',
    heroLead: 'Your systems do not need an AI rewrite.',
    heroEmphasis: 'They need an agent edge.',
    lede: 'Put a narrow Pilot adapter beside the software you already trust. Agents gain identity and reachability while the database, service, webhook, or legacy protocol keeps its existing contract.',
    capabilityHeading: { lead: 'Preserve the system.', emphasis: 'Modernize the boundary.' },
    workflowHeading: {
      lead: 'One integration seam.',
      emphasis: 'Several ways in.',
      body: 'Choose an SDK when you own the code, a loopback bridge when you do not, or a webhook when the existing workflow already speaks HTTP. Pilot adds the same peer identity around each option.',
    },
    closeHeading: { lead: 'Connect the first system', emphasis: 'without replacing it.' },
    infographic: {
      kind: 'bridge',
      eyebrow: 'Integration architecture',
      title: 'Wrap the interface. Keep the system.',
      summary: 'Pilot sits at the narrowest useful seam between an existing application and the agent network, so integration work is reusable instead of repeated per agent.',
      stages: [
        { label: 'System', title: 'Existing application', body: 'A database, service, device, or internal tool continues to use its current protocol.', items: ['TCP/UDP', 'HTTP event', 'application SDK'] },
        { label: 'Adapter', title: 'Local Pilot edge', body: 'The gateway, SDK, local socket, or webhook converts reachability into a trusted agent action.', items: ['gateway', 'Unix socket', 'webhook'] },
        { label: 'Network', title: 'Authenticated route', body: 'The request crosses Pilot with a persistent counterparty and encrypted payload path.', items: ['identity', 'trust', 'encryption'] },
        { label: 'Agent', title: 'Remote workflow', body: 'The receiving agent sees a typed event or the original application protocol—not a new infrastructure project.', items: ['event', 'stream', 'response'] },
      ],
      artifact: {
        label: 'integration.delivery',
        title: 'warehouse.inventory.changed',
        status: 'Delivered',
        summary: 'An existing system event reaches a trusted agent with its source and delivery path intact.',
        rows: [
          { key: 'source', value: 'legacy-tcp :5438' },
          { key: 'adapter', value: 'pilot gateway', tone: 'accent' },
          { key: 'recipient', value: 'agent-replenishment' },
          { key: 'delivery', value: 'acknowledged · 42 ms', tone: 'good' },
        ],
        footer: 'No change to the warehouse application protocol',
      },
    },
  },
  'agent-capability-store': {
    slug: 'agent-capability-store',
    heroLead: 'Stop wiring tools one agent at a time.',
    heroEmphasis: 'Give capabilities an address.',
    lede: 'Let an agent discover the apps and specialists that fit the job, inspect their contract and authority, then compose them into a plan it can explain before execution.',
    capabilityHeading: { lead: 'Discovery becomes part of', emphasis: 'the agent’s reasoning loop.' },
    workflowHeading: {
      lead: 'Ask for the outcome.',
      emphasis: 'Inspect the plan.',
      body: 'The useful artifact is not a list of tools. It is a capability plan that names which services will be used, what each contributes, and where authority is required.',
    },
    closeHeading: { lead: 'Give the next agent', emphasis: 'a capability map.' },
    infographic: {
      kind: 'constellation',
      eyebrow: 'Capability planning',
      title: 'A request becomes an inspectable toolchain.',
      summary: 'Pilot separates discovery, contract inspection, and execution so the agent can select complementary capabilities without hiding the plan from its operator.',
      stages: [
        { label: 'Intent', title: '“Research Acme and brief me”', body: 'The task describes the desired artifact instead of prescribing a brittle sequence of tools.', items: ['company brief', 'current sources', 'delivery'] },
        { label: 'Discover', title: 'Find matching capabilities', body: 'The catalogue and service directory return apps and specialists with machine-readable help.', items: ['Sixtyfour', 'Cosift', 'Primitive'] },
        { label: 'Inspect', title: 'Check contracts and grants', body: 'The agent reads typed methods, protection state, required authority, and current service scope.', items: ['methods', 'integrity', 'grants'] },
        { label: 'Compose', title: 'Build the execution plan', body: 'Each capability receives one bounded part of the larger outcome.', items: ['enrich', 'research', 'send'] },
      ],
      artifact: {
        label: 'capability.plan',
        title: 'Acme account brief',
        status: 'Ready for approval',
        summary: 'The selected capabilities and their roles are visible before any external action occurs.',
        rows: [
          { key: '01 · enrich', value: 'io.pilot.sixtyfour', tone: 'accent' },
          { key: '02 · research', value: 'io.pilot.cosift' },
          { key: '03 · deliver', value: 'io.pilot.primitive' },
          { key: 'authority', value: 'email.send · approval required', tone: 'muted' },
        ],
        footer: '3 capabilities · 1 explainable plan',
      },
    },
  },
  'secure-agent-runtime': {
    slug: 'secure-agent-runtime',
    heroLead: 'A tool call is a security decision.',
    heroEmphasis: 'Make it inspectable.',
    lede: 'Verify what is running, scan what is entering, constrain what the app may touch, and retain evidence of the decision—before an agent tool becomes an invisible authority channel.',
    capabilityHeading: { lead: 'Security at every boundary', emphasis: 'the tool crosses.' },
    workflowHeading: {
      lead: 'Four gates before',
      emphasis: 'one consequential action.',
      body: 'The runtime evaluates content, package integrity, declared grants, and the supervised action separately. A clean prompt does not excuse an untrusted binary, and a signed binary does not receive unlimited authority.',
    },
    closeHeading: { lead: 'Turn tool access into', emphasis: 'an explicit control surface.' },
    infographic: {
      kind: 'guardrails',
      eyebrow: 'Execution control path',
      title: 'Every tool call passes through visible gates.',
      summary: 'Pilot combines package integrity, grant scoping, supervised execution, local content screening, and audit into one decision path without pretending any single control is sufficient.',
      stages: [
        { label: 'Content', title: 'Screen the input', body: 'AEGIS checks commands, files, tool results, memory, and skills for injection and impersonation patterns.', items: ['prompt injection', 'obfuscation', 'impersonation'] },
        { label: 'Package', title: 'Verify what will run', body: 'The catalogue signature and pinned binary hash are checked before launch.', items: ['publisher signature', 'SHA-256', 'manifest'] },
        { label: 'Authority', title: 'Apply local grants', body: 'Filesystem, network, signing, process, and audit permissions stay explicit and app-specific.', items: ['files', 'domains', 'proc.exec'] },
        { label: 'Runtime', title: 'Supervise and record', body: 'Pilot launches the process, brokers the call, and retains the policy-relevant execution trail.', items: ['guarded mode', 'IPC', 'audit'] },
      ],
      artifact: {
        label: 'execution.decision',
        title: 'wallet.pay',
        status: 'Allowed with limits',
        summary: 'The decision explains which artifact ran, which grants were exercised, and which boundary constrained the action.',
        rows: [
          { key: 'integrity', value: 'signature + hash verified', tone: 'good' },
          { key: 'content scan', value: 'no high-risk pattern', tone: 'good' },
          { key: 'grant', value: 'wallet.sign · scoped', tone: 'accent' },
          { key: 'limit', value: '≤ 50 USDC / transaction' },
        ],
        footer: 'Decision and app call retained in local audit',
      },
    },
  },
  'grounded-agent-search': {
    slug: 'grounded-agent-search',
    heroLead: 'Answers are cheap.',
    heroEmphasis: 'Evidence is the product.',
    lede: 'Build a private research surface that shows where an answer came from, how the evidence was retrieved, and whether the final response stays grounded in the sources you control.',
    capabilityHeading: { lead: 'Own the corpus.', emphasis: 'Measure the answer.' },
    workflowHeading: {
      lead: 'From raw sources',
      emphasis: 'to a cited conclusion.',
      body: 'Cosift keeps collection, retrieval, generation, and evaluation as separate observable stages. Teams can improve the stage that failed instead of treating search quality as model intuition.',
    },
    closeHeading: { lead: 'Make the next answer', emphasis: 'auditable by default.' },
    infographic: {
      kind: 'retrieval',
      eyebrow: 'Grounded research pipeline',
      title: 'The answer keeps its chain of evidence.',
      summary: 'Every step—from crawling to ranking to answer evaluation—produces inspectable material that can be tested, tuned, or replaced without discarding the whole system.',
      stages: [
        { label: 'Collect', title: 'Crawl approved sources', body: 'Websites and documents enter a self-hosted index under an explicit source boundary.', items: ['URLs', 'documents', 'source metadata'] },
        { label: 'Retrieve', title: 'Find candidate evidence', body: 'BM25, optional dense retrieval, expansion, HyDE, and MMR create the evidence set.', items: ['BM25', 'embeddings', 'MMR'] },
        { label: 'Rank', title: 'Put the best context first', body: 'Hybrid scoring and optional reranking improve the evidence presented to the model.', items: ['hybrid', 'rerank', 'top-k'] },
        { label: 'Answer', title: 'Generate and evaluate', body: 'The response carries citations and can be checked for retrieval and answer quality.', items: ['citations', 'grounding', 'evals'] },
      ],
      artifact: {
        label: 'research.answer',
        title: 'Why did churn rise in Q2?',
        status: 'Grounded',
        summary: 'Support wait time increased after the April routing change; cancellation language rose most sharply in enterprise accounts.',
        rows: [
          { key: '[1]', value: 'Support review · Apr–Jun', tone: 'accent' },
          { key: '[2]', value: 'Routing change log · 04/18' },
          { key: '[3]', value: 'Enterprise churn notes · Q2' },
          { key: 'evaluation', value: '3/3 claims supported', tone: 'good' },
        ],
        footer: 'Retrieved passages remain attached to the answer',
      },
    },
  },
  'web-access-for-agents': {
    slug: 'web-access-for-agents',
    heroLead: 'The web keeps moving.',
    heroEmphasis: 'Your agent needs more than one way through it.',
    lede: 'Read with clean extraction, navigate with reusable site knowledge, and open a real browser only when the task requires interaction. The agent chooses a surface that matches the job.',
    capabilityHeading: { lead: 'Read, navigate, and act', emphasis: 'are different operations.' },
    workflowHeading: {
      lead: 'Use the lightest reliable surface',
      emphasis: 'for each step.',
      body: 'A content question should not launch a browser. A known workflow should not rediscover the site. A genuine interaction can escalate to Chrome with the relevant context already assembled.',
    },
    closeHeading: { lead: 'Turn a fragile browser loop', emphasis: 'into a routed web workflow.' },
    infographic: {
      kind: 'router',
      eyebrow: 'Web task router',
      title: 'The task decides how the web is accessed.',
      summary: 'Pilot’s web apps are complementary: Plainweb minimizes the reading surface, Bowmark captures task knowledge, and Otto supplies a real browser when state or interaction matters.',
      stages: [
        { label: 'Classify', title: 'What must happen?', body: 'The workflow distinguishes content extraction, known navigation, and stateful browser interaction.', items: ['read', 'navigate', 'act'] },
        { label: 'Read', title: 'Extract clean content', body: 'Plainweb returns compact Markdown when the task only needs the page’s information.', items: ['URL', 'Markdown', 'metadata'] },
        { label: 'Navigate', title: 'Load task knowledge', body: 'Bowmark supplies a concise, feedback-improved route through a known site workflow.', items: ['steps', 'selectors', 'feedback'] },
        { label: 'Act', title: 'Escalate to real Chrome', body: 'Otto handles screenshots, visible state, authenticated tabs, and supported interactions.', items: ['Chrome', 'screenshot', 'typed action'] },
      ],
      artifact: {
        label: 'web.task.result',
        title: 'Vendor status check',
        status: 'Completed',
        summary: 'All five vendor status pages were read; one active incident requires follow-up.',
        rows: [
          { key: 'read', value: '4 pages · Plainweb' },
          { key: 'navigate', value: '1 known flow · Bowmark' },
          { key: 'interact', value: 'incident detail · Otto', tone: 'accent' },
          { key: 'evidence', value: '5 URLs + 1 screenshot', tone: 'good' },
        ],
        footer: 'Browser interaction used only where page state required it',
      },
    },
  },
  'isolated-agent-compute': {
    slug: 'isolated-agent-compute',
    heroLead: 'Generated code should run somewhere disposable.',
    heroEmphasis: 'Not on the laptop that hired it.',
    lede: 'Give coding agents a real execution environment with a visible lifecycle: verify the tool, launch a microVM or container, attach only the data it needs, and return an artifact instead of host access.',
    capabilityHeading: { lead: 'Useful execution.', emphasis: 'Disposable authority.' },
    workflowHeading: {
      lead: 'The host stays outside',
      emphasis: 'the workload boundary.',
      body: 'The agent calls a signed app. The app creates the selected isolation substrate, runs the bounded workload, stores deliberate state, and returns logs or artifacts through a typed method.',
    },
    closeHeading: { lead: 'Give the coding agent', emphasis: 'a safer place to work.' },
    infographic: {
      kind: 'sandbox',
      eyebrow: 'Execution boundary',
      title: 'The host never becomes the sandbox.',
      summary: 'Code, dependencies, data, and artifacts cross explicit interfaces. The agent receives execution capability without inheriting the workstation’s ambient credentials and filesystem.',
      stages: [
        { label: 'Request', title: 'Describe the job', body: 'The agent submits code, inputs, limits, and the intended output through a typed app method.', items: ['code', 'inputs', 'timeout'] },
        { label: 'Verify', title: 'Check the execution app', body: 'Pilot validates the signed manifest, binary hash, and local grants before launch.', items: ['signature', 'SHA-256', 'grants'] },
        { label: 'Isolate', title: 'Create the workload boundary', body: 'Smol starts a microVM or Docker starts a container with only the requested resources.', items: ['microVM', 'container', 'resource cap'] },
        { label: 'Return', title: 'Export result, not authority', body: 'Logs, files, and selected data return through the app while the environment can be destroyed.', items: ['stdout', 'artifact', 'destroy'] },
      ],
      artifact: {
        label: 'compute.job.receipt',
        title: 'Analyze customer_export.csv',
        status: 'Succeeded',
        summary: 'The analysis ran in a disposable microVM and returned a report plus a reproducible command log.',
        rows: [
          { key: 'runtime', value: 'smolvm · hardware isolated', tone: 'accent' },
          { key: 'limits', value: '2 vCPU · 2 GB · 90 s' },
          { key: 'network', value: 'disabled', tone: 'good' },
          { key: 'artifact', value: 'churn_segments.parquet' },
        ],
        footer: 'Environment destroyed after artifact export',
      },
    },
  },
  'agent-email-phone': {
    slug: 'agent-email-phone',
    heroLead: 'An agent without a channel cannot finish the job.',
    heroEmphasis: 'Give it a real inbox and number.',
    lede: 'Let an operational agent continue through the channels people already use—email, SMS, and voice—while preserving the conversation context required for follow-up and human handoff.',
    capabilityHeading: { lead: 'One workflow.', emphasis: 'The channel the moment requires.' },
    workflowHeading: {
      lead: 'Context travels with',
      emphasis: 'the conversation.',
      body: 'A customer question can begin in email, become a time-sensitive text, and escalate to a call. Primitive and AgentPhone expose those channel actions as complementary methods rather than isolated automation silos.',
    },
    closeHeading: { lead: 'Give the workflow', emphasis: 'a reachable endpoint.' },
    infographic: {
      kind: 'channels',
      eyebrow: 'Conversation architecture',
      title: 'The message changes channel. The case keeps its context.',
      summary: 'Knowledge, account context, the generated response, and channel history stay part of one workflow even when the next best action moves from email to SMS or voice.',
      stages: [
        { label: 'Context', title: 'Assemble the case', body: 'The agent combines the inbound message with relevant knowledge and system context.', items: ['inbox', 'knowledge', 'customer record'] },
        { label: 'Draft', title: 'Generate the next response', body: 'The workflow prepares a channel-appropriate reply and the evidence behind it.', items: ['answer', 'summary', 'approval'] },
        { label: 'Deliver', title: 'Choose email, SMS, or voice', body: 'Primitive or AgentPhone executes the approved action through a provisioned endpoint.', items: ['email', 'SMS', 'call'] },
        { label: 'Continue', title: 'Retain the thread', body: 'Conversation methods preserve replies, status, and the material needed for follow-up or handoff.', items: ['thread', 'history', 'handoff'] },
      ],
      artifact: {
        label: 'conversation.handoff',
        title: 'Case #1842 · delivery delay',
        status: 'Customer updated',
        summary: 'The agent replied by email, sent a time-sensitive SMS update, and prepared the unresolved question for a human owner.',
        rows: [
          { key: 'email', value: 'reply delivered · 10:14', tone: 'good' },
          { key: 'SMS', value: 'ETA update · 10:16', tone: 'accent' },
          { key: 'voice', value: 'not required', tone: 'muted' },
          { key: 'handoff', value: 'billing exception · assigned' },
        ],
        footer: 'Conversation history attached to the case',
      },
    },
  },
  'sales-agent-stack': {
    slug: 'sales-agent-stack',
    heroLead: 'A sales agent should return an account plan.',
    heroEmphasis: 'Not a pile of tabs.',
    lede: 'Turn a target account into a decision-ready brief: verified company and people data, current evidence, a reason to engage, and the next approved channel action.',
    capabilityHeading: { lead: 'Research that ends with', emphasis: 'a useful next move.' },
    workflowHeading: {
      lead: 'From target criteria',
      emphasis: 'to an informed conversation.',
      body: 'The stack combines structured enrichment, current research, internal context, and communication. Each capability contributes to one artifact the seller can review instead of another disconnected dashboard.',
    },
    closeHeading: { lead: 'Make the next account brief', emphasis: 'decision-ready.' },
    infographic: {
      kind: 'pipeline',
      eyebrow: 'Account intelligence pipeline',
      title: 'The deliverable is the brief, not the browsing session.',
      summary: 'Pilot composes specialized capabilities into an account artifact that explains why the company fits, what changed recently, who matters, and what action is justified.',
      stages: [
        { label: 'Target', title: 'Define the account thesis', body: 'The workflow begins with fit criteria and an explicit question—not a request for generic enrichment.', items: ['segment', 'trigger', 'problem'] },
        { label: 'Enrich', title: 'Resolve company and people', body: 'Sixtyfour and specialist APIs supply structured organization and contact context.', items: ['Sixtyfour', 'Orthogonal', 'contacts'] },
        { label: 'Research', title: 'Find current evidence', body: 'Cosift and the web stack ground the account thesis in recent, attributable material.', items: ['Cosift', 'Plainweb', 'sources'] },
        { label: 'Engage', title: 'Prepare the next action', body: 'Primitive or AgentPhone carries an approved message or call plan into the chosen channel.', items: ['email', 'phone', 'approval'] },
      ],
      artifact: {
        label: 'account.brief',
        title: 'Acme Robotics · expansion signal',
        status: 'Seller ready',
        summary: 'Acme is adding a second European fulfillment site while hiring for agent infrastructure, creating a timely cross-cloud operations angle.',
        rows: [
          { key: 'fit', value: '92 / 100', tone: 'good' },
          { key: 'trigger', value: 'new EU operations site', tone: 'accent' },
          { key: 'people', value: '3 relevant operators' },
          { key: 'next action', value: 'review tailored email draft' },
        ],
        footer: '5 current sources · generated 8 minutes ago',
      },
    },
  },
  'agent-commerce': {
    slug: 'agent-commerce',
    heroLead: 'A shopping agent needs a mandate.',
    heroEmphasis: 'Not a blank check.',
    lede: 'Bind the counterparty, request, spending boundary, transfer, and verification into one inspectable exchange so an agent can transact without becoming an unrestricted wallet.',
    capabilityHeading: { lead: 'Identity before payment.', emphasis: 'Evidence after settlement.' },
    workflowHeading: {
      lead: 'From negotiated request',
      emphasis: 'to verified exchange.',
      body: 'The network identifies the counterparties. The guarded wallet applies its local limits. Payment verification produces the evidence required before the workflow releases data, inventory, or service access.',
    },
    closeHeading: { lead: 'Give the transaction', emphasis: 'a boundary and a receipt.' },
    infographic: {
      kind: 'transaction',
      eyebrow: 'Bounded exchange',
      title: 'A payment carries identity, intent, limits, and proof.',
      summary: 'Pilot makes the machine-to-machine exchange inspectable from trusted counterparty discovery through settlement verification, without presenting the wallet as a finished enterprise approval system.',
      stages: [
        { label: 'Trust', title: 'Resolve the counterparties', body: 'Buyer and seller agents communicate through persistent identities and an approved relationship.', items: ['buyer identity', 'seller identity', 'handshake'] },
        { label: 'Request', title: 'Specify the exchange', body: 'The seller issues an amount, destination, asset, and business reference the workflow can inspect.', items: ['amount', 'asset', 'reference'] },
        { label: 'Bound', title: 'Apply the wallet limit', body: 'The guarded Wallet app checks the requested action against its configured spending boundary.', items: ['grant', 'spend cap', 'network'] },
        { label: 'Verify', title: 'Confirm settlement', body: 'The buyer checks transfer state before the next business action is released.', items: ['transaction', 'confirmation', 'receipt'] },
      ],
      artifact: {
        label: 'settlement.receipt',
        title: 'Dataset licence · August',
        status: 'Verified',
        summary: 'The buyer agent paid the trusted seller inside its local limit and confirmed settlement before granting dataset access.',
        rows: [
          { key: 'counterparty', value: 'agent-data-market · trusted' },
          { key: 'amount', value: '24.00 USDC · Base', tone: 'accent' },
          { key: 'limit', value: '50.00 USDC / transaction', tone: 'good' },
          { key: 'confirmation', value: 'final · block 34,291,104' },
        ],
        footer: 'Access released after payment verification',
      },
    },
  },
  'agent-ready-apis': {
    slug: 'agent-ready-apis',
    heroLead: 'Your API is documented for people.',
    heroEmphasis: 'Package the job for agents.',
    lede: 'Turn raw endpoints into narrow, typed capabilities an agent can discover, inspect, and invoke—without giving up the API, commercial model, or operations you already own.',
    capabilityHeading: { lead: 'Expose the task.', emphasis: 'Keep the platform.' },
    workflowHeading: {
      lead: 'From endpoint surface',
      emphasis: 'to agent product.',
      body: 'A good agent contract does not mirror every REST endpoint. It packages a useful job, declares the authority it needs, and gives discovery systems enough structure to match it to an intent.',
    },
    closeHeading: { lead: 'Package one useful job', emphasis: 'for agent distribution.' },
    infographic: {
      kind: 'distribution',
      eyebrow: 'Agent product layer',
      title: 'Keep the API. Publish a task-shaped interface.',
      summary: 'The adapter compresses authentication, endpoint selection, parameters, and upstream errors into typed methods that describe the job an agent actually wants done.',
      stages: [
        { label: 'Product', title: 'Existing API platform', body: 'The service, billing, reliability model, and upstream endpoints remain under the publisher’s control.', items: ['API', 'billing', 'operations'] },
        { label: 'Contract', title: 'Define task methods', body: 'The adapter exposes narrow actions with typed arguments, results, and declared dependencies.', items: ['method', 'schema', 'grants'] },
        { label: 'Publish', title: 'Sign or host the capability', body: 'Distribute a signed local app or operate a specialist service on the Pilot network.', items: ['catalogue', 'service agent', 'identity'] },
        { label: 'Discover', title: 'Match agents to the job', body: 'Agents inspect the capability through the catalogue or directory before they invoke it.', items: ['search', 'help', 'call'] },
      ],
      artifact: {
        label: 'agent.manifest',
        title: 'company.enrich',
        status: 'Published',
        summary: 'A task-oriented method gives agents one stable contract while the publisher retains its existing API implementation.',
        rows: [
          { key: 'input', value: 'domain: string · required' },
          { key: 'output', value: 'company_profile.v1' },
          { key: 'network grant', value: 'api.publisher.com', tone: 'accent' },
          { key: 'distribution', value: 'signed app catalogue', tone: 'good' },
        ],
        footer: 'Upstream credentials remain brokered by the app',
      },
    },
  },
  'live-data-for-agents': {
    slug: 'live-data-for-agents',
    heroLead: 'Research agents need today’s data.',
    heroEmphasis: 'Not yesterday’s weights.',
    lede: 'Route a question to current specialist services, keep the source-specific limits visible, join the structured results locally, and return a brief that separates live evidence from model interpretation.',
    capabilityHeading: { lead: 'Current observations.', emphasis: 'Structured for composition.' },
    workflowHeading: {
      lead: 'From one research question',
      emphasis: 'to several live sources.',
      body: 'The service directory helps the agent find domain specialists. Local analytical tools join the returned records, while Cosift supplies document context and citations around the quantitative result.',
    },
    closeHeading: { lead: 'Put live evidence', emphasis: 'inside the next research brief.' },
    infographic: {
      kind: 'research',
      eyebrow: 'Live research composition',
      title: 'The model interprets. Specialists observe.',
      summary: 'Pilot lets a research agent discover current data services, query them through common conventions, and combine the resulting records with local analysis and cited knowledge.',
      stages: [
        { label: 'Question', title: 'Define the evidence needed', body: 'The task identifies which claims require current observations instead of model memory.', items: ['scope', 'time window', 'measures'] },
        { label: 'Discover', title: 'Find domain specialists', body: 'The directory surfaces services for public, scientific, geographic, financial, security, and reference data.', items: ['directory', 'help', 'availability'] },
        { label: 'Query', title: 'Collect structured records', body: 'The agent calls one or several specialists and retains source status and upstream limitations.', items: ['JSON', 'timestamp', 'source state'] },
        { label: 'Synthesize', title: 'Join, ground, and explain', body: 'DuckDB or another local store analyzes the records while Cosift grounds the surrounding narrative.', items: ['DuckDB', 'Cosift', 'citations'] },
      ],
      artifact: {
        label: 'research.brief',
        title: 'Regional energy risk · 72 hours',
        status: 'Current',
        summary: 'Weather, grid, and market specialists indicate elevated peak-load risk in two regions; the brief distinguishes observed data from projected impact.',
        rows: [
          { key: 'weather', value: 'updated 4 min ago', tone: 'good' },
          { key: 'grid load', value: 'updated 11 min ago', tone: 'good' },
          { key: 'market signal', value: 'updated 2 min ago', tone: 'accent' },
          { key: 'analysis', value: 'DuckDB join · 18,402 rows' },
        ],
        footer: '3 live services · 6 cited documents',
      },
    },
  },
};

// Every page has its own information sequence. Shared sections preserve
// semantics and quality while the order follows the mental model of the buyer.
export const solutionSectionOrders: Record<string, SolutionSection[]> = {
  'private-agent-network': ['problem', 'infographic', 'capabilities', 'workflow', 'proof', 'related', 'funnel'],
  'agent-integration': ['infographic', 'problem', 'workflow', 'capabilities', 'funnel', 'proof', 'related'],
  'agent-capability-store': ['capabilities', 'infographic', 'funnel', 'problem', 'workflow', 'related', 'proof'],
  'secure-agent-runtime': ['infographic', 'funnel', 'problem', 'capabilities', 'proof', 'workflow', 'related'],
  'grounded-agent-search': ['infographic', 'problem', 'capabilities', 'funnel', 'workflow', 'proof', 'related'],
  'web-access-for-agents': ['problem', 'capabilities', 'infographic', 'funnel', 'workflow', 'related', 'proof'],
  'isolated-agent-compute': ['infographic', 'capabilities', 'problem', 'workflow', 'funnel', 'proof', 'related'],
  'agent-email-phone': ['funnel', 'problem', 'infographic', 'capabilities', 'workflow', 'proof', 'related'],
  'sales-agent-stack': ['infographic', 'funnel', 'problem', 'capabilities', 'workflow', 'related', 'proof'],
  'agent-commerce': ['infographic', 'funnel', 'capabilities', 'problem', 'workflow', 'proof', 'related'],
  'agent-ready-apis': ['problem', 'funnel', 'infographic', 'capabilities', 'workflow', 'proof', 'related'],
  'live-data-for-agents': ['infographic', 'capabilities', 'funnel', 'problem', 'workflow', 'proof', 'related'],
};

export const solutionFunnels: Record<string, SolutionFunnel> = {
  'private-agent-network': {
    eyebrow: 'Network design review',
    title: 'Get a topology for',
    emphasis: 'your first agent network.',
    body: 'Tell us where the agents run and which boundary is causing friction. We will map the smallest credible Pilot deployment and the path you should validate first.',
    choiceLabel: 'Primary boundary',
    choices: ['Across two clouds', 'Across organizations', 'Behind NAT or firewalls', 'Across edge devices', 'Inside one private fleet'],
    contextLabel: 'Where do the agents run?',
    contextPlaceholder: 'Example: 12 agents across AWS and on-prem, with no inbound ports available…',
    submitLabel: 'Request network blueprint',
    deliverables: ['Recommended topology', 'Trust and discovery boundary', 'First validation path'],
    success: 'Your network-blueprint request is with the founding team.',
  },
  'agent-integration': {
    eyebrow: 'Integration pathfinder',
    title: 'Find the narrowest',
    emphasis: 'integration seam.',
    body: 'Share the first system an agent must reach. We will recommend whether to start with an SDK, local socket, compatibility gateway, webhook, or packaged app.',
    choiceLabel: 'Existing interface',
    choices: ['HTTP API or webhook', 'TCP or UDP application', 'Database', 'Application code we own', 'Device or edge service'],
    contextLabel: 'What must the agent do?',
    contextPlaceholder: 'Example: receive inventory changes and acknowledge the order in our existing warehouse service…',
    submitLabel: 'Get integration path',
    deliverables: ['Recommended integration mode', 'Minimal system change', 'Evaluation checklist'],
    success: 'We received the system context and will return a scoped integration path.',
  },
  'agent-capability-store': {
    eyebrow: 'Capability stack builder',
    title: 'Turn one outcome into',
    emphasis: 'an agent toolchain.',
    body: 'Describe the artifact you want an agent to produce. We will map the complementary Pilot apps and services, including where approval or external credentials enter the flow.',
    choiceLabel: 'Desired outcome',
    choices: ['Research brief', 'Customer operation', 'Sales workflow', 'Data pipeline', 'Web automation', 'Custom agent capability'],
    contextLabel: 'What should the agent deliver?',
    contextPlaceholder: 'Example: enrich a target company, research recent changes, then prepare an email for review…',
    submitLabel: 'Build my capability map',
    deliverables: ['Capability sequence', 'App and service shortlist', 'Authority checkpoints'],
    success: 'Your requested capability map has been routed to the team.',
  },
  'secure-agent-runtime': {
    eyebrow: 'Tool-risk review',
    title: 'Map the authority behind',
    emphasis: 'one dangerous tool call.',
    body: 'Give us a representative action. We will break down its content, package, grant, execution, and audit boundaries against Pilot’s current security surfaces.',
    choiceLabel: 'Highest-risk authority',
    choices: ['Execute code or commands', 'Use credentials or signing keys', 'Read or write files', 'Reach external APIs', 'Send money or messages'],
    contextLabel: 'Describe the action and data involved',
    contextPlaceholder: 'Do not include secrets or customer data. Describe the classes of access only…',
    submitLabel: 'Request tool-risk map',
    deliverables: ['Threat-boundary diagram', 'Required grants', 'Recommended control points'],
    success: 'Your tool-risk review request was sent securely.',
  },
  'grounded-agent-search': {
    eyebrow: 'Retrieval evaluation',
    title: 'Design a grounded-search test',
    emphasis: 'for your own corpus.',
    body: 'Share the shape of the knowledge base and one question that matters. We will outline the crawl, retrieval, citation, and evaluation path worth testing.',
    choiceLabel: 'Knowledge source',
    choices: ['Internal documentation', 'Customer or support content', 'Research library', 'Public websites', 'Mixed structured and unstructured data'],
    contextLabel: 'What question must the system answer well?',
    contextPlaceholder: 'Example: Which product changes caused the increase in enterprise support escalations last quarter?',
    submitLabel: 'Get evaluation plan',
    deliverables: ['Source and crawl boundary', 'Retrieval baseline', 'Grounding evaluation plan'],
    success: 'Your grounded-search evaluation request is with the team.',
  },
  'web-access-for-agents': {
    eyebrow: 'Web workflow router',
    title: 'Route one brittle workflow',
    emphasis: 'through the right web surface.',
    body: 'Give us the site and task. We will separate what should be extracted, what can follow known navigation, and what genuinely requires a live browser.',
    choiceLabel: 'Primary web behavior',
    choices: ['Read and extract content', 'Navigate a repeated workflow', 'Use an authenticated application', 'Complete a multi-site task', 'Capture visual evidence'],
    contextLabel: 'URL and task description',
    contextPlaceholder: 'Example: check five vendor status pages, open incident details, and return evidence…',
    submitLabel: 'Route my web workflow',
    deliverables: ['Plainweb/Bowmark/Otto split', 'Interaction boundary', 'Proposed result artifact'],
    success: 'We received the workflow and will return a recommended web route.',
  },
  'isolated-agent-compute': {
    eyebrow: 'Sandbox selector',
    title: 'Choose the right boundary',
    emphasis: 'for generated code.',
    body: 'Describe the workload, its data, and any network requirement. We will recommend a microVM, container, or narrower data-app execution path.',
    choiceLabel: 'Workload shape',
    choices: ['Run generated code', 'Build or test a repository', 'Analyze a dataset', 'Host a long-running tool', 'Execute an untrusted dependency'],
    contextLabel: 'What must enter and leave the sandbox?',
    contextPlaceholder: 'Example: Python analysis over one CSV, no network, export a Parquet file and logs…',
    submitLabel: 'Get sandbox recommendation',
    deliverables: ['Isolation substrate', 'Resource and network limits', 'Artifact boundary'],
    success: 'Your sandbox recommendation request is queued with the team.',
  },
  'agent-email-phone': {
    eyebrow: 'Conversation flow builder',
    title: 'Map the case across',
    emphasis: 'email, SMS, and voice.',
    body: 'Start with a real communication workflow. We will identify the channel transitions, context the agent needs, and the point where a human should take over.',
    choiceLabel: 'Starting channel',
    choices: ['Inbound email', 'Outbound email', 'SMS alert or follow-up', 'Inbound phone call', 'Outbound phone call', 'Mixed-channel case'],
    contextLabel: 'What should happen from first contact to resolution?',
    contextPlaceholder: 'Example: reply to a delivery question by email, send urgent ETA changes by SMS, escalate billing exceptions…',
    submitLabel: 'Build conversation flow',
    deliverables: ['Channel sequence', 'Context and handoff points', 'Suggested Pilot app methods'],
    success: 'Your conversation-flow request was sent to the team.',
  },
  'sales-agent-stack': {
    eyebrow: 'Sample account brief',
    title: 'See the account artifact',
    emphasis: 'your sellers would receive.',
    body: 'Give us one company domain and the sales question you care about. We will use it to scope a representative account brief and the capability chain behind it.',
    choiceLabel: 'Sales objective',
    choices: ['Qualify account fit', 'Find a current trigger', 'Map relevant people', 'Prepare an outreach angle', 'Monitor an existing account'],
    contextLabel: 'Company domain and question',
    contextPlaceholder: 'Example: acme.com — are they expanding infrastructure in Europe, and who owns agent operations?',
    submitLabel: 'Request sample brief',
    deliverables: ['Account thesis', 'Current-source plan', 'Suggested next action'],
    success: 'Your sample-account request is with the team.',
  },
  'agent-commerce': {
    eyebrow: 'Payment mandate canvas',
    title: 'Define what the agent may buy',
    emphasis: 'before it holds a wallet.',
    body: 'Describe the exchange and boundary. We will map counterparties, payment request, spend cap, settlement evidence, and the point where human approval belongs.',
    choiceLabel: 'Transaction pattern',
    choices: ['Buy data or API access', 'Pay for compute', 'Procure inventory', 'Settle a recurring service', 'Agent-to-agent marketplace'],
    contextLabel: 'Amount, frequency, and release condition',
    contextPlaceholder: 'Example: up to 50 USDC per dataset, maximum twice daily, release access only after verification…',
    submitLabel: 'Design payment mandate',
    deliverables: ['Counterparty and trust model', 'Spend boundary', 'Verification and release sequence'],
    success: 'Your bounded-payment design request was sent to the team.',
  },
  'agent-ready-apis': {
    eyebrow: 'Agent method draft',
    title: 'Turn one API job into',
    emphasis: 'a typed agent method.',
    body: 'Share public documentation and the job agents should accomplish. We will sketch the method, inputs, result, grants, and best Pilot distribution model.',
    choiceLabel: 'Distribution model',
    choices: ['Signed local app', 'Hosted specialist service', 'Not sure yet'],
    contextLabel: 'Documentation URL and desired job',
    contextPlaceholder: 'Example: docs.example.com — enrich a company from its domain and return a normalized profile…',
    submitLabel: 'Draft my agent method',
    deliverables: ['Task-shaped method', 'Input/output sketch', 'App or service recommendation'],
    success: 'Your agent-method draft request is with the publisher team.',
  },
  'live-data-for-agents': {
    eyebrow: 'Live-source planner',
    title: 'Map the live evidence behind',
    emphasis: 'one research question.',
    body: 'Give us a question whose answer changes over time. We will identify candidate specialist services, structured joins, document context, and source-health caveats.',
    choiceLabel: 'Research domain',
    choices: ['Market and company data', 'Government and public data', 'Science and health', 'Geographic and weather', 'Security intelligence', 'Cross-domain research'],
    contextLabel: 'What current question should the agent answer?',
    contextPlaceholder: 'Example: which regions face elevated energy risk over the next 72 hours, and what evidence supports it?',
    submitLabel: 'Build live-source plan',
    deliverables: ['Candidate specialists', 'Join and analysis path', 'Evidence and freshness model'],
    success: 'Your live-source planning request was sent to the team.',
  },
};
