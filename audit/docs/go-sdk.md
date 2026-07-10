# Claim audit: src/pages/docs/go-sdk.astro
Audited: 2026-07-10 · Sentences examined: 92 · verified: 86 · false: 2 · unverifiable: 0 · opinion: 0 · example: 4

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 73 | "Override with a custom path or set the <code>PILOT_SOCKET</code> environment variable." | `driver.Connect` never reads `PILOT_SOCKET`. common@v0.5.0/driver/driver.go:62-74 — empty path falls back to `DefaultSocketPath()` (driver.go:21-29), which reads only `XDG_RUNTIME_DIR` on Linux. `PILOT_SOCKET` is consumed exclusively by the pilotctl CLI (web4/cmd/pilotctl/main.go:261), not the SDK. Setting the env var has no effect on Go SDK code. |
| 111 | "SetDeadline(t time.Time) error — Sets both read and write deadlines." | common@v0.5.0/driver/conn.go:127-130 — `SetDeadline` calls only `SetReadDeadline`; `SetWriteDeadline` is a no-op returning nil (conn.go:144). Write deadlines are never applied, so `SetDeadline` sets the read deadline only. |

## Verified claims (grouped by source)
- **common@v0.5.0/go.mod**: module path `github.com/pilot-protocol/common` (go get line, import path); `go 1.25.10` → "Requires Go 1.25+".
- **common@v0.5.0/driver/driver.go**: Connect:62 (sig + empty-string default), DefaultSocketPath:21 (/tmp/pilot.sock fallback), Dial:77 (sig + addr format "N:XXXX.YYYY.YYYY:PORT" in doc comment), DialAddr:87, Listen:144, SendTo:170 (unreliable unicast datagram), Broadcast:186 (network fan-out, admin token required, unreliable/best-effort), RecvFrom:202 (blocking channel receive), Info:211, Health:216 (lightweight), Handshake:221, ApproveHandshake:231, RejectHandshake:240, PendingHandshakes:250, WaitForTrust:262 (blocks in daemon until trusted or timeout), TrustedPeers:272, RevokeTrust:277, ResolveHostname:309, SetHostname:317 ("sets or clears"), SetVisibility:325, Deregister:335, SetTags:340, SetWebhook:350 ("empty URL disables"), RotateKey:360 (new keypair, signs proof, registry.RotateKey, swaps + persists), Disconnect:369 (close conn by ID), NetworkList:377, NetworkJoin:382 (token optional, for token-gated networks), NetworkLeave:392, NetworkMembers:401, NetworkInvite:410 (requires admin token on daemon), NetworkPollInvites:420, NetworkRespondInvite:425; all trust/admin/network methods return `(map[string]interface{}, error)` via jsonRPC:43 (JSON-decoded); "Driver is the main entry point" doc comment:56.
- **common@v0.5.0/driver/conn.go**: Read:37 (blocks, honors deadline, `dl.IsZero()` → no deadline), Write:81, Close:108, LocalAddr/RemoteAddr:124-125, SetReadDeadline:132 — full `net.Conn` method set, so Conn works with net/http, bufio, io.Copy, TLS wrappers.
- **common@v0.5.0/driver/listener.go**: Accept:24 (blocks, returns net.Conn wrapping *Conn), Close:67 (unblocks pending Accept — also zz_conn_test.go TestListenerCloseUnblocksAccept), Addr:77 — full `net.Listener` set, so `http.Serve(ln, …)` works out of the box (line 240 claim).
- **common@v0.5.0/driver/ipc.go**: newIPCClient:132 dials `net.Dial("unix", …)` — "communicates with the daemon over a Unix socket"; Datagram type:89.
- **web4/pkg/daemon/ipc.go**: handleInfo:1073-1145 returns node_id, address, hostname, uptime_secs, peers, connections, encrypt/encrypted_peers (encryption status), bytes_sent/bytes_recv (traffic stats) — Info description; handleHealth (~:1170) smaller payload — Health "basic status without the full info payload"; SetTags validation `len(tags) > 3` rejected:1505 — "max 3"; Close/FIN semantics:758 ("Close's FIN goes out after") and :2198 (remote FIN → CmdCloseOK) — "sends FIN to remote".
- **web4/pkg/daemon/daemon.go**: RotateKey:2299-2370 — generates Ed25519 keypair (comment: "ed25519.PrivateKey is a []byte"), signs rotate challenge, registry RotateKey, swaps identity, `crypto.SaveIdentity(d.config.IdentityPath, …)` overwrites in place with no rollback path (persist failure only logs a warning); default identity path `~/.pilot/identity.json` per web4/cmd/daemon/main.go:389.
- **web4/cmd/pilotctl/main.go**: CLI coverage spot-check for "command-line equivalents of every SDK method" — reject:1785/4833, Disconnect:5152, RecvFrom:6076, NetworkPollInvites:6867, NetworkRespondInvite:6901/6921, WaitForTrust used by handshake flow:614-756, prefer-direct:1795, managed:1846.
- **Local site files (src/pages/docs/)**: python-sdk.astro, services.astro, cli-reference.astro all exist (see-also links, prev/next frontmatter hrefs); services.astro:93 confirms "three services" built in; TOC anchors match page ids.
- **gh api repos/pilot-protocol/common**: default branch `main`; `contents/driver` lists conn.go/driver.go/ipc.go/listener.go — source-code link https://github.com/pilot-protocol/common/tree/main/driver valid.
- **Pre-verified cheatsheet**: Go SDK = github.com/pilot-protocol/common/driver; socket /tmp/pilot.sock; Go 1.25; stdio well-known port 1000 (used in examples).

## Example content (not flagged)
- Lines 35-65 quick-start code, 197-212 echo server, 216-226 send-message, 230-238 HTTP server: illustrative code using address `0:0000.0000.0005:1000` and demo strings — API calls in all four blocks match verified signatures.

## Resolutions (2026-07-11 iter 41)
- L73 (PILOT_SOCKET env var for the SDK): corrected. driver.Connect never reads PILOT_SOCKET (that env var is consumed by the pilotctl CLI only, main.go:261). Copy now says default is /tmp/pilot.sock (or $XDG_RUNTIME_DIR/pilot.sock on Linux), override via a custom path arg, and PILOT_SOCKET has no effect on the SDK.
- L111 (SetDeadline "sets both read and write deadlines"): corrected to "sets the read deadline; write deadlines are a no-op in the current driver" (conn.go:127-130,144 — SetDeadline only calls SetReadDeadline).
Build: npm run build green (345 pages).
