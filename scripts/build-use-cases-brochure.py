#!/usr/bin/env python3
"""Build the Pilot-native use-cases brochure.

The brochure describes deployment patterns created by Pilot's combined
identity, connectivity, trust, network, and app surfaces. It avoids claiming
that no other system could reproduce an individual capability.
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "output" / "pdf" / "pilot-native-use-cases.pdf"
LOGO = ROOT / "public" / "img" / "pilot.png"

PAGE_W, PAGE_H = A4
M = 18 * mm
CONTENT_W = PAGE_W - 2 * M

INK = HexColor("#11110F")
MUTED = HexColor("#5F605B")
LIGHT = HexColor("#8D8E87")
BG = HexColor("#F4F3EE")
CARD = HexColor("#FCFCF8")
LINE = HexColor("#D7D7CF")
LINE_DARK = HexColor("#B8B9B0")
DARK = HexColor("#0C0D0A")
DARK_2 = HexColor("#171914")
WHITE = HexColor("#F7F7F2")
ACCENT = HexColor("#96BF21")
ACCENT_DARK = HexColor("#66850E")
ACCENT_SOFT = HexColor("#EAF4CE")
CYAN = HexColor("#61D1D8")
CYAN_DARK = HexColor("#237A80")
CYAN_SOFT = HexColor("#E4F7F8")
BLUE = HexColor("#72A7FF")
BLUE_SOFT = HexColor("#E9F0FF")
AMBER = HexColor("#D7A04D")
AMBER_SOFT = HexColor("#FAF0DF")


def register_fonts() -> None:
    fonts = {
        "Inter": "/Library/Fonts/Inter-Regular.ttf",
        "Inter-Medium": "/Library/Fonts/Inter-Medium.ttf",
        "Inter-SemiBold": "/Library/Fonts/Inter-SemiBold.ttf",
        "Inter-Bold": "/Library/Fonts/Inter-Bold.ttf",
        "InterTight": "/Library/Fonts/InterTight-Regular.ttf",
        "InterTight-SemiBold": "/Library/Fonts/InterTight-SemiBold.ttf",
        "InterTight-Bold": "/Library/Fonts/InterTight-Bold.ttf",
        "Serif-Italic": "/Library/Fonts/SourceSerifPro-Italic.ttf",
        "Mono": "/Library/Fonts/JetBrainsMono-Regular.ttf",
        "Mono-Medium": "/Library/Fonts/JetBrainsMono-Medium.ttf",
    }
    missing = [path for path in fonts.values() if not Path(path).exists()]
    if missing:
        raise FileNotFoundError(f"Missing font files: {missing}")
    for name, path in fonts.items():
        pdfmetrics.registerFont(TTFont(name, path))


register_fonts()
BASE = getSampleStyleSheet()
STYLES = {
    "kicker": ParagraphStyle("kicker", parent=BASE["BodyText"], fontName="Mono-Medium", fontSize=6.5, leading=8, tracking=1.4, textColor=ACCENT_DARK),
    "title": ParagraphStyle("title", parent=BASE["Heading1"], fontName="InterTight-Bold", fontSize=31, leading=31, textColor=INK),
    "lede": ParagraphStyle("lede", parent=BASE["BodyText"], fontName="Inter", fontSize=10.5, leading=15, textColor=MUTED),
    "h2": ParagraphStyle("h2", parent=BASE["Heading2"], fontName="InterTight-Bold", fontSize=17.5, leading=20, textColor=INK),
    "h3": ParagraphStyle("h3", parent=BASE["Heading3"], fontName="InterTight-SemiBold", fontSize=12, leading=14, textColor=INK),
    "body": ParagraphStyle("body", parent=BASE["BodyText"], fontName="Inter", fontSize=8.2, leading=11.6, textColor=MUTED),
    "body_dark": ParagraphStyle("body_dark", parent=BASE["BodyText"], fontName="Inter", fontSize=8.2, leading=11.6, textColor=HexColor("#CFD2C8")),
    "small": ParagraphStyle("small", parent=BASE["BodyText"], fontName="Inter", fontSize=7, leading=9.6, textColor=MUTED),
    "small_dark": ParagraphStyle("small_dark", parent=BASE["BodyText"], fontName="Inter", fontSize=7, leading=9.6, textColor=HexColor("#CFD2C8")),
    "tiny": ParagraphStyle("tiny", parent=BASE["BodyText"], fontName="Inter", fontSize=6.2, leading=8.2, textColor=LIGHT),
    "mono": ParagraphStyle("mono", parent=BASE["BodyText"], fontName="Mono", fontSize=6.4, leading=8.5, textColor=ACCENT_DARK),
    "cover_title": ParagraphStyle("cover_title", parent=BASE["Heading1"], fontName="InterTight-Bold", fontSize=44, leading=42, textColor=WHITE),
    "cover_lede": ParagraphStyle("cover_lede", parent=BASE["BodyText"], fontName="Inter", fontSize=11.2, leading=16.2, textColor=HexColor("#CFD2C8")),
    "h3_dark": ParagraphStyle("h3_dark", parent=BASE["Heading3"], fontName="InterTight-SemiBold", fontSize=12, leading=14, textColor=WHITE),
}


def para(c: canvas.Canvas, text: str, style: str, x: float, top: float, width: float) -> float:
    p = Paragraph(text, STYLES[style])
    _, height = p.wrap(width, PAGE_H)
    p.drawOn(c, x, top - height)
    return top - height


def page_base(c: canvas.Canvas, number: int, section: str) -> None:
    c.setFillColor(BG)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(M, PAGE_H - 17 * mm, PAGE_W - M, PAGE_H - 17 * mm)
    c.line(M, 15 * mm, PAGE_W - M, 15 * mm)
    c.setFillColor(INK)
    c.setFont("Mono-Medium", 6.4)
    c.drawString(M, PAGE_H - 12.5 * mm, "PILOT / PROTOCOL")
    c.setFillColor(LIGHT)
    c.setFont("Mono", 5.8)
    c.drawRightString(PAGE_W - M, PAGE_H - 12.5 * mm, section.upper())
    c.drawString(M, 10 * mm, "PILOT-NATIVE USE CASES / JULY 2026")
    c.drawRightString(PAGE_W - M, 10 * mm, f"{number:02d}")


def section_title(c: canvas.Canvas, number: str, kicker: str, title: str, lede: str) -> float:
    top = PAGE_H - 27 * mm
    top = para(c, f"{number} / {kicker.upper()}", "kicker", M, top, CONTENT_W)
    top -= 4 * mm
    top = para(c, title, "title", M, top, CONTENT_W * 0.92)
    top -= 3 * mm
    top = para(c, lede, "lede", M, top, CONTENT_W * 0.9)
    return top


def chip(c: canvas.Canvas, x: float, y: float, text: str, color=ACCENT, text_color=INK) -> None:
    width = max(46, pdfmetrics.stringWidth(text.upper(), "Mono-Medium", 5.3) + 14)
    c.setFillColor(color)
    c.roundRect(x, y, width, 14, 7, fill=1, stroke=0)
    c.setFillColor(text_color)
    c.setFont("Mono-Medium", 5.3)
    c.drawCentredString(x + width / 2, y + 4.8, text.upper())


def card(c: canvas.Canvas, x: float, y: float, width: float, height: float, kicker: str, title: str, body: str, color=ACCENT_DARK, fill=CARD, status: str | None = None) -> None:
    c.setFillColor(fill)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.roundRect(x, y, width, height, 7, fill=1, stroke=1)
    c.setFillColor(color)
    c.rect(x, y + height - 3, width, 3, fill=1, stroke=0)
    para(c, kicker.upper(), "kicker", x + 11, y + height - 16, width - 22)
    title_top = y + height - 39
    para(c, title, "h3", x + 11, title_top, width - 22)
    para(c, body, "small", x + 11, title_top - 28, width - 22)
    if status:
        chip(c, x + 11, y + 10, status, ACCENT_SOFT, ACCENT_DARK)


def arrow(c: canvas.Canvas, x1: float, y: float, x2: float, color=LINE_DARK) -> None:
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(1)
    c.line(x1, y, x2 - 5, y)
    c.line(x2 - 9, y + 3, x2 - 5, y)
    c.line(x2 - 9, y - 3, x2 - 5, y)


def node(c: canvas.Canvas, x: float, y: float, width: float, height: float, label: str, detail: str, color=ACCENT, fill=CARD) -> None:
    c.setFillColor(fill)
    c.setStrokeColor(color)
    c.setLineWidth(0.8)
    c.roundRect(x, y, width, height, 6, fill=1, stroke=1)
    para(c, label, "h3", x + 10, y + height - 16, width - 20)
    para(c, detail, "tiny", x + 10, y + 23, width - 20)


def cover(c: canvas.Canvas) -> None:
    c.setFillColor(DARK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setStrokeColor(HexColor("#20231B"))
    c.setLineWidth(0.35)
    step = 24 * mm
    x = 0
    while x <= PAGE_W:
        c.line(x, 0, x, PAGE_H)
        x += step
    y = 0
    while y <= PAGE_H:
        c.line(0, y, PAGE_W, y)
        y += step
    c.setFillColor(ACCENT)
    c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
    if LOGO.exists():
        c.drawImage(str(LOGO), M, PAGE_H - 35 * mm, width=17 * mm, height=17 * mm, preserveAspectRatio=True, mask="auto")
    c.setFillColor(WHITE)
    c.setFont("Mono-Medium", 7)
    c.drawString(M + 21 * mm, PAGE_H - 25 * mm, "PILOT / PROTOCOL")
    c.setFillColor(CYAN)
    c.setFont("Mono-Medium", 6.2)
    c.drawString(M, PAGE_H - 66 * mm, "DEPLOYMENT PATTERN BROCHURE")
    para(c, "What agents can do<br/><font color='#96BF21'>when they have a network.</font>", "cover_title", M, PAGE_H - 79 * mm, CONTENT_W * 0.88)
    para(c, "Pilot-native use cases combine stable identity, encrypted peer reachability, explicit trust, managed network boundaries, and installable agent capabilities.", "cover_lede", M, PAGE_H - 130 * mm, CONTENT_W * 0.72)
    chip(c, M, 61 * mm, "CORE AVAILABLE", ACCENT, INK)
    chip(c, M + 42 * mm, 61 * mm, "ENTERPRISE EARLY ACCESS", AMBER, INK)
    c.setFillColor(LIGHT)
    c.setFont("Mono", 6.2)
    c.drawString(M, 35 * mm, "PILOT-NATIVE USE CASES / JULY 2026")
    c.drawString(M, 29 * mm, "CURRENT PRODUCT + EVALUATION BOUNDARIES")
    c.setStrokeColor(HexColor("#33382A"))
    c.circle(PAGE_W - 38 * mm, 34 * mm, 27 * mm, fill=0, stroke=1)
    c.circle(PAGE_W - 38 * mm, 34 * mm, 18 * mm, fill=0, stroke=1)
    c.setFillColor(CYAN)
    c.circle(PAGE_W - 20 * mm, 21 * mm, 3, fill=1, stroke=0)


def page_intersection(c: canvas.Canvas) -> None:
    page_base(c, 2, "The capability intersection")
    top = section_title(c, "01", "WHY PILOT-NATIVE", "The value is in the combination.", "Each ingredient exists elsewhere in some form. Pilot's differentiated surface is the combination of agent identity, cross-boundary reachability, trust, network controls, and app discovery in one operating model.")
    gap = 4 * mm
    w = (CONTENT_W - gap) / 2
    h = 39 * mm
    y1 = top - 11 * mm - h
    card(c, M, y1, w, h, "Stable identity", "Address survives infrastructure changes", "A persistent virtual address decouples an agent from its current IP, cloud, NAT, or machine location.", ACCENT_DARK, status="core")
    card(c, M + w + gap, y1, w, h, "Encrypted reach", "Direct when possible; relay when needed", "Peers use X25519-derived AES-256-GCM tunnels and NAT traversal without requiring a shared VPN fabric.", CYAN_DARK, status="core")
    y2 = y1 - gap - h
    card(c, M, y2, w, h, "Explicit admission", "Trust and network membership", "Private nodes gate application traffic through peer trust or an applicable group-level network grant.", HexColor("#597BAE"), status="core")
    card(c, M + w + gap, y2, w, h, "Installable capabilities", "Discover, verify, install, invoke", "Agent-facing apps add reviewed capabilities to the same environment where agents discover and reach peers.", HexColor("#A36E22"), status="core")
    y3 = y2 - gap - 29 * mm
    c.setFillColor(DARK)
    c.roundRect(M, y3, CONTENT_W, 29 * mm, 7, fill=1, stroke=0)
    para(c, "WHAT 'PILOT-NATIVE' MEANS", "kicker", M + 12, y3 + 25 * mm, CONTENT_W - 24)
    para(c, "A workflow is Pilot-native when it uses the network identity, reachability, trust, and capability surfaces together - reducing the custom glue normally required between separate networking, discovery, and agent-tool systems.", "body_dark", M + 12, y3 + 19 * mm, CONTENT_W - 24)
    c.setFillColor(HexColor("#CFD2C8"))
    c.setFont("Inter", 6.5)
    c.drawString(M + 12, y3 + 6 * mm, "This is a product-positioning definition, not a claim that another stack could never reproduce an individual component.")


def page_supply_chain(c: canvas.Canvas) -> None:
    page_base(c, 3, "Cross-organization supply chain")
    top = section_title(c, "02", "CROSS-ORGANIZATION OPERATIONS", "A narrow agent room across company lines.", "Create a shared network for a specific operational relationship, keep each agent's identity stable, and place business approval above the network connection.")
    y = top - 32 * mm
    nw = 34 * mm
    nh = 27 * mm
    xs = [M, M + 44 * mm, M + 88 * mm, M + 132 * mm]
    node(c, xs[0], y, nw, nh, "Buyer agent", "Demand, approved supplier list", ACCENT)
    node(c, xs[1], y, nw, nh, "Pilot network", "Identity, trust, ports, encrypted path", CYAN, CYAN_SOFT)
    node(c, xs[2], y, nw, nh, "Supplier agent", "Availability, quote, order status", BLUE, BLUE_SOFT)
    node(c, xs[3], y, nw, nh, "Business systems", "ERP, limits, signatures, records", AMBER, AMBER_SOFT)
    for i in range(3):
        arrow(c, xs[i] + nw, y + nh / 2, xs[i + 1], ACCENT_DARK if i == 0 else LINE_DARK)
    c.setFillColor(LIGHT)
    c.setFont("Mono", 5.6)
    c.drawCentredString(PAGE_W / 2, y - 9, "CONNECTIVITY PATH AND BUSINESS AUTHORITY REMAIN SEPARATE")

    block_y = y - 78 * mm
    col_w = (CONTENT_W - 5 * mm) / 2
    card(c, M, block_y, col_w, 59 * mm, "Pilot contributes", "A governed connectivity boundary", "- Persistent agent identities<br/>- Encrypted cross-NAT reachability<br/>- Group membership and revocation<br/>- Enterprise port policy and audit export<br/>- Stable addresses as infrastructure moves", ACCENT_DARK, status="core + EA")
    card(c, M + col_w + 5 * mm, block_y, col_w, 59 * mm, "Your systems retain", "The authority to transact", "- Approved suppliers and counterparties<br/>- Quote and order limits<br/>- Human approval thresholds<br/>- Inventory and financial records<br/>- Legal commitments and retention", CYAN_DARK, status="application")
    call_y = block_y - 27 * mm
    c.setFillColor(AMBER_SOFT)
    c.setStrokeColor(AMBER)
    c.roundRect(M, call_y, CONTENT_W, 20 * mm, 6, fill=1, stroke=1)
    para(c, "SAFE DEPLOYMENT PATTERN", "kicker", M + 11, call_y + 15 * mm, 47 * mm)
    para(c, "Use narrow membership, allowed ports, application scopes, counterparty rules, order caps, and human approval for consequential transactions.", "small", M + 56 * mm, call_y + 15 * mm, CONTENT_W - 67 * mm)


def page_mcp(c: canvas.Canvas) -> None:
    page_base(c, 4, "Private MCP and service endpoints")
    top = section_title(c, "03", "SERVICE CONNECTIVITY", "Give MCP servers a network address, not a public ingress project.", "An MCP server or internal service can sit behind NAT, move between a laptop and cloud runtime, and remain reachable through the Pilot address and trust model.")
    center_y = top - 59 * mm
    left_x = M
    mid_x = M + 62 * mm
    right_x = M + 124 * mm
    node(c, left_x, center_y, 47 * mm, 37 * mm, "Agent client", "Local, cloud, CI, or edge runtime", ACCENT)
    node(c, mid_x, center_y, 47 * mm, 37 * mm, "Encrypted overlay", "Trust, NAT traversal, direct or relay path", CYAN, CYAN_SOFT)
    node(c, right_x, center_y, 47 * mm, 37 * mm, "MCP / service", "Private endpoint with stable Pilot address", BLUE, BLUE_SOFT)
    arrow(c, left_x + 47 * mm, center_y + 18.5 * mm, mid_x, ACCENT_DARK)
    arrow(c, mid_x + 47 * mm, center_y + 18.5 * mm, right_x, CYAN_DARK)

    row_y = center_y - 50 * mm
    w = (CONTENT_W - 8 * mm) / 3
    card(c, M, row_y, w, 37 * mm, "No public listener", "Private reachability", "Avoid exposing the application directly to the public internet solely to make it agent-reachable.", ACCENT_DARK, status="core")
    card(c, M + w + 4 * mm, row_y, w, 37 * mm, "No shared VPN", "Agent-level identity", "Connect the relevant processes rather than granting broad device or subnet access.", CYAN_DARK, status="core")
    card(c, M + 2 * (w + 4 * mm), row_y, w, 37 * mm, "Stable routing", "Location independent", "Keep the same virtual address while the underlying IP or environment changes between sessions.", HexColor("#597BAE"), status="core")

    c.setFillColor(DARK)
    c.roundRect(M, 31 * mm, CONTENT_W, 35 * mm, 7, fill=1, stroke=0)
    para(c, "WHERE THIS HELPS", "kicker", M + 12, 58 * mm, 38 * mm)
    para(c, "Private developer tools, database helpers, model services, browser workers, build systems, edge controllers, and MCP servers that should be reachable by approved agents without a bespoke public endpoint for each deployment.", "body_dark", M + 50 * mm, 58 * mm, CONTENT_W - 62 * mm)


def page_mobility(c: canvas.Canvas) -> None:
    page_base(c, 5, "Ephemeral and moving compute")
    top = section_title(c, "04", "IDENTITY THAT OUTLIVES LOCATION", "Move the process. Keep the address.", "Pilot separates an agent's virtual identity from its current public IP. That is useful for temporary compute, developer machines, autoscaled workers, and edge environments that do not stay in one place.")
    line_y = top - 44 * mm
    x1 = M + 7 * mm
    x2 = PAGE_W / 2 - 17 * mm
    x3 = PAGE_W - M - 41 * mm
    node(c, x1, line_y, 41 * mm, 31 * mm, "Laptop", "Private NAT, changing Wi-Fi", ACCENT)
    node(c, x2, line_y, 41 * mm, 31 * mm, "Cloud worker", "Ephemeral VM or container", CYAN, CYAN_SOFT)
    node(c, x3, line_y, 41 * mm, 31 * mm, "Edge runtime", "Restricted inbound network", BLUE, BLUE_SOFT)
    arrow(c, x1 + 41 * mm, line_y + 15.5 * mm, x2, LINE_DARK)
    arrow(c, x2 + 41 * mm, line_y + 15.5 * mm, x3, LINE_DARK)
    chip(c, PAGE_W / 2 - 38, line_y + 36 * mm, "SAME PILOT IDENTITY", ACCENT, INK)

    box_y = line_y - 57 * mm
    col_w = (CONTENT_W - 5 * mm) / 2
    card(c, M, box_y, col_w, 45 * mm, "What remains stable", "The agent-facing address", "Peers can address the same identity rather than rediscovering a new IP or rebuilding a custom route every time the runtime changes.", ACCENT_DARK, status="core")
    card(c, M + col_w + 5 * mm, box_y, col_w, 45 * mm, "What is re-established", "The current network path", "The daemon registers its current endpoint and establishes a new direct, relay, or compatibility path. Existing live connections do not migrate automatically.", CYAN_DARK, status="boundary")

    c.setStrokeColor(LINE)
    c.line(M, box_y - 13 * mm, PAGE_W - M, box_y - 13 * mm)
    para(c, "PRACTICAL PATTERNS", "kicker", M, box_y - 20 * mm, CONTENT_W)
    patterns = [
        ("Burst workers", "Create short-lived compute that can still be addressed and trusted as part of a longer-running agent workflow."),
        ("Developer to production", "Move a service from a local machine to a managed runtime without changing the logical destination used by peers."),
        ("Edge fleets", "Reach approved agents behind restrictive networks while preferring a direct path and retaining encrypted relay fallback."),
    ]
    pw = (CONTENT_W - 8 * mm) / 3
    for i, (title, body) in enumerate(patterns):
        card(c, M + i * (pw + 4 * mm), 29 * mm, pw, 32 * mm, f"0{i+1}", title, body, [ACCENT_DARK, CYAN_DARK, HexColor("#597BAE")][i])


def page_apps(c: canvas.Canvas) -> None:
    page_base(c, 6, "Agent-native capability delivery")
    top = section_title(c, "05", "DISCOVER TO INVOKE", "Capabilities arrive through the same agent-facing surface.", "Pilot combines an agent app catalog with the network environment, so a capable agent can discover an app, inspect the listing, install a verified package, and invoke a typed method.")
    y = top - 35 * mm
    labels = [
        ("Discover", "Search by capability", ACCENT, ACCENT_SOFT),
        ("Evaluate", "Listing and publisher context", BLUE, BLUE_SOFT),
        ("Verify", "Review, signature, digest pin", CYAN, CYAN_SOFT),
        ("Install", "Agent-operable package", AMBER, AMBER_SOFT),
        ("Invoke", "Typed methods and results", ACCENT, ACCENT_SOFT),
    ]
    nw = 30 * mm
    gap = 6 * mm
    for i, (title, detail, color, fill) in enumerate(labels):
        x = M + i * (nw + gap)
        node(c, x, y, nw, 27 * mm, title, detail, color, fill)
        if i < len(labels) - 1:
            arrow(c, x + nw, y + 13.5 * mm, x + nw + gap, LINE_DARK)
    c.setFillColor(LIGHT)
    c.setFont("Mono", 5.6)
    c.drawCentredString(PAGE_W / 2, y - 9, "DISCOVERY AND PACKAGE VERIFICATION DO NOT REPLACE RUNTIME AUTHORIZATION")

    row_y = y - 53 * mm
    w = (CONTENT_W - 8 * mm) / 3
    card(c, M, row_y, w, 40 * mm, "Specialist agents", "Ask the right peer", "Reach a purpose-built peer for research, data, operations, or another narrow domain instead of teaching every agent every skill.", ACCENT_DARK, status="pattern")
    card(c, M + w + 4 * mm, row_y, w, 40 * mm, "Local capability", "Bring the tool to the agent", "Install a reviewed native tool near the agent's files or compute while keeping the invocation surface typed and discoverable.", CYAN_DARK, status="pattern")
    card(c, M + 2 * (w + 4 * mm), row_y, w, 40 * mm, "Managed integration", "Broker when the provider requires it", "Use a managed app where upstream credentials, metering, or provider APIs require a brokered rather than peer-tunnel path.", HexColor("#A36E22"), status="pattern")

    c.setFillColor(CARD)
    c.setStrokeColor(LINE)
    c.roundRect(M, 30 * mm, CONTENT_W, 35 * mm, 7, fill=1, stroke=1)
    para(c, "CONTROL CHECK", "kicker", M + 12, 57 * mm, 40 * mm)
    para(c, "Package review answers whether an app may be listed. Network trust answers whether endpoints may connect. Application policy answers which methods, data, spend, credentials, and side effects are allowed at runtime.", "body", M + 48 * mm, 57 * mm, CONTENT_W - 60 * mm)


def page_governance(c: canvas.Canvas) -> None:
    page_base(c, 7, "Governance and security")
    top = section_title(c, "06", "CONTROL THE CONNECTION AND THE CONSEQUENCE", "A layered authority model.", "Pilot provides enforceable network boundaries and evidence. Production governance also needs an application authority layer and an operating program around ownership, review, and incident response.")
    y = top - 15 * mm
    layers = [
        ("Identity", "Who is this daemon?", "Ed25519 identity; external identity context in enterprise early access.", ACCENT_DARK, "CORE + EA"),
        ("Admission", "May it connect?", "Peer trust or shared-network membership; strict pre-trust controls are configurable.", CYAN_DARK, "CORE"),
        ("Network policy", "Where may it connect?", "Roles, join rules, membership caps, tags, and allowed ports in enterprise early access.", HexColor("#597BAE"), "EA"),
        ("Application policy", "What may it do?", "Task scopes, protected data, spend, counterparties, human approvals, and legal authority.", HexColor("#A36E22"), "CUSTOMER"),
        ("Evidence", "What changed?", "Registry events and enterprise export correlated with application and business records.", ACCENT_DARK, "CORE + EA"),
    ]
    h = 27 * mm
    gap = 3 * mm
    for i, (name, question, body, color, status) in enumerate(layers):
        ly = y - (i + 1) * h - i * gap
        c.setFillColor(CARD)
        c.setStrokeColor(LINE)
        c.roundRect(M, ly, CONTENT_W, h, 6, fill=1, stroke=1)
        c.setFillColor(color)
        c.rect(M, ly, 3, h, fill=1, stroke=0)
        para(c, name.upper(), "kicker", M + 13, ly + h - 10, 35 * mm)
        para(c, question, "h3", M + 48 * mm, ly + h - 10, 42 * mm)
        para(c, body, "small", M + 91 * mm, ly + h - 10, 68 * mm)
        chip(c, PAGE_W - M - 44 * mm, ly + 8, status, ACCENT_SOFT if "CORE" in status else AMBER_SOFT, ACCENT_DARK if "CORE" in status else HexColor("#8A5A1B"))

    note_y = 24 * mm
    c.setFillColor(DARK)
    c.roundRect(M, note_y, CONTENT_W, 24 * mm, 7, fill=1, stroke=0)
    para(c, "PRIMARY RULE", "kicker", M + 12, note_y + 18 * mm, 34 * mm)
    para(c, "Connectivity is not permission to act.", "h3_dark", M + 47 * mm, note_y + 18 * mm, 55 * mm)
    para(c, "Keep consequential authority explicit in the application and organization.", "small_dark", M + 104 * mm, note_y + 18 * mm, CONTENT_W - 116 * mm)


def page_evaluate(c: canvas.Canvas) -> None:
    page_base(c, 8, "Evaluation map")
    top = section_title(c, "07", "START WITH A BOUNDED WORKFLOW", "Turn the use case into evidence.", "The strongest evaluation starts with a narrow workflow, names each authority boundary, exercises failure and revocation, and decides from captured evidence rather than a connectivity demo alone.")
    y = top - 8 * mm
    rows = [
        ("Cross-company supply chain", "Strong candidate", "Narrow network membership + app approvals", "Counterparty authority, order caps, records"),
        ("Private MCP / internal service", "Strong candidate", "Stable private address + trust", "Tool scopes, data permissions, secrets"),
        ("Ephemeral agent workers", "Strong candidate", "Persistent identity + refreshed path", "Workload ownership and credential lifecycle"),
        ("Specialist agent network", "Candidate", "Peer discovery + encrypted reach", "Result quality, provenance, method authorization"),
        ("Agent app delivery", "Candidate", "Review + signature + digest pin", "Runtime scopes, spend, side effects"),
        ("Regulated production", "Evidence-led", "Dedicated model + managed controls", "Assurance, residency, retention, contracts"),
    ]
    cols = [56 * mm, 29 * mm, 51 * mm, CONTENT_W - 136 * mm]
    headers = ["PATTERN", "FIT", "PILOT LAYER", "RETAINED AUTHORITY"]
    row_h = 17 * mm
    table_top = y
    x = M
    c.setFillColor(DARK)
    c.rect(M, table_top - 10 * mm, CONTENT_W, 10 * mm, fill=1, stroke=0)
    cx = M
    for i, header in enumerate(headers):
        c.setFillColor(WHITE)
        c.setFont("Mono-Medium", 5.3)
        c.drawString(cx + 7, table_top - 6.2 * mm, header)
        cx += cols[i]
    y0 = table_top - 10 * mm
    for r, values in enumerate(rows):
        ry = y0 - (r + 1) * row_h
        c.setFillColor(CARD if r % 2 == 0 else HexColor("#EFEEE8"))
        c.rect(M, ry, CONTENT_W, row_h, fill=1, stroke=0)
        c.setStrokeColor(LINE)
        c.line(M, ry, PAGE_W - M, ry)
        cx = M
        for i, value in enumerate(values):
            style = "small" if i != 1 else "mono"
            para(c, value, style, cx + 7, ry + row_h - 7, cols[i] - 14)
            cx += cols[i]

    call_y = y0 - len(rows) * row_h - 36 * mm
    c.setFillColor(ACCENT_SOFT)
    c.setStrokeColor(ACCENT)
    c.roundRect(M, call_y, CONTENT_W, 28 * mm, 7, fill=1, stroke=1)
    para(c, "A PRACTICAL FIRST EVALUATION", "kicker", M + 12, call_y + 22 * mm, 50 * mm)
    para(c, "1. Model the data and authority. &nbsp;&nbsp; 2. Configure identity, trust, and policy. &nbsp;&nbsp; 3. Exercise revocation and failure. &nbsp;&nbsp; 4. Export evidence. &nbsp;&nbsp; 5. Decide with named owners.", "body", M + 58 * mm, call_y + 22 * mm, CONTENT_W - 70 * mm)

    link_y = 23 * mm
    c.setFillColor(DARK)
    c.roundRect(M, link_y, CONTENT_W, 25 * mm, 7, fill=1, stroke=0)
    para(c, "EVALUATE THE REAL BOUNDARY", "kicker", M + 12, link_y + 19 * mm, 48 * mm)
    para(c, "<link href='https://pilotprotocol.network/contact?topic=enterprise' color='#96BF21'><b>pilotprotocol.network/contact</b></link><br/><font color='#CFD2C8'>Trust Center / Governance / Roadmap / Enterprise Readiness Report</font>", "body", M + 59 * mm, link_y + 19 * mm, CONTENT_W - 71 * mm)


def build(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output), pagesize=A4, pageCompression=1)
    c.setTitle("Pilot-native Use Cases")
    c.setAuthor("Calin Teodor")
    c.setSubject("Deployment patterns enabled by Pilot Protocol identity, connectivity, trust, and app capabilities")
    c.setKeywords("Pilot Protocol, use cases, agents, networking, governance, enterprise")
    pages = [cover, page_intersection, page_supply_chain, page_mcp, page_mobility, page_apps, page_governance, page_evaluate]
    for index, draw in enumerate(pages):
        draw(c)
        if index < len(pages) - 1:
            c.showPage()
    c.save()


def main() -> int:
    output = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_OUTPUT
    build(output)
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
