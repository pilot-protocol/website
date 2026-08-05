export type SolutionGroup = 'Connect' | 'Build' | 'Operate';

export interface SolutionCard {
  label: string;
  title: string;
  body: string;
}

export interface SolutionStep {
  title: string;
  body: string;
}

export interface SolutionProfile {
  slug: string;
  footerLabel: string;
  group: SolutionGroup;
  hue: number;
  eyebrow: string;
  metaTitle: string;
  description: string;
  heroLead: string;
  heroEmphasis: string;
  lede: string;
  audience: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  signal: {
    value: string;
    body: string;
    source: string;
    href: string;
  };
  problemTitle: string;
  problemBody: string;
  capabilities: SolutionCard[];
  steps: SolutionStep[];
  proof: string[];
  related: string[];
}

export const solutions: SolutionProfile[] = [
  {
    slug: 'private-agent-network',
    footerLabel: 'Private agent networks',
    group: 'Connect',
    hue: 125,
    eyebrow: 'Agent connectivity',
    metaTitle: 'Private Agent Networks Across Boundaries | Pilot Protocol',
    description: 'Give AI agents permanent addresses, private discovery, explicit trust, and encrypted direct or relayed paths across machines and networks.',
    heroLead: 'Connect agents across',
    heroEmphasis: 'every boundary.',
    lede: 'Give every agent a stable network identity and a private path to its peers—across laptops, clouds, offices, and organizations—without treating a central message broker as the data plane.',
    audience: 'For AI platform teams operating agents across more than one machine, cloud, or organization.',
    primaryCta: { label: 'Connect your first agents', href: '/docs/getting-started' },
    secondaryCta: { label: 'See the network architecture', href: '/docs/concepts' },
    signal: {
      value: '50%',
      body: 'of organizations surveyed said their agents still operate in isolation, while 96% said successful agents depend on seamless integration.',
      source: 'MuleSoft Connectivity Benchmark 2026',
      href: 'https://www.mulesoft.com/lp/reports/connectivity-benchmark',
    },
    problemTitle: 'Agent fleets outgrow local assumptions quickly.',
    problemBody: 'An agent that works on one workstation becomes a networking project as soon as a second runtime, cloud, or company enters the workflow. Addresses change, inbound ports disappear behind NAT, and every new peer gains its own authentication convention. Pilot puts those concerns in one agent-facing network layer.',
    capabilities: [
      { label: 'Address', title: 'A permanent agent identity', body: 'Each node receives a persistent address backed by an Ed25519 identity, independent of its current IP address or runtime.' },
      { label: 'Reach', title: 'Direct when possible', body: 'Pilot discovers peers and attempts a direct NAT-traversed path, then uses an end-to-end encrypted relay when the network requires one.' },
      { label: 'Trust', title: 'Invisible until approved', body: 'Bilateral handshakes make reachability an explicit relationship rather than a side effect of knowing an endpoint.' },
    ],
    steps: [
      { title: 'Install a local daemon', body: 'The same lightweight network surface sits beside each agent runtime.' },
      { title: 'Name and discover peers', body: 'Agents resolve stable hostnames instead of tracking changing IP addresses.' },
      { title: 'Establish mutual trust', body: 'Both endpoints approve the relationship before application traffic begins.' },
      { title: 'Send streams, messages, or files', body: 'Applications use one encrypted transport across local, cloud, and relayed paths.' },
    ],
    proof: ['48-bit virtual addresses', 'Ed25519 identity and request signing', 'X25519 plus AES-256-GCM payload encryption', 'Reliable streams, datagrams, files, and pub/sub'],
    related: ['agent-integration', 'agent-capability-store', 'agent-commerce'],
  },
  {
    slug: 'agent-integration',
    footerLabel: 'Connect existing systems',
    group: 'Connect',
    hue: 180,
    eyebrow: 'Systems integration',
    metaTitle: 'Connect AI Agents to Existing Systems | Pilot Protocol',
    description: 'Bridge AI agents to existing applications through Pilot SDKs, local sockets, webhooks, and loopback TCP or UDP compatibility.',
    heroLead: 'Connect agents to the systems',
    heroEmphasis: 'you already run.',
    lede: 'Keep the applications, protocols, and operational systems that already work. Pilot adds an agent-facing connection layer around them through SDKs, webhooks, and a compatibility gateway.',
    audience: 'For enterprise architects and platform engineers integrating agents with established software.',
    primaryCta: { label: 'Read the integration guide', href: '/docs/integration' },
    secondaryCta: { label: 'Explore the gateway', href: '/docs/gateway' },
    signal: {
      value: '46%',
      body: 'of technical leaders identified integration with existing systems as an obstacle to deploying more capable agents.',
      source: 'Anthropic State of AI Agents 2026',
      href: 'https://resources.anthropic.com/hubfs/The%202026%20State%20of%20AI%20Agents%20Report.pdf',
    },
    problemTitle: 'The useful system is rarely a blank sheet.',
    problemBody: 'Most organizations already have databases, internal services, event handlers, and network applications that cannot be replaced for an agent pilot. Building a bespoke wrapper around every interface slows the experiment and creates another integration estate. Pilot offers several entry points so teams can choose the smallest change that fits the system.',
    capabilities: [
      { label: 'Embed', title: 'SDKs for application code', body: 'Node.js, Python, and Swift applications can address trusted Pilot peers from their existing runtime.' },
      { label: 'Bridge', title: 'Loopback TCP and UDP', body: 'The gateway maps Pilot peers to local aliases so legacy network clients can communicate without learning a new wire protocol.' },
      { label: 'Trigger', title: 'Webhooks with delivery controls', body: 'Agent and network events can feed existing HTTP workflows with retry and circuit-breaker behavior.' },
    ],
    steps: [
      { title: 'Choose the integration seam', body: 'Embed an SDK, call the local socket, bridge a legacy port, or subscribe a webhook.' },
      { title: 'Keep the existing application contract', body: 'Pilot handles peer identity and reachability around the application protocol.' },
      { title: 'Scope the trusted endpoints', body: 'Only approved agents become reachable through the bridge.' },
      { title: 'Expand one workflow at a time', body: 'Additional systems join the same network without redesigning the original connection.' },
    ],
    proof: ['Node.js, Python, and Swift SDKs', 'Local Unix socket API', 'Legacy TCP and UDP gateway', 'Webhook retries and circuit breaker'],
    related: ['private-agent-network', 'agent-ready-apis', 'agent-email-phone'],
  },
  {
    slug: 'agent-capability-store',
    footerLabel: 'Agent capabilities',
    group: 'Connect',
    hue: 270,
    eyebrow: 'Discovery and tools',
    metaTitle: 'Agent Capability Store and Service Network | Pilot Protocol',
    description: 'Let agents discover typed apps and specialist services through a signed local catalogue and a searchable network directory.',
    heroLead: 'Give agents capabilities',
    heroEmphasis: 'they can discover.',
    lede: 'Move beyond a folder of hand-configured tools. Pilot gives agents a catalogue of installable apps and a directory of network services, each with a machine-readable way to explain what it can do.',
    audience: 'For agent builders who need reusable tools and live services without maintaining a separate integration for each one.',
    primaryCta: { label: 'Explore the App Store', href: '/app-store' },
    secondaryCta: { label: 'Read service-agent docs', href: '/docs/service-agents' },
    signal: {
      value: '24%',
      body: 'of API teams surveyed said they currently design their APIs for agent consumption.',
      source: 'Postman State of the API 2025',
      href: 'https://www.postman.com/state-of-api/2025/',
    },
    problemTitle: 'A capable agent still needs a map of what exists.',
    problemBody: 'Tools are often scattered across configuration files, custom servers, and human-oriented documentation. That makes capability discovery brittle and duplicates work across every agent framework. Pilot separates the capability from the harness: apps expose typed methods locally, while service agents advertise structured commands over the network.',
    capabilities: [
      { label: 'Install', title: 'A signed app catalogue', body: 'Agents can inspect, install, and call packaged capabilities with typed methods and declared requirements.' },
      { label: 'Discover', title: 'A live service directory', body: 'Specialist agents publish searchable identities and explain available commands through a common help surface.' },
      { label: 'Compose', title: 'One addressable capability layer', body: 'Local apps and remote services can participate in the same workflow without pretending they have the same execution model.' },
    ],
    steps: [
      { title: 'Search by the task', body: 'Find an app or specialist service by category, name, or capability.' },
      { title: 'Inspect before use', body: 'Review typed methods, integrity state, protection mode, and requested grants.' },
      { title: 'Call through one local interface', body: 'The daemon brokers the app or routes the request to a trusted service agent.' },
      { title: 'Compose complementary capabilities', body: 'A research, communication, or execution tool becomes one step in a larger agent workflow.' },
    ],
    proof: ['Signed catalogue manifests', 'Typed app methods', 'Searchable specialist directory', 'Universal help and structured data conventions'],
    related: ['secure-agent-runtime', 'live-data-for-agents', 'agent-ready-apis'],
  },
  {
    slug: 'secure-agent-runtime',
    footerLabel: 'Secure agent runtime',
    group: 'Build',
    hue: 24,
    eyebrow: 'Agent security',
    metaTitle: 'Secure Agent App Runtime and Tooling | Pilot Protocol',
    description: 'Run agent applications with signed manifests, pinned hashes, explicit grants, supervised processes, audit records, and local content scanning.',
    heroLead: 'Give powerful agent tools',
    heroEmphasis: 'hard boundaries.',
    lede: 'Treat every tool as software with an identity, an integrity state, and a defined authority envelope. Pilot verifies apps at launch, scopes their access, supervises execution, and can scan content before it reaches the agent.',
    audience: 'For application-security and agent-platform teams reviewing what autonomous tools may access or execute.',
    primaryCta: { label: 'Review the security model', href: '/trust' },
    secondaryCta: { label: 'See app permissions', href: '/docs/app-store' },
    signal: {
      value: '1 in 7',
      body: 'developer environments using an agent tool server had at least one confirmed security finding in a large 2026 ecosystem study.',
      source: 'Snyk Agentic Supply Chain Report 2026',
      href: 'https://snyk.io/lp/state-of-agentic-dev-supply-chain-report/',
    },
    problemTitle: 'Tool access is part of the agent threat model.',
    problemBody: 'An agent tool can hold credentials, read files, reach remote services, or launch a process. A convenient configuration is not the same thing as a security boundary. Pilot’s app runtime makes the package, binary, grants, and execution state inspectable, while AEGIS adds a local screening layer for prompt injection and related content risks.',
    capabilities: [
      { label: 'Verify', title: 'Signed and hash-pinned packages', body: 'The catalogue signature is checked and the installed binary hash is revalidated whenever the app launches.' },
      { label: 'Constrain', title: 'Explicit capability grants', body: 'Filesystem, network, process, signing, and audit access can be declared and reviewed per app.' },
      { label: 'Inspect', title: 'Local content screening', body: 'AEGIS can scan commands, files, tool results, memory, and skills for injection, impersonation, and obfuscation patterns.' },
    ],
    steps: [
      { title: 'Inspect the manifest', body: 'Review the publisher, methods, required grants, protection mode, and integrity state.' },
      { title: 'Grant only the required authority', body: 'The local policy stays narrower than the app’s possible capability surface.' },
      { title: 'Verify every launch', body: 'Pilot checks the pinned artifact before supervising the app process.' },
      { title: 'Retain an execution trail', body: 'App calls and policy-relevant actions can be written to the local audit surface.' },
    ],
    proof: ['Catalogue public-key verification', 'SHA-256 binary pinning', 'Per-app grants and guarded mode', 'Local AEGIS screening and audit'],
    related: ['agent-capability-store', 'isolated-agent-compute', 'private-agent-network'],
  },
  {
    slug: 'grounded-agent-search',
    footerLabel: 'Grounded private search',
    group: 'Build',
    hue: 205,
    eyebrow: 'Search and research',
    metaTitle: 'Grounded Private Search for AI Agents | Pilot Protocol',
    description: 'Crawl, index, retrieve, and research private knowledge with Cosift using cited answers, hybrid retrieval, evaluation, and local-model support.',
    heroLead: 'Search your knowledge.',
    heroEmphasis: 'Show the evidence.',
    lede: 'Cosift gives agents a self-hostable research surface: crawl the sources you choose, retrieve with lexical or hybrid search, generate answers with citations, and evaluate whether the result is actually grounded.',
    audience: 'For research, knowledge, and engineering teams that need more than an untraceable model answer.',
    primaryCta: { label: 'Explore Cosift', href: '/apps/io.pilot.cosift' },
    secondaryCta: { label: 'Read the research guide', href: '/blog/web-search-api-for-ai-agents-grounded-research' },
    signal: {
      value: '78%',
      body: 'of technology leaders surveyed cited data integration or data quality as a barrier to scaling AI initiatives.',
      source: 'Adobe Digital Trends — CIO Perspectives',
      href: 'https://business.adobe.com/uk/resources/reports/cio-digital-trends.html',
    },
    problemTitle: 'Retrieval quality decides whether an answer can be trusted.',
    problemBody: 'Private knowledge is fragmented across websites, documents, and application boundaries. Even after it is indexed, a plausible answer can outrun its evidence. Cosift keeps the retrieval path visible and supports evaluation alongside generation, so teams can test source coverage, ranking, and answer grounding rather than relying on fluency alone.',
    capabilities: [
      { label: 'Collect', title: 'Self-hostable crawling and indexing', body: 'Choose the sources and retain control over the index, administration surface, and model endpoints.' },
      { label: 'Retrieve', title: 'Lexical, dense, and hybrid search', body: 'Use BM25, optional embeddings, reranking, expansion, HyDE, and diversity controls for the query at hand.' },
      { label: 'Answer', title: 'Cited research workflows', body: 'Query, answer, and multi-step research endpoints return source context instead of hiding the retrieval trace.' },
    ],
    steps: [
      { title: 'Define the source boundary', body: 'Crawl the approved public or private knowledge surfaces.' },
      { title: 'Select a retrieval strategy', body: 'Start with BM25 or add dense retrieval and reranking where they improve measured quality.' },
      { title: 'Ask for an answer or research run', body: 'The agent receives the response together with source references.' },
      { title: 'Evaluate the result', body: 'Built-in retrieval and answer checks make quality a repeatable engineering concern.' },
    ],
    proof: ['Self-hostable crawler and index', 'BM25 plus optional hybrid retrieval', 'Source-cited answer and research APIs', 'Offline retrieval and answer evaluation'],
    related: ['live-data-for-agents', 'web-access-for-agents', 'isolated-agent-compute'],
  },
  {
    slug: 'web-access-for-agents',
    footerLabel: 'Web access for agents',
    group: 'Build',
    hue: 315,
    eyebrow: 'Web operations',
    metaTitle: 'Reliable Web Access for AI Agents | Pilot Protocol',
    description: 'Combine real Chrome interaction, clean webpage extraction, and reusable site guidance to give AI agents a more dependable web surface.',
    heroLead: 'Give agents more than',
    heroEmphasis: 'a brittle browser loop.',
    lede: 'Use the right web surface for each task: clean Markdown when the agent only needs to read, a real Chrome session when it must interact, and task-level site guidance when a workflow should become repeatable.',
    audience: 'For automation and operations teams whose agents need to read and act across existing websites.',
    primaryCta: { label: 'Explore web apps', href: '/app-store#cat-web' },
    secondaryCta: { label: 'Talk through a workflow', href: '/contact?topic=product' },
    signal: {
      value: 'Live web',
      body: 'benchmarks continue to find recurring failures from pop-ups, navigation changes, authentication boundaries, and other open-web instability.',
      source: 'BrowserArena research',
      href: 'https://arxiv.org/abs/2510.02418',
    },
    problemTitle: 'Not every web task should be solved with pixels.',
    problemBody: 'Browser agents often use one expensive interaction loop for reading, navigation, and submission. That increases latency and exposes the agent to more untrusted page content than necessary. Pilot’s complementary web apps let a workflow begin with clean extraction, move to typed guidance, and open an interactive browser only for the steps that require it.',
    capabilities: [
      { label: 'Read', title: 'Web pages as clean Markdown', body: 'Plainweb turns a URL into compact content for extraction, summarization, and downstream research.' },
      { label: 'Act', title: 'A real Chrome execution surface', body: 'Otto connects the agent to browser tabs for extraction, screenshots, and supported site interactions.' },
      { label: 'Repeat', title: 'Task-specific site guidance', body: 'Bowmark stores concise navigation knowledge and improves it with feedback from completed workflows.' },
    ],
    steps: [
      { title: 'Read before opening a browser', body: 'Use clean extraction for content-only tasks and reduce unnecessary interaction.' },
      { title: 'Load task guidance', body: 'Apply a known site path when the destination and workflow are understood.' },
      { title: 'Escalate to Chrome', body: 'Use the interactive surface for forms, authenticated sessions, or visual state.' },
      { title: 'Capture what worked', body: 'Feed successful task knowledge back into a reusable navigation guide.' },
    ],
    proof: ['Clean URL-to-Markdown extraction', 'Real Chrome extension and relay', 'Screenshots and page extraction', 'Reusable site-task guidance with feedback'],
    related: ['grounded-agent-search', 'sales-agent-stack', 'agent-email-phone'],
  },
  {
    slug: 'isolated-agent-compute',
    footerLabel: 'Isolated agent compute',
    group: 'Build',
    hue: 82,
    eyebrow: 'Execution and data',
    metaTitle: 'Isolated Local Compute for AI Agents | Pilot Protocol',
    description: 'Run agent-generated code in hardware-isolated microVMs or containers with local SQL and data services available through typed app methods.',
    heroLead: 'Let agents execute.',
    heroEmphasis: 'Keep the host out of reach.',
    lede: 'Move generated code and stateful work into an explicit execution environment. Pilot apps expose isolated microVMs, containers, and local data services as typed capabilities the agent can inspect and invoke.',
    audience: 'For coding-agent and platform teams that need useful execution without handing the agent an unrestricted host shell.',
    primaryCta: { label: 'Explore Smol', href: '/apps/io.pilot.smol' },
    secondaryCta: { label: 'Browse compute apps', href: '/app-store#cat-infra' },
    signal: {
      value: '94%',
      body: 'of surveyed teams use containers somewhere in their agent infrastructure, while security remains the most common scaling concern.',
      source: 'Docker State of Agentic AI 2026',
      href: 'https://www.docker.com/blog/state-of-agentic-ai-key-findings/',
    },
    problemTitle: 'Execution is useful precisely because it is dangerous.',
    problemBody: 'Coding agents need to run commands, inspect artifacts, and persist working data. Running everything directly on a developer machine combines the broadest authority with the least repeatability. Pilot separates the agent call from the execution substrate, allowing teams to choose microVM isolation, a container, or a purpose-built database app for the task.',
    capabilities: [
      { label: 'Isolate', title: 'Hardware-isolated microVMs', body: 'Smol runs workloads in local or cloud microVMs with an explicit lifecycle and brokered control surface.' },
      { label: 'Package', title: 'Container execution', body: 'The Docker app provides a familiar unit for repeatable tools, dependencies, and disposable environments.' },
      { label: 'Persist', title: 'Typed local data services', body: 'SQLite, DuckDB, PostgreSQL, MySQL, and Redis cover transactional, analytical, and in-memory workloads.' },
    ],
    steps: [
      { title: 'Choose the isolation level', body: 'Match a microVM, container, or data process to the workload and threat model.' },
      { title: 'Declare the required authority', body: 'App grants expose the files, process calls, and network access the tool requires.' },
      { title: 'Run through typed methods', body: 'The agent invokes a bounded operation instead of receiving a permanent unrestricted shell.' },
      { title: 'Destroy or retain deliberately', body: 'Ephemeral compute and persistent data have separate, visible lifecycles.' },
    ],
    proof: ['Local and cloud microVM execution', 'Docker lifecycle methods', 'Five local database engines', 'Signed apps with explicit grants'],
    related: ['secure-agent-runtime', 'grounded-agent-search', 'agent-integration'],
  },
  {
    slug: 'agent-email-phone',
    footerLabel: 'Email, phone and SMS',
    group: 'Operate',
    hue: 350,
    eyebrow: 'Agent communications',
    metaTitle: 'Email, Phone and SMS for AI Agents | Pilot Protocol',
    description: 'Give AI agents provisioned email, inbox, phone, voice, SMS, and conversation capabilities through typed Pilot applications.',
    heroLead: 'Give agents a place',
    heroEmphasis: 'people can reach.',
    lede: 'Provision real communication endpoints for workflows that cannot stay inside a chat box. Agents can receive and reply to email, work with conversations, send messages, and use phone capabilities through typed applications.',
    audience: 'For support, operations, and workflow teams that need agents to participate in existing communication channels.',
    primaryCta: { label: 'Explore AgentPhone', href: '/apps/io.pilot.agentphone' },
    secondaryCta: { label: 'Talk to the team', href: '/contact?topic=product' },
    signal: {
      value: '87%',
      body: 'of consumers surveyed communicate with businesses across multiple channels, with phone remaining important for support and time-sensitive needs.',
      source: 'Twilio Communications Blueprint',
      href: 'https://www.twilio.com/en-us/report/the-communications-blueprint/overview/chapter-1',
    },
    problemTitle: 'A workflow is not automated if the handoff stops at the inbox.',
    problemBody: 'Many operational processes eventually require an email response, a text update, or a phone conversation. Connecting each channel through an unrelated automation stack fragments context and credentials. Pilot packages communication endpoints as agent-callable apps so they can participate alongside search, company data, and internal systems.',
    capabilities: [
      { label: 'Email', title: 'Provisioned inbox and sending', body: 'Primitive provides account, inbox, send, receive, search, reply, and conversation-level methods.' },
      { label: 'Phone', title: 'Voice and number management', body: 'AgentPhone exposes phone-number and calling capabilities through a typed local application interface.' },
      { label: 'Message', title: 'SMS and conversations', body: 'The same communication surface supports messaging and conversation history for follow-up workflows.' },
    ],
    steps: [
      { title: 'Provision an endpoint', body: 'Create or connect the email or phone identity the workflow will use.' },
      { title: 'Define the communication task', body: 'Give the agent a narrow action such as monitor, draft, reply, notify, or call.' },
      { title: 'Combine context from other apps', body: 'Search, customer data, or company intelligence can inform the interaction.' },
      { title: 'Keep the channel history', body: 'Conversation methods preserve the thread needed for later steps and human review.' },
    ],
    proof: ['Email account and inbox lifecycle', 'Send, receive, reply, and search', 'Phone numbers, voice calls, and SMS', 'Typed conversation methods'],
    related: ['sales-agent-stack', 'agent-integration', 'grounded-agent-search'],
  },
  {
    slug: 'sales-agent-stack',
    footerLabel: 'Sales agent stack',
    group: 'Operate',
    hue: 48,
    eyebrow: 'Revenue operations',
    metaTitle: 'Sales Intelligence and Outreach Agents | Pilot Protocol',
    description: 'Combine people and company intelligence, specialist APIs, web research, email, and phone into a composable sales-agent workflow.',
    heroLead: 'From account research',
    heroEmphasis: 'to a real conversation.',
    lede: 'Build a sales agent from complementary capabilities instead of another monolithic platform: identify the company, enrich the people, research the account, and continue through email or phone.',
    audience: 'For revenue-operations and sales-engineering teams testing where agents can remove research and coordination work.',
    primaryCta: { label: 'Explore company intelligence', href: '/apps/io.pilot.sixtyfour' },
    secondaryCta: { label: 'Discuss a sales workflow', href: '/contact?topic=product' },
    signal: {
      value: '40%',
      body: 'is the average share of a seller’s week spent selling, according to a survey of more than four thousand sales professionals.',
      source: 'Salesforce State of Sales 2026',
      href: 'https://www.salesforce.com/news/stories/state-of-sales-report-announcement-2026/',
    },
    problemTitle: 'Prospecting work is spread across too many disconnected tools.',
    problemBody: 'A useful account brief can require company enrichment, people data, public web research, internal context, drafting, and channel follow-up. Each handoff adds another copy-and-paste boundary. Pilot lets a team compose these steps through typed apps while retaining the option to substitute a capability as the workflow evolves.',
    capabilities: [
      { label: 'Discover', title: 'People and company intelligence', body: 'Sixtyfour supports discovery, enrichment, and research across people and organizations.' },
      { label: 'Expand', title: 'Specialist API access', body: 'Orthogonal routes narrowly scoped requests to a broad set of paid data and enrichment APIs.' },
      { label: 'Engage', title: 'Email, phone, and web actions', body: 'Primitive, AgentPhone, and the web stack carry the workflow from preparation into an approved interaction.' },
    ],
    steps: [
      { title: 'Define the account profile', body: 'Start with a market, company, or person that matches the campaign hypothesis.' },
      { title: 'Enrich and research', body: 'Combine structured intelligence with current web and internal knowledge.' },
      { title: 'Prepare the next action', body: 'Draft a brief, message, or call plan using the collected context.' },
      { title: 'Continue in the chosen channel', body: 'Use a provisioned email or phone capability under the workflow’s approval rules.' },
    ],
    proof: ['Company and contact enrichment', 'Specialist API routing', 'Grounded web research', 'Email, SMS, and phone capabilities'],
    related: ['agent-email-phone', 'web-access-for-agents', 'live-data-for-agents'],
  },
  {
    slug: 'agent-commerce',
    footerLabel: 'Agent commerce',
    group: 'Operate',
    hue: 150,
    eyebrow: 'Payments and identity',
    metaTitle: 'Agent Commerce with Bounded Spending | Pilot Protocol',
    description: 'Combine trusted agent identities, payment requests, verification, and bounded multichain USDC spending for agent-commerce experiments.',
    heroLead: 'Let agents transact',
    heroEmphasis: 'inside a boundary.',
    lede: 'Move from a recommendation to a verifiable exchange. Pilot combines trusted peer relationships with a guarded wallet that can request, send, and verify USDC under explicit spending limits.',
    audience: 'For commerce and procurement builders exploring machine-to-machine transactions without starting from an unrestricted wallet.',
    primaryCta: { label: 'Explore Wallet', href: '/apps/io.pilot.wallet' },
    secondaryCta: { label: 'Talk through the controls', href: '/contact?topic=governance' },
    signal: {
      value: '1 in 3',
      body: 'consumers surveyed expect to use shopping agents regularly, while permissions, spending controls, and human override remain central trust requirements.',
      source: 'Visa Earning Trust in Agentic Commerce 2026',
      href: 'https://corporate.visa.com/en/products/intelligent-commerce/earning-trust-report.html',
    },
    problemTitle: 'A payment needs more context than a destination address.',
    problemBody: 'Agent commerce introduces questions about who requested the action, what was approved, how much may be spent, and whether settlement occurred. Pilot’s current wallet surface supports bounded payment operations and verification, while the network supplies persistent identities and signed requests around the workflow. Higher-order enterprise approval lifecycle remains a separate productization track.',
    capabilities: [
      { label: 'Identify', title: 'A persistent network counterparty', body: 'Pilot peers communicate through signed identities and explicit trust relationships rather than anonymous endpoints.' },
      { label: 'Bound', title: 'A guarded wallet with spend limits', body: 'Wallet exposes request, payment, balance, and verification methods with configurable spending boundaries.' },
      { label: 'Verify', title: 'Check settlement programmatically', body: 'The workflow can validate payment state before continuing to delivery or the next business action.' },
    ],
    steps: [
      { title: 'Establish the counterparties', body: 'Resolve and trust the agents participating in the exchange.' },
      { title: 'Create the payment request', body: 'Bind the amount and destination to the workflow’s business context.' },
      { title: 'Apply the wallet boundary', body: 'Keep the requested action inside the configured spend limit and guarded app grants.' },
      { title: 'Verify before continuing', body: 'Confirm the transfer state programmatically before goods, data, or service access changes hands.' },
    ],
    proof: ['Guarded local wallet app', 'USDC on Base, Ethereum, and Polygon', 'Payment request and verification methods', 'Per-wallet spending limits'],
    related: ['private-agent-network', 'agent-integration', 'secure-agent-runtime'],
  },
  {
    slug: 'agent-ready-apis',
    footerLabel: 'Publish agent-ready APIs',
    group: 'Connect',
    hue: 235,
    eyebrow: 'For API publishers',
    metaTitle: 'Publish Agent-Ready APIs and Services | Pilot Protocol',
    description: 'Package an API as a typed, discoverable Pilot app or network service so agents can understand and invoke it with less custom integration work.',
    heroLead: 'Turn your API into a capability',
    heroEmphasis: 'agents can find.',
    lede: 'Keep the service you already operate. Add a typed agent-facing surface, a discoverable identity, and a distribution path through Pilot’s application catalogue or specialist service network.',
    audience: 'For API companies and platform teams that want agent distribution without rebuilding the underlying product.',
    primaryCta: { label: 'Publish an app', href: '/publish' },
    secondaryCta: { label: 'Read the app contract', href: '/docs/app-store' },
    signal: {
      value: '65%',
      body: 'of organizations surveyed generate revenue from APIs, yet only 24% currently design those APIs for agents.',
      source: 'Postman State of the API 2025',
      href: 'https://www.postman.com/state-of-api/2025/',
    },
    problemTitle: 'A documented API is not automatically an agent product.',
    problemBody: 'Human-oriented reference pages leave the agent to infer authentication, method intent, parameter shape, and safe operating limits. A Pilot app can broker an existing API behind typed methods and declared grants. A network service can publish its own address and structured command surface. Both approaches give the publisher a clearer agent-facing contract.',
    capabilities: [
      { label: 'Describe', title: 'Typed methods and schemas', body: 'Define what the capability does, which arguments it accepts, and how the result is returned.' },
      { label: 'Distribute', title: 'Catalogue or network discovery', body: 'Ship a signed local app or operate a specialist service with a searchable Pilot identity.' },
      { label: 'Operate', title: 'Keep control of the upstream', body: 'The publisher retains the existing API, commercial model, and service operations behind the agent-facing adapter.' },
    ],
    steps: [
      { title: 'Choose local app or hosted service', body: 'Use an app for brokered local access or a service agent for an addressable network capability.' },
      { title: 'Define a narrow agent contract', body: 'Expose task-oriented methods rather than mirroring every raw upstream endpoint.' },
      { title: 'Declare authority and dependencies', body: 'Make credentials, files, network domains, and process requirements inspectable.' },
      { title: 'Publish and iterate', body: 'Distribute through the catalogue or directory and improve the contract from real agent calls.' },
    ],
    proof: ['Typed manifest schema', 'Signed catalogue distribution', 'Searchable service identity', 'Structured help and data responses'],
    related: ['agent-capability-store', 'agent-integration', 'secure-agent-runtime'],
  },
  {
    slug: 'live-data-for-agents',
    footerLabel: 'Live data for agents',
    group: 'Build',
    hue: 65,
    eyebrow: 'Structured research',
    metaTitle: 'Live Structured Data for AI Research | Pilot Protocol',
    description: 'Give research agents structured access to public, scientific, geographic, financial, security, and reference data through specialist services.',
    heroLead: 'Give research agents',
    heroEmphasis: 'live structured context.',
    lede: 'Query specialist services for current public data, combine the results with grounded retrieval, and analyze them locally—without teaching every agent a different upstream API convention.',
    audience: 'For analysts, researchers, and agent builders who need current structured context alongside model reasoning.',
    primaryCta: { label: 'Explore service agents', href: '/docs/service-agents' },
    secondaryCta: { label: 'See grounded search', href: '/solutions/grounded-agent-search' },
    signal: {
      value: '24.4%',
      body: 'of reported agent deployments focus on research and data analysis, making it one of the largest production use-case categories.',
      source: 'LangChain State of Agent Engineering 2026',
      href: 'https://www.langchain.com/state-of-agent-engineering',
    },
    problemTitle: 'The model may know the domain, but not today’s answer.',
    problemBody: 'Research agents need current prices, filings, weather, geographic facts, scientific records, vulnerabilities, and other changing data. Integrating each upstream independently creates a long tail of keys, schemas, and error handling. Pilot’s specialist directory normalizes discovery and common commands while keeping each data source’s scope and upstream limitations visible.',
    capabilities: [
      { label: 'Discover', title: 'Specialists by category', body: 'Find services across reference, science, government, finance, news, transit, security, health, and other domains.' },
      { label: 'Query', title: 'Structured command surfaces', body: 'Common help, data, summary, and JSON conventions reduce the amount of bespoke tool knowledge an agent needs.' },
      { label: 'Analyze', title: 'Compose with search and local data', body: 'Cosift, DuckDB, databases, and market-intelligence apps turn live observations into a larger research workflow.' },
    ],
    steps: [
      { title: 'Find the relevant specialist', body: 'Search the live directory by capability or domain rather than starting from a vendor list.' },
      { title: 'Inspect its current command surface', body: 'Use the service help response to understand parameters and available data.' },
      { title: 'Collect structured results', body: 'Query one or several specialists while retaining source-specific status and limits.' },
      { title: 'Ground and analyze', body: 'Combine live data with indexed knowledge or local analytical tools for the final result.' },
    ],
    proof: ['Hundreds of directory service records', 'Dozens of specialist categories', 'Common help and structured-data conventions', 'Composition with Cosift and local databases'],
    related: ['grounded-agent-search', 'agent-capability-store', 'sales-agent-stack'],
  },
];

export const solutionGroups = (['Connect', 'Build', 'Operate'] as const).map((name) => ({
  name,
  solutions: solutions.filter((solution) => solution.group === name),
}));

export const solutionsBySlug = new Map(solutions.map((solution) => [solution.slug, solution]));
