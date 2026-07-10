# Claim audit: src/pages/blog/python-sdk-pilot-protocol.astro
Audited: 2026-07-10 · Sentences examined: 54 · verified: 41 · false: 3 · unverifiable: 3 · opinion: 4 · example: 3

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 15 | "Python 3.10+, Linux and macOS." | PyPI JSON for pilotprotocol: `requires_python: ">=3.9"` — floor is 3.9, not 3.10. Linux/macOS part is correct (PyPI README: "Linux (x86_64, arm64), macOS"). |
| 121 | "Start the daemon: `pilot-daemon start --hostname my-agent --email agent@example.com`" | web4/cmd/daemon/main.go defines flag-style args only (-email, -registry, -listen, ...); there is no `start` subcommand and no `-hostname` flag on the daemon binary (hostname is set via `pilotctl init --hostname` / set-hostname). Correct form is `pilotctl daemon start` or `pilot-daemon -email ...`. |
| 126 | "Working examples are in the examples/python_sdk directory on GitHub" (links github.com/pilot-protocol/pilotprotocol/tree/main/examples/python_sdk) | Pre-verified: public pilotprotocol repo has NO examples/ directory — link 404s. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 5 | Tag "v0.1.1" (announced SDK version) | Did not confirm a v0.1.1 release exists on PyPI (current is 1.12.4) | `curl https://pypi.org/pypi/pilotprotocol/json \| jq '.releases \| keys'` showing 0.1.1 |
| 113 | "The SDK powers the Pilot skill on ClawHub." | ClawHub skill internals not inspectable with available tools | The published ClawHub Pilot skill source showing pilotprotocol import |
| 111 | "Use the SDK as a tool" with LangChain/LangGraph (integration pattern presented as designed-for) | No LangChain integration code in any verified source | An examples or docs page showing the integration |

## Verified claims (grouped by source)
- PyPI https://pypi.org/pypi/pilotprotocol/json (200): Driver class, PilotError, dial/listen returning Conn/Listener context managers, info(), send_message/send_file (data exchange), publish_event/subscribe_event (event stream), ctypes FFI to prebuilt libpilot (.so/.dylib), wheel ships pilotctl/pilot-daemon/pilot-gateway console entry points, `pip install pilotprotocol`, Unix-socket to local daemon, PyPI project link (L131).
- Pre-verified cheatsheet: daemon socket /tmp/pilot.sock (DefaultSocketPath); dataexchange port 1001; eventstream port 1002; Go single static binary; PyPI package pilotprotocol exists; sdk-python repo exists.
- Local site files (src/pages/**): internal links /docs/services, /docs/gateway, /docs/python-sdk, /blog/zero-dependency-encryption-x25519-aes-gcm, /blog/openclaw-meets-pilot-agent-networking-one-command, /blog/multi-agent-pipelines-openclaw-encrypted-tunnels all exist.
- web4 source: X25519 + AES-256-GCM tunnel encryption (cmd/daemon/main.go:65 -encrypt flag description).
- EXAMPLE: code snippets (hello world, echo server, error-handling, type-hint samples), "other-agent:1000" addresses, agent@example.com.
- OPINION: "not a real integration", "Pythonic", "exactly what you'd expect", marketing CTA copy.
