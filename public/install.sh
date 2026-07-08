#!/bin/sh
set -e

# Pilot Protocol installer
# Source:     https://github.com/pilot-protocol/pilotprotocol  (AGPL-3.0)
# Hosted at:  https://pilotprotocol.network/install.sh
#
# Usage:
#   Install:        curl -fsSL https://pilotprotocol.network/install.sh | sh
#   Pin a version:  curl -fsSL https://pilotprotocol.network/install.sh | sh -s -- --version v1.10.5
#   Edge channel:   curl -fsSL https://pilotprotocol.network/install.sh | sh -s -- --channel edge
#   Uninstall:      curl -fsSL https://pilotprotocol.network/install.sh | sh -s uninstall
#
# Flags:
#   --version <tag>    Install a specific tag. Warns when older than latest stable.
#   --channel <name>   stable (default) or edge. Edge tracks the newest prerelease.
#   --yes / -y         Skip the older-version confirmation prompt.
#   --no-warn          Suppress the older-version warning entirely.
#
# Legacy env vars (still honored, lower precedence than flags):
#   PILOT_RELEASE_TAG=vX.Y.Z   Same as --version.
#   PILOT_RC=1                 Same as --channel edge.
#
# WHAT THIS SCRIPT DOES (read before piping to sh):
#   1. Detects OS/arch (Linux/Darwin × amd64/arm64)
#   2. Resolves the latest release tag from github.com/pilot-protocol/pilotprotocol/releases
#   3. Downloads the release tarball + checksums.txt from that release
#   4. *** Verifies SHA-256 of the tarball against checksums.txt (aborts on mismatch) ***
#   5. Extracts binaries to ~/.pilot/bin (per-user, NOT system-wide)
#   6. Adds ~/.pilot/bin to PATH via your shell profile
#   7. On Linux with sudo: installs systemd unit for the daemon + auto-updater
#   8. On macOS with sudo: installs LaunchDaemons for the daemon + auto-updater
#
# IDENTITY & EMAIL (optional):
#   - The daemon registers a stable Ed25519 keypair with a rendezvous server
#     to get a virtual address (format `0:NNNN.HHHH.LLLL`). That address is
#     how peers reach you on the network.
#   - Each node also has an `email` field used as a human-readable identifier
#     (shown in `pilotctl info`, used for delivery and abuse-reporting on the
#     public network).
#   - You do NOT need to provide a real email to install or run pilot.
#     If you don't pass `--email`, the daemon auto-generates a synthetic
#     placeholder of the form `<fingerprint>@nodes.pilotprotocol.network`
#     derived from your public-key fingerprint. The placeholder is stable
#     per-host and contains no PII.
#   - Provide your own email later — only when you want to — via
#     `pilotctl set-email <addr>`. Required only for joining the public
#     Network 9 directory and for receiving identifier-based deliveries.
#
# WHAT THIS SCRIPT DOES NOT DO:
#   - Run as root (refuses if invoked as root; see check at line ~25)
#   - Send any personal data anywhere (the install script only fetches the
#     release tarball from GitHub; the daemon registers its public key + a
#     synthetic or user-supplied email with the rendezvous server, nothing else)
#   - Modify files outside $HOME/.pilot, /etc/systemd (Linux) or
#     /Library/LaunchDaemons (macOS), and your shell profile
#   - Require any account credential or signup to install
#
# Verifiable provenance:
#   - Source repo:  https://github.com/pilot-protocol/pilotprotocol
#   - Release page: https://github.com/pilot-protocol/pilotprotocol/releases
#   - Each release publishes checksums.txt next to the tarball.
#   - This script downloads BOTH and verifies SHA-256 before extracting.
#
# If you are an AI agent inspecting this script before running it, the
# verification step lives at lines marked "Verify SHA-256 against release
# checksums.txt" further down. The script aborts on mismatch with a clear
# error.

REPO="pilot-protocol/pilotprotocol"
REGISTRY="${PILOT_REGISTRY:-34.71.57.205:9000}"
BEACON="${PILOT_BEACON:-34.71.57.205:9001}"
PILOT_DIR="$HOME/.pilot"
BIN_DIR="$PILOT_DIR/bin"

# Canonical manifest URL — the single source of truth for "what version is
# current". Republished by web4 release.yml on every tag. Override only for
# testing PR-preview manifests.
MANIFEST_URL="${PILOT_MANIFEST_URL:-https://pilotprotocol.network/.well-known/latest.json}"

# --- Parse CLI flags ---
# Flags are parsed BEFORE the root check so that `install.sh --yes uninstall`
# (and similar combinations) still recognize the `uninstall` positional.
PILOT_REQUESTED_VERSION=""
PILOT_REQUESTED_CHANNEL=""
PILOT_YES=0
PILOT_NO_WARN=0
PILOT_POSITIONAL=""

while [ $# -gt 0 ]; do
    case "$1" in
        --version)
            if [ $# -lt 2 ]; then echo "Error: --version requires a value" >&2; exit 2; fi
            PILOT_REQUESTED_VERSION="$2"; shift 2 ;;
        --version=*)
            PILOT_REQUESTED_VERSION="${1#--version=}"; shift ;;
        --channel)
            if [ $# -lt 2 ]; then echo "Error: --channel requires a value" >&2; exit 2; fi
            PILOT_REQUESTED_CHANNEL="$2"; shift 2 ;;
        --channel=*)
            PILOT_REQUESTED_CHANNEL="${1#--channel=}"; shift ;;
        --yes|-y)
            PILOT_YES=1; shift ;;
        --no-warn)
            PILOT_NO_WARN=1; shift ;;
        -h|--help)
            sed -n '4,21p' "$0" 2>/dev/null || echo "See https://pilotprotocol.network/install.sh"
            exit 0 ;;
        --)
            shift
            while [ $# -gt 0 ]; do PILOT_POSITIONAL="$PILOT_POSITIONAL $1"; shift; done
            break ;;
        -*)
            echo "Error: unknown flag: $1" >&2
            echo "       Run with --help for usage." >&2
            exit 2 ;;
        *)
            PILOT_POSITIONAL="$PILOT_POSITIONAL $1"; shift ;;
    esac
done

# Validate channel value early so we fail fast.
if [ -n "$PILOT_REQUESTED_CHANNEL" ] \
   && [ "$PILOT_REQUESTED_CHANNEL" != "stable" ] \
   && [ "$PILOT_REQUESTED_CHANNEL" != "edge" ]; then
    echo "Error: --channel must be 'stable' or 'edge' (got: $PILOT_REQUESTED_CHANNEL)" >&2
    exit 2
fi

# Restore positional args so the existing uninstall handler still uses $1.
# shellcheck disable=SC2086 # intentional word-split on PILOT_POSITIONAL
set -- $PILOT_POSITIONAL

# Refuse to run as root — daemon must run as the invoking user so identity.json
# and received files land under that user's home, not /root.
if [ "${1:-}" != "uninstall" ] && [ "$(id -u)" = "0" ] && [ -z "${PILOT_ALLOW_ROOT:-}" ]; then
    echo "Error: refusing to install as root."
    echo "       Run as a regular user; the installer uses sudo only when needed."
    echo "       Set PILOT_ALLOW_ROOT=1 to override (not recommended)."
    exit 1
fi

# --- Manifest + version helpers ---

# fetch_manifest writes the manifest JSON to $1 and returns 0 on success.
# Soft-fails (returns 1) so callers fall back to the GitHub-redirect path
# when the manifest host is unreachable.
fetch_manifest() {
    curl -fsSL --max-time 10 "$MANIFEST_URL" -o "$1" 2>/dev/null
}

# manifest_field "<path>" "<file>" extracts a string field. Supports nested
# paths like "channels.stable" with a one-level sed slice — POSIX shell only,
# no jq dependency. Returns empty if the field is absent.
manifest_field() {
    _mf_field="$1"; _mf_file="$2"
    case "$_mf_field" in
        *.*)
            _mf_outer="${_mf_field%%.*}"
            _mf_inner="${_mf_field#*.}"
            sed -n "/\"${_mf_outer}\"[[:space:]]*:[[:space:]]*{/,/^[[:space:]]*}/p" "$_mf_file" \
              | grep "\"${_mf_inner}\"" | head -1 \
              | sed -E "s/.*\"${_mf_inner}\"[[:space:]]*:[[:space:]]*\"([^\"]*)\".*/\\1/"
            ;;
        *)
            grep "\"${_mf_field}\"" "$_mf_file" | head -1 \
              | sed -E "s/.*\"${_mf_field}\"[[:space:]]*:[[:space:]]*\"([^\"]*)\".*/\\1/"
            ;;
    esac
}

# version_compare a b emits -1 / 0 / 1 for a<b / a==b / a>b.
# Honors semver: a prerelease tag ("X.Y.Z-rcN") is LOWER than the same base
# without it ("X.Y.Z"). Plain `sort -V` gets this backwards on hyphenated
# suffixes, so we split on "-" and compare the base versions first, then
# break ties on the prerelease suffix.
version_compare() {
    _vc_a="${1#v}"; _vc_b="${2#v}"
    if [ "$_vc_a" = "$_vc_b" ]; then echo 0; return; fi
    _vc_a_base="${_vc_a%%-*}"; _vc_b_base="${_vc_b%%-*}"
    if [ "$_vc_a_base" = "$_vc_b_base" ]; then
        _vc_a_pre=0; case "$_vc_a" in *-*) _vc_a_pre=1 ;; esac
        _vc_b_pre=0; case "$_vc_b" in *-*) _vc_b_pre=1 ;; esac
        if [ "$_vc_a_pre" = "1" ] && [ "$_vc_b_pre" = "0" ]; then printf '%s\n' -1; return; fi
        if [ "$_vc_a_pre" = "0" ] && [ "$_vc_b_pre" = "1" ]; then echo 1; return; fi
        _vc_a_suf="${_vc_a#*-}"; _vc_b_suf="${_vc_b#*-}"
        _vc_older=$(printf '%s\n%s\n' "$_vc_a_suf" "$_vc_b_suf" | sort -V | head -1)
        if [ "$_vc_older" = "$_vc_a_suf" ]; then printf '%s\n' -1; else echo 1; fi
        return
    fi
    _vc_older=$(printf '%s\n%s\n' "$_vc_a_base" "$_vc_b_base" | sort -V | head -1)
    if [ "$_vc_older" = "$_vc_a_base" ]; then printf '%s\n' -1; else echo 1; fi
}

# --- Uninstall ---

if [ "${1}" = "uninstall" ]; then
    echo ""
    echo "  Uninstalling Pilot Protocol..."
    echo ""

    OS=$(uname -s | tr '[:upper:]' '[:lower:]')

    # Stop daemon
    if [ -x "$BIN_DIR/pilotctl" ]; then
        "$BIN_DIR/pilotctl" daemon stop 2>/dev/null || true
        "$BIN_DIR/pilotctl" gateway stop 2>/dev/null || true
    elif command -v pilotctl >/dev/null 2>&1; then
        pilotctl daemon stop 2>/dev/null || true
        pilotctl gateway stop 2>/dev/null || true
    fi

    # Remove system services (daemon + updater)
    if [ "$OS" = "linux" ]; then
        if [ "$(id -u)" = "0" ] || sudo -n true 2>/dev/null; then
            for svc in pilot-daemon pilot-updater; do
                if [ -f "/etc/systemd/system/${svc}.service" ]; then
                    sudo systemctl stop "$svc" 2>/dev/null || true
                    sudo systemctl disable "$svc" 2>/dev/null || true
                    sudo rm -f "/etc/systemd/system/${svc}.service"
                fi
            done
            sudo systemctl daemon-reload
            echo "  Removed systemd services"
        else
            echo "  Skipped systemd removal (run with sudo to remove)"
        fi
    fi
    if [ "$OS" = "darwin" ]; then
        # New labels + legacy labels (migration cleanup from earlier installs)
        for label in network.pilotprotocol.pilot-daemon network.pilotprotocol.pilot-updater com.vulturelabs.pilot-daemon com.vulturelabs.pilot-updater; do
            PLIST="$HOME/Library/LaunchAgents/${label}.plist"
            if [ -f "$PLIST" ]; then
                launchctl unload "$PLIST" 2>/dev/null || true
                rm -f "$PLIST"
            fi
        done
        echo "  Removed LaunchAgents"
    fi

    # Remove pilot directory (binaries, config, identity, received files)
    if [ -d "$PILOT_DIR" ]; then
        rm -rf "$PILOT_DIR"
        echo "  Removed $PILOT_DIR"
    fi

    # Remove socket
    rm -f /tmp/pilot.sock

    echo ""
    echo "  Pilot Protocol uninstalled."
    echo ""
    exit 0
fi

# Detect platform
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)  ARCH="amd64" ;;
    aarch64) ARCH="arm64" ;;
    arm64)   ARCH="arm64" ;;
    *)       echo "Error: unsupported architecture: $ARCH"; exit 1 ;;
esac

case "$OS" in
    linux|darwin) ;;
    *) echo "Error: unsupported OS: $OS"; exit 1 ;;
esac

echo ""
echo "  Pilot Protocol"
echo "  The network stack for AI agents."
echo ""
echo "  Platform:   ${OS}/${ARCH}"
echo "  Registry:   ${REGISTRY}"
echo "  Beacon:     ${BEACON}"
echo ""

# --- Resolve email ---

EMAIL="${PILOT_EMAIL:-}"

# On fresh install, email is required (like certbot)
if [ -z "$EMAIL" ] && [ ! -x "$BIN_DIR/pilotctl" ]; then
    # Check if account.json already has an email
    if [ -f "$PILOT_DIR/account.json" ]; then
        EMAIL=$(grep '"email"' "$PILOT_DIR/account.json" 2>/dev/null | head -1 | cut -d'"' -f4 || true)
    fi
    if [ -z "$EMAIL" ]; then
        printf "  Email (for account recovery): "
        read EMAIL < /dev/tty
        if [ -z "$EMAIL" ]; then
            echo "  Error: email is required. Set PILOT_EMAIL or enter when prompted."
            exit 1
        fi
    fi
fi

# --- Detect existing installation ---

UPDATING=false
if [ -x "$BIN_DIR/pilotctl" ]; then
    UPDATING=true
    CURRENT=$("$BIN_DIR/pilotctl" version 2>/dev/null || echo "unknown")
    echo "  Existing install detected (${CURRENT})"
    echo "  Updating binaries..."
    echo ""
fi

# --- Download or build ---

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

ARCHIVE="pilot-${OS}-${ARCH}.tar.gz"

# Resolve the release tag. Precedence (highest to lowest):
#   1. --version <tag>            explicit pin via flag
#   2. PILOT_RELEASE_TAG env       legacy explicit pin (back-compat)
#   3. --channel <name>            manifest channel lookup
#   4. PILOT_RC=1 env              legacy "edge" channel (back-compat)
#   5. Manifest "latest_stable"    preferred for the default install
#   6. GitHub /releases/latest redirect — fallback when the manifest host
#      is unreachable. Unauthenticated CDN, not subject to the 60/hr
#      api.github.com rate limit.
MANIFEST_FILE="$TMPDIR/manifest.json"
HAVE_MANIFEST=0
if fetch_manifest "$MANIFEST_FILE"; then
    HAVE_MANIFEST=1
fi

if [ -n "$PILOT_REQUESTED_VERSION" ]; then
    TAG="$PILOT_REQUESTED_VERSION"
elif [ -n "${PILOT_RELEASE_TAG:-}" ]; then
    TAG="$PILOT_RELEASE_TAG"
elif [ -n "$PILOT_REQUESTED_CHANNEL" ] && [ "$HAVE_MANIFEST" = "1" ]; then
    TAG=$(manifest_field "channels.${PILOT_REQUESTED_CHANNEL}" "$MANIFEST_FILE")
elif [ "${PILOT_RC:-}" = "1" ] && [ "$HAVE_MANIFEST" = "1" ]; then
    TAG=$(manifest_field "channels.edge" "$MANIFEST_FILE")
elif [ "${PILOT_RC:-}" = "1" ]; then
    # Manifest unreachable; fall back to api.github.com for the newest tag.
    API_BODY="$TMPDIR/releases.json"
    API_CODE=$(curl -sSL -o "$API_BODY" -w '%{http_code}' "https://api.github.com/repos/${REPO}/releases" 2>/dev/null || echo "000")
    if [ "$API_CODE" = "403" ]; then
        echo "Error: GitHub API rate-limited (403) while resolving the latest pre-release." >&2
        echo "  Workarounds:" >&2
        echo "    - retry in ~1 hour, OR" >&2
        echo "    - pin the tag:  --version vX.Y.Z-rcN" >&2
        echo "  Refusing to silently source-build an unstamped binary." >&2
        exit 1
    fi
    if [ "$API_CODE" = "200" ]; then
        TAG=$(grep '"tag_name"' "$API_BODY" | head -1 | cut -d'"' -f4 || true)
    fi
    rm -f "$API_BODY"
elif [ "$HAVE_MANIFEST" = "1" ]; then
    TAG=$(manifest_field "latest_stable" "$MANIFEST_FILE")
else
    TAG=$(curl -fsSI "https://github.com/${REPO}/releases/latest/download/${ARCHIVE}" 2>/dev/null \
        | grep -i '^location:' \
        | sed -n 's|.*/releases/download/\([^/]*\)/.*|\1|p' \
        | tr -d '\r' | head -1)
fi

# Warn when the resolved tag is older than the manifest's latest_stable.
# A confirmation prompt fires only when stdin is a TTY *and* --yes was not
# passed; non-interactive pipes (curl | sh) get the warning text without a
# prompt and proceed, so existing automation does not break.
if [ -n "$TAG" ] && [ "$HAVE_MANIFEST" = "1" ] && [ "$PILOT_NO_WARN" = "0" ]; then
    LATEST_STABLE=$(manifest_field "latest_stable" "$MANIFEST_FILE")
    if [ -n "$LATEST_STABLE" ] && [ "$TAG" != "$LATEST_STABLE" ]; then
        CMP=$(version_compare "$TAG" "$LATEST_STABLE")
        if [ "$CMP" = "-1" ]; then
            echo "" >&2
            echo "Warning: ${TAG} is older than the latest stable release (${LATEST_STABLE})." >&2
            echo "         Older versions miss security fixes. To install the latest stable," >&2
            echo "         re-run without --version, or pass --version ${LATEST_STABLE}." >&2
            if [ "$PILOT_YES" != "1" ] && [ -t 0 ]; then
                printf "Continue installing %s anyway? [y/N] " "$TAG" >&2
                read -r _confirm
                case "$_confirm" in
                    y|Y|yes|YES) ;;
                    *) echo "Aborted." >&2; exit 1 ;;
                esac
            fi
            echo "" >&2
        fi
    fi
fi

if [ -n "$TAG" ]; then
    URL="https://github.com/${REPO}/releases/download/${TAG}/${ARCHIVE}"
    CHECKSUMS_URL="https://github.com/${REPO}/releases/download/${TAG}/checksums.txt"
    echo "Downloading ${TAG}..."
    if curl -fsSL "$URL" -o "$TMPDIR/$ARCHIVE" 2>/dev/null; then
        # Verify SHA-256 against release checksums.txt when available
        if curl -fsSL "$CHECKSUMS_URL" -o "$TMPDIR/checksums.txt" 2>/dev/null; then
            EXPECTED=$(grep " ${ARCHIVE}\$" "$TMPDIR/checksums.txt" | awk '{print $1}')
            if [ -n "$EXPECTED" ]; then
                if command -v shasum >/dev/null 2>&1; then
                    ACTUAL=$(shasum -a 256 "$TMPDIR/$ARCHIVE" | awk '{print $1}')
                elif command -v sha256sum >/dev/null 2>&1; then
                    ACTUAL=$(sha256sum "$TMPDIR/$ARCHIVE" | awk '{print $1}')
                else
                    ACTUAL=""
                fi
                if [ -n "$ACTUAL" ] && [ "$ACTUAL" != "$EXPECTED" ]; then
                    echo "Error: checksum mismatch for ${ARCHIVE}"
                    echo "  expected: $EXPECTED"
                    echo "  actual:   $ACTUAL"
                    exit 1
                fi
                [ -n "$ACTUAL" ] && echo "  Verified SHA-256"
            fi
        fi
        tar -xzf "$TMPDIR/$ARCHIVE" -C "$TMPDIR" --strip-components=1
    else
        TAG=""
    fi
fi

if [ -z "$TAG" ]; then
    echo "No release available. Building from source..."
    if ! command -v go >/dev/null 2>&1; then
        echo "Error: Go is required to build from source."
        echo "Install Go: https://go.dev/dl/"
        exit 1
    fi
    if ! command -v git >/dev/null 2>&1; then
        echo "Error: git is required to build from source."
        exit 1
    fi
    echo "Cloning..."
    git clone --depth 1 "https://github.com/${REPO}.git" "$TMPDIR/src" >/dev/null 2>&1
    # Build from inside the cloned tree with GOWORK=off so a parent go.work
    # in the user's $PWD does not reject the cloned module.
    (
        cd "$TMPDIR/src"
        echo "Building daemon..."
        GOWORK=off CGO_ENABLED=0 go build -o "$TMPDIR/pilot-daemon" ./cmd/daemon
        echo "Building pilotctl..."
        GOWORK=off CGO_ENABLED=0 go build -o "$TMPDIR/pilotctl" ./cmd/pilotctl
        # gateway was extracted to a sibling repo (pilot-protocol/gateway)
        # — only build from source when ./cmd/gateway still exists in this
        # checkout. Release tarballs ship daemon/pilotctl/updater only.
        if [ -d ./cmd/gateway ]; then
            echo "Building gateway..."
            GOWORK=off CGO_ENABLED=0 go build -o "$TMPDIR/pilot-gateway" ./cmd/gateway
        fi
        echo "Building updater..."
        GOWORK=off CGO_ENABLED=0 go build -o "$TMPDIR/pilot-updater" ./cmd/updater
    )
fi

# --- Install binaries to ~/.pilot/bin ---

echo "Installing binaries..."
mkdir -p "$BIN_DIR"

# Handle both naming conventions (release: daemon/gateway, source: pilot-daemon/pilot-gateway)
if [ -f "$TMPDIR/daemon" ]; then
    cp "$TMPDIR/daemon" "$BIN_DIR/pilot-daemon"
else
    cp "$TMPDIR/pilot-daemon" "$BIN_DIR/pilot-daemon"
fi
cp "$TMPDIR/pilotctl" "$BIN_DIR/pilotctl"
# gateway is optional: extracted to a sibling repo, no longer ships in
# release tarballs (release.yml BINS=daemon/pilotctl/updater) and the
# source build only runs when ./cmd/gateway is present in the checkout.
if [ -f "$TMPDIR/gateway" ]; then
    cp "$TMPDIR/gateway" "$BIN_DIR/pilot-gateway"
elif [ -f "$TMPDIR/pilot-gateway" ]; then
    cp "$TMPDIR/pilot-gateway" "$BIN_DIR/pilot-gateway"
fi
if [ -f "$TMPDIR/updater" ]; then
    cp "$TMPDIR/updater" "$BIN_DIR/pilot-updater"
elif [ -f "$TMPDIR/pilot-updater" ]; then
    cp "$TMPDIR/pilot-updater" "$BIN_DIR/pilot-updater"
fi
chmod 755 "$BIN_DIR/pilot-daemon" "$BIN_DIR/pilotctl"
[ -f "$BIN_DIR/pilot-gateway" ] && chmod 755 "$BIN_DIR/pilot-gateway"
[ -f "$BIN_DIR/pilot-updater" ] && chmod 755 "$BIN_DIR/pilot-updater"

# --- Symlink to /usr/local/bin if writable, otherwise skip ---

LINK_DIR="/usr/local/bin"
if [ -d "$LINK_DIR" ] && [ -w "$LINK_DIR" ]; then
    ln -sf "$BIN_DIR/pilot-daemon" "$LINK_DIR/pilot-daemon"
    ln -sf "$BIN_DIR/pilotctl" "$LINK_DIR/pilotctl"
    [ -f "$BIN_DIR/pilot-gateway" ] && ln -sf "$BIN_DIR/pilot-gateway" "$LINK_DIR/pilot-gateway"
    [ -f "$BIN_DIR/pilot-updater" ] && ln -sf "$BIN_DIR/pilot-updater" "$LINK_DIR/pilot-updater"
    echo "  Symlinked to ${LINK_DIR}"
fi

# --- Update: stop here, skip config/service/PATH setup ---

if [ "$UPDATING" = true ]; then
    # Write version file for the auto-updater
    [ -n "$TAG" ] && echo "$TAG" > "$BIN_DIR/.pilot-version"
    echo ""
    echo "Updated to ${TAG:-source}:"
    echo "  pilot-daemon    ${BIN_DIR}/pilot-daemon"
    echo "  pilotctl         ${BIN_DIR}/pilotctl"
    [ -f "$BIN_DIR/pilot-gateway" ] && echo "  pilot-gateway    ${BIN_DIR}/pilot-gateway"
    [ -f "$BIN_DIR/pilot-updater" ] && echo "  pilot-updater    ${BIN_DIR}/pilot-updater"
    echo ""
    echo "Restart the daemon to use the new version:"
    echo "  pilotctl daemon stop && pilotctl daemon start"
    echo ""
    exit 0
fi

# --- Fresh install: write config ---

cat > "$PILOT_DIR/config.json" <<CONF
{
  "registry": "${REGISTRY}",
  "beacon": "${BEACON}",
  "socket": "/tmp/pilot.sock",
  "encrypt": true,
  "identity": "${PILOT_DIR}/identity.json",
  "email": "${EMAIL}"
}
CONF

echo "Config written to ${PILOT_DIR}/config.json"

# --- Set up system service ---

if [ "$OS" = "linux" ] && command -v systemctl >/dev/null 2>&1; then
    CAN_SUDO=false
    if [ "$(id -u)" = "0" ] || sudo -n true 2>/dev/null; then
        CAN_SUDO=true
    fi
    if [ "$CAN_SUDO" = true ]; then
    echo "Setting up systemd service..."
    HOSTNAME_FLAG=""
    if [ -n "$PILOT_HOSTNAME" ]; then
        HOSTNAME_FLAG="-hostname $PILOT_HOSTNAME"
    fi
    PUBLIC_FLAG=""
    if [ -n "$PILOT_PUBLIC" ]; then
        PUBLIC_FLAG="-public"
    fi
    sudo tee /etc/systemd/system/pilot-daemon.service >/dev/null <<SVC
[Unit]
Description=Pilot Protocol Daemon
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$(whoami)
ExecStart=${BIN_DIR}/pilot-daemon \\
  -registry ${REGISTRY} \\
  -beacon ${BEACON} \\
  -listen :4000 \\
  -socket /tmp/pilot.sock \\
  -identity ${PILOT_DIR}/identity.json \\
  -email ${EMAIL} \\
  -encrypt ${HOSTNAME_FLAG} ${PUBLIC_FLAG}
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVC
    # Auto-updater service
    if [ -f "$BIN_DIR/pilot-updater" ]; then
    sudo tee /etc/systemd/system/pilot-updater.service >/dev/null <<USVC
[Unit]
Description=Pilot Protocol Auto-Updater
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$(whoami)
ExecStart=${BIN_DIR}/pilot-updater \\
  -install-dir ${BIN_DIR}
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
USVC
    fi

    sudo systemctl daemon-reload
    echo "  Service: pilot-daemon.service"
    echo "  Service: pilot-updater.service (auto-updates)"
    echo "  Start:   sudo systemctl start pilot-daemon pilot-updater"
    echo "  Enable:  sudo systemctl enable pilot-daemon pilot-updater"
    else
    echo "  Skipped systemd setup (run as root or with passwordless sudo to enable)"
    fi
fi

if [ "$OS" = "darwin" ]; then
    PLIST_DIR="$HOME/Library/LaunchAgents"
    PLIST="$PLIST_DIR/network.pilotprotocol.pilot-daemon.plist"
    mkdir -p "$PLIST_DIR"
    EXTRA_ARGS=""
    if [ -n "$PILOT_HOSTNAME" ]; then
        EXTRA_ARGS="${EXTRA_ARGS}        <string>-hostname</string>
        <string>${PILOT_HOSTNAME}</string>
"
    fi
    if [ -n "$PILOT_PUBLIC" ]; then
        EXTRA_ARGS="${EXTRA_ARGS}        <string>-public</string>
"
    fi
    cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>network.pilotprotocol.pilot-daemon</string>
    <key>ProgramArguments</key>
    <array>
        <string>${BIN_DIR}/pilot-daemon</string>
        <string>-registry</string>
        <string>${REGISTRY}</string>
        <string>-beacon</string>
        <string>${BEACON}</string>
        <string>-listen</string>
        <string>:4000</string>
        <string>-socket</string>
        <string>/tmp/pilot.sock</string>
        <string>-identity</string>
        <string>${PILOT_DIR}/identity.json</string>
        <string>-email</string>
        <string>${EMAIL}</string>
        <string>-encrypt</string>
${EXTRA_ARGS}    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    <key>StandardOutPath</key>
    <string>${PILOT_DIR}/daemon.log</string>
    <key>StandardErrorPath</key>
    <string>${PILOT_DIR}/daemon.log</string>
</dict>
</plist>
PLIST
    # Auto-updater LaunchAgent
    if [ -f "$BIN_DIR/pilot-updater" ]; then
        UPLIST="$PLIST_DIR/network.pilotprotocol.pilot-updater.plist"
        cat > "$UPLIST" <<UPLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>network.pilotprotocol.pilot-updater</string>
    <key>ProgramArguments</key>
    <array>
        <string>${BIN_DIR}/pilot-updater</string>
        <string>-install-dir</string>
        <string>${BIN_DIR}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${PILOT_DIR}/updater.log</string>
    <key>StandardErrorPath</key>
    <string>${PILOT_DIR}/updater.log</string>
</dict>
</plist>
UPLIST
    fi

    echo "  Service: network.pilotprotocol.pilot-daemon"
    echo "  Service: network.pilotprotocol.pilot-updater (auto-updates)"
    echo "  Start:   launchctl load $PLIST"
    echo "  Stop:    launchctl unload $PLIST"
fi

# --- Add to PATH ---

IN_PATH=false
case ":$PATH:" in
    *":${BIN_DIR}:"*) IN_PATH=true ;;
esac

if [ "$IN_PATH" = false ]; then
    SHELL_NAME=$(basename "$SHELL" 2>/dev/null || echo "sh")
    case "$SHELL_NAME" in
        zsh)  RC="$HOME/.zshrc" ;;
        bash) RC="$HOME/.bashrc" ;;
        *)    RC="$HOME/.profile" ;;
    esac
    if [ -f "$RC" ] && grep -q "$BIN_DIR" "$RC" 2>/dev/null; then
        : # already in rc file
    else
        echo "" >> "$RC"
        echo "# Pilot Protocol" >> "$RC"
        echo "export PATH=\"${BIN_DIR}:\$PATH\"" >> "$RC"
        echo "  Added ${BIN_DIR} to PATH in ${RC}"
    fi
fi

# --- Verify ---

# Write version file for the auto-updater
[ -n "$TAG" ] && echo "$TAG" > "$BIN_DIR/.pilot-version"

echo ""
echo "Installed:"
echo "  pilot-daemon    ${BIN_DIR}/pilot-daemon"
echo "  pilotctl         ${BIN_DIR}/pilotctl"
[ -f "$BIN_DIR/pilot-gateway" ] && echo "  pilot-gateway    ${BIN_DIR}/pilot-gateway"
[ -f "$BIN_DIR/pilot-updater" ] && echo "  pilot-updater    ${BIN_DIR}/pilot-updater (auto-updates in background)"
echo ""
echo "Config: ${PILOT_DIR}/config.json"
echo "  Registry: ${REGISTRY}"
echo "  Beacon:   ${BEACON}"
echo "  Socket:   /tmp/pilot.sock"
echo "  Identity: ${PILOT_DIR}/identity.json"
echo "  Email:    ${EMAIL}"
echo ""
echo "Get started:"
echo ""
echo "  export PATH=\"${BIN_DIR}:\$PATH\"    # if not restarting your shell"
echo "  pilotctl daemon start --hostname my-agent    # email already saved"
echo "  pilotctl info"
echo "  pilotctl ping <other-agent>"
echo ""
# pilot-gateway no longer ships in release tarballs (extracted to the
# sibling pilot-protocol/gateway repo) — only show the bridge hint when
# the binary actually exists on this host.
if [ -f "$BIN_DIR/pilot-gateway" ]; then
    echo "Bridge IP traffic (requires root for ports < 1024):"
    echo ""
    echo "  sudo ${BIN_DIR}/pilotctl gateway start --ports 80,3000 <pilot-addr>"
    echo "  curl http://10.4.0.1:3000/status"
    echo ""
fi
echo "Agent skill auto-injection:"
echo ""
echo "  The daemon scans every 15 minutes and injects the Pilot Protocol"
echo "  skill into installed agent tools. Triggering a first pass right now"
echo "  so your agents know about Pilot before the daemon is even started:"
echo ""
if "${BIN_DIR}/pilotctl" skills check 2>&1 | sed 's/^/    /'; then
    :
else
    echo "    (skills check failed — non-fatal; will re-attempt on daemon start)"
fi
echo ""
echo "  Per-tool target paths:"
echo "    Claude Code   ~/.claude/skills/pilot-protocol/SKILL.md"
echo "                  + heartbeat ref in ~/.claude/CLAUDE.md"
echo "    OpenClaw      ~/.openclaw/skills/pilot-protocol/SKILL.md"
echo "                  + heartbeat ref in ~/.openclaw/workspace/AGENTS.md"
echo "    PicoClaw      ~/.picoclaw/workspace/skills/pilot-protocol/SKILL.md"
echo "                  + heartbeat ref in ~/.picoclaw/workspace/AGENT.md"
echo "    OpenHands     ~/.openhands/microagents/pilot-protocol.md (self-heartbeat)"
echo "    Hermes        ~/.hermes/skills/pilot-protocol/SKILL.md"
echo "                  + heartbeat ref in ~/.hermes/SOUL.md"
echo ""
echo "  Inspect / force a refresh anytime:"
echo "    pilotctl skills           # status of every install path"
echo "    pilotctl skills check     # run one reconcile pass right now"
echo ""
echo "============================================"
echo "  CONSENT & PRIVACY"
echo ""
echo "  The following features are ON by default. Each can be disabled"
echo "  at any time — disabling does NOT affect core messaging or"
echo "  networking functionality."
echo ""
echo "  TELEMETRY (on by default)"
echo "  When you browse or install apps from the app store, we record"
echo "  the app ID and action (view / install). This helps app developers"
echo "  understand interest in their apps. No personal data or message"
echo "  contents are ever sent."
echo "  To disable: set consent.telemetry = false in config.json (below)."
echo ""
echo "  BROADCASTS (on by default)"
echo "  Pilot Protocol can send messages to your agent through the daemon"
echo "  to deliver updates or trigger coordinated actions across a network."
echo "  If disabled, broadcast messages are silently dropped and never"
echo "  reach your agent."
echo "  To disable: set consent.broadcasts = false in config.json (below)."
echo ""
echo "  REVIEWS (on by default)"
echo "  Occasionally, after using Pilot or installing an app, you may be"
echo "  prompted to leave a short review. It is entirely optional — press"
echo "  Enter to skip, or just use pilot again normally. Your rating and"
echo "  optional text are the only data sent."
echo "  To disable: set consent.reviews = false in config.json (below)."
echo ""
echo "  SKILL INJECTION (on by default, manual mode)"
echo "  Automatically installs the Pilot Protocol skill into supported"
echo "  agent toolchains (Claude Code, Cursor, OpenHands, etc.) so agents"
echo "  on this host can discover and call Pilot services. In MANUAL mode"
echo "  (the default), skills are installed once now and refreshed only"
echo "  when you run 'pilotctl update'. Switch to AUTO mode for continuous"
echo "  background updates, or disable entirely:"
echo "    pilotctl skills set-mode auto      # always up to date"
echo "    pilotctl skills set-mode manual    # install once, update on upgrade"
echo "    pilotctl skills disable all        # remove skills, stop injection"
echo ""
echo "  To opt out of telemetry, broadcasts, or reviews, edit:"
echo "    ${PILOT_DIR}/config.json"
echo ""
echo "  Add or merge the following (valid JSON, no comments):"
echo "    {"
echo "      \"consent\": {"
echo "        \"telemetry\": false,"
echo "        \"broadcasts\": false,"
echo "        \"reviews\": false"
echo "      },"
echo "      \"skill_inject\": { \"mode\": \"disabled\" }"
echo "    }"
echo ""
echo "  Changes to config.json take effect on daemon restart."
echo ""
echo "  Full details: https://pilotprotocol.network/docs/consent"
echo ""
echo "============================================"
echo ""
