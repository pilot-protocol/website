export interface LearnGuide {
  slug: string;
  title: string;
  description: string;
  date: string;
  track: 'Foundations' | 'Transport' | 'Security';
}

export const learnGuides: LearnGuide[] = [
  {
    slug: 'what-is-pilot-protocol',
    title: 'What Is Pilot Protocol?',
    description: 'A system-level introduction to persistent agent addresses, encrypted peer tunnels, discovery, trust, and installable capabilities.',
    date: 'July 30, 2026',
    track: 'Foundations',
  },
  {
    slug: 'what-makes-a-pilot-agent',
    title: 'What Makes a Pilot Agent?',
    description: 'The identity, daemon, address, trust relationship, and application boundary that turn an existing agent into a network participant.',
    date: 'July 22, 2026',
    track: 'Foundations',
  },
  {
    slug: 'ai-in-networking-for-multicloud',
    title: 'AI Networking Across Multiple Clouds',
    description: 'How agent connectivity changes when workloads span cloud accounts, edge devices, laptops, and organizational boundaries.',
    date: 'July 24, 2026',
    track: 'Foundations',
  },
  {
    slug: 'grpc-udp-transport',
    title: 'gRPC and UDP Transport Options',
    description: 'A precise look at gRPC transport assumptions, UDP overlays, and where each layer belongs in an agent communication stack.',
    date: 'July 23, 2026',
    track: 'Transport',
  },
  {
    slug: 'nats-vs-grpc-agent-messaging',
    title: 'NATS vs. gRPC for Agent Messaging',
    description: 'Compare connectivity models, messaging patterns, deployment requirements, and the role of an overlay beneath either option.',
    date: 'July 23, 2026',
    track: 'Transport',
  },
  {
    slug: 'mcp-tunnels-vs-vpn',
    title: 'MCP Tunnels vs. VPNs for Agents',
    description: 'Separate tool access, network reachability, identity, and authorization so similarly named approaches are evaluated on the right boundary.',
    date: 'July 25, 2026',
    track: 'Transport',
  },
  {
    slug: 'how-are-network-agent-tokens-different',
    title: 'How Network Agent Tokens Differ',
    description: 'Compare an agent cryptographic identity with API keys, bearer tokens, and application-level credentials without collapsing the layers.',
    date: 'July 22, 2026',
    track: 'Security',
  },
  {
    slug: 'x25519-encryption',
    title: 'How X25519 Secures Agent Communication',
    description: 'Understand key agreement, tunnel secrets, authenticated encryption, and the limits of what transport cryptography can authorize.',
    date: 'July 24, 2026',
    track: 'Security',
  },
];
