#!/usr/bin/env python3
"""Build the Pilot Protocol Enterprise Readiness Report.

The PDF is a current-state technical evaluator for security, infrastructure,
and architecture teams. It intentionally distinguishes generally available
core controls from enterprise early-access controls and customer-owned policy.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "output" / "pdf" / "enterprise-readiness-report.pdf"
LOGO = ROOT / "public" / "img" / "pilot.png"

PAGE_W, PAGE_H = A4
MARGIN_X = 18 * mm
MARGIN_TOP = 20 * mm
MARGIN_BOTTOM = 18 * mm
CONTENT_W = PAGE_W - (2 * MARGIN_X)

INK = HexColor("#11110F")
MUTED = HexColor("#5F605B")
LIGHT_MUTED = HexColor("#8D8E87")
ACCENT = HexColor("#96BF21")
ACCENT_DARK = HexColor("#66850E")
CYAN = HexColor("#61D1D8")
BLUE = HexColor("#72A7FF")
AMBER = HexColor("#D7A04D")
RED = HexColor("#C76655")
BG = HexColor("#F4F3EE")
CARD = HexColor("#FCFCF8")
LINE = HexColor("#D7D7CF")
LINE_DARK = HexColor("#B8B9B0")
DARK = HexColor("#0C0D0A")
DARK_2 = HexColor("#171914")
WHITE = HexColor("#F7F7F2")


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
    pdfmetrics.registerFontFamily(
        "Inter",
        normal="Inter",
        bold="Inter-Bold",
        italic="Inter",
        boldItalic="Inter-Bold",
    )


register_fonts()


BASE = getSampleStyleSheet()
STYLES = {
    "body": ParagraphStyle(
        "Body",
        parent=BASE["BodyText"],
        fontName="Inter",
        fontSize=8.8,
        leading=12.4,
        textColor=INK,
        spaceAfter=6,
    ),
    "body_small": ParagraphStyle(
        "BodySmall",
        parent=BASE["BodyText"],
        fontName="Inter",
        fontSize=7.4,
        leading=10.5,
        textColor=MUTED,
        spaceAfter=4,
    ),
    "body_tiny": ParagraphStyle(
        "BodyTiny",
        parent=BASE["BodyText"],
        fontName="Inter",
        fontSize=6.6,
        leading=9.0,
        textColor=MUTED,
    ),
    "eyebrow": ParagraphStyle(
        "Eyebrow",
        parent=BASE["BodyText"],
        fontName="Mono-Medium",
        fontSize=6.7,
        leading=9,
        tracking=1.5,
        textColor=ACCENT_DARK,
        spaceAfter=7,
    ),
    "h1": ParagraphStyle(
        "H1",
        parent=BASE["Heading1"],
        fontName="InterTight-Bold",
        fontSize=27,
        leading=27.5,
        textColor=INK,
        spaceAfter=9,
    ),
    "h2": ParagraphStyle(
        "H2",
        parent=BASE["Heading2"],
        fontName="InterTight-Bold",
        fontSize=17.5,
        leading=20.5,
        textColor=INK,
        spaceBefore=5,
        spaceAfter=7,
    ),
    "h3": ParagraphStyle(
        "H3",
        parent=BASE["Heading3"],
        fontName="Inter-SemiBold",
        fontSize=10.7,
        leading=13,
        textColor=INK,
        spaceAfter=4,
    ),
    "card_title": ParagraphStyle(
        "CardTitle",
        parent=BASE["Heading3"],
        fontName="InterTight-Bold",
        fontSize=12.8,
        leading=14.5,
        textColor=INK,
        spaceAfter=4,
    ),
    "mono": ParagraphStyle(
        "Mono",
        parent=BASE["BodyText"],
        fontName="Mono",
        fontSize=6.6,
        leading=9,
        textColor=ACCENT_DARK,
    ),
    "table": ParagraphStyle(
        "Table",
        parent=BASE["BodyText"],
        fontName="Inter",
        fontSize=7.0,
        leading=9.4,
        textColor=INK,
    ),
    "table_small": ParagraphStyle(
        "TableSmall",
        parent=BASE["BodyText"],
        fontName="Inter",
        fontSize=6.25,
        leading=8.3,
        textColor=INK,
    ),
    "table_head": ParagraphStyle(
        "TableHead",
        parent=BASE["BodyText"],
        fontName="Mono-Medium",
        fontSize=6.2,
        leading=8,
        tracking=0.7,
        textColor=WHITE,
    ),
    "cover_brand": ParagraphStyle(
        "CoverBrand",
        parent=BASE["BodyText"],
        fontName="Mono-Medium",
        fontSize=8.2,
        leading=11,
        tracking=1.2,
        textColor=WHITE,
    ),
    "cover_label": ParagraphStyle(
        "CoverLabel",
        parent=BASE["BodyText"],
        fontName="Mono-Medium",
        fontSize=7.2,
        leading=10,
        tracking=1.8,
        textColor=CYAN,
    ),
    "cover_title": ParagraphStyle(
        "CoverTitle",
        parent=BASE["Heading1"],
        fontName="InterTight-Bold",
        fontSize=43,
        leading=42,
        textColor=WHITE,
        spaceAfter=12,
    ),
    "cover_sub": ParagraphStyle(
        "CoverSub",
        parent=BASE["BodyText"],
        fontName="Inter",
        fontSize=12,
        leading=17,
        textColor=HexColor("#CFD2C8"),
    ),
    "cover_meta": ParagraphStyle(
        "CoverMeta",
        parent=BASE["BodyText"],
        fontName="Mono",
        fontSize=7.2,
        leading=11,
        textColor=HexColor("#B7BAAF"),
    ),
    "big_quote": ParagraphStyle(
        "BigQuote",
        parent=BASE["BodyText"],
        fontName="InterTight-SemiBold",
        fontSize=14.2,
        leading=18,
        textColor=INK,
    ),
    "italic": ParagraphStyle(
        "Italic",
        parent=BASE["BodyText"],
        fontName="Serif-Italic",
        fontSize=15,
        leading=18,
        textColor=ACCENT_DARK,
    ),
}


def P(text: str, style: str = "body") -> Paragraph:
    return Paragraph(text, STYLES[style])


def section_header(number: str, label: str, title: str, intro: str) -> list[Flowable]:
    return [
        P(f"{number} / {label.upper()}", "eyebrow"),
        P(title, "h1"),
        P(intro, "body"),
        Spacer(1, 5 * mm),
    ]


def bullets(items: list[str], style: str = "body_small", left: float = 13) -> ListFlowable:
    return ListFlowable(
        [ListItem(P(item, style), leftIndent=left, bulletColor=ACCENT_DARK) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=left,
        bulletFontName="Inter-SemiBold",
        bulletFontSize=7,
        bulletColor=ACCENT_DARK,
        spaceAfter=4,
    )


def chip(text: str, color: colors.Color = ACCENT, dark_text: bool = True) -> Table:
    fg = INK if dark_text else WHITE
    t = Table([[P(text.upper(), "table_head")]], colWidths=[None])
    t.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Inter"),
                ("BACKGROUND", (0, 0), (-1, -1), color),
                ("TEXTCOLOR", (0, 0), (-1, -1), fg),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    return t


def callout(title: str, body: str, color: colors.Color = ACCENT) -> Table:
    data = [[P(title, "h3"), P(body, "body_small")]]
    table = Table(data, colWidths=[47 * mm, CONTENT_W - 47 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Inter"),
                ("BACKGROUND", (0, 0), (-1, -1), CARD),
                ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                ("LINEBEFORE", (0, 0), (0, -1), 4, color),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return table


def card(title: str, state: str, body: str, color: colors.Color = ACCENT) -> list[Flowable]:
    status_style = ParagraphStyle(
        f"status-{title}",
        parent=STYLES["mono"],
        textColor=color,
        fontName="Mono-Medium",
        fontSize=6.1,
        leading=8,
        spaceAfter=10,
    )
    return [Paragraph(state.upper(), status_style), P(title, "card_title"), P(body, "body_small")]


def card_grid(cards: list[list[Flowable]], columns: int = 2, row_height: float | None = None) -> Table:
    rows: list[list[object]] = []
    for idx in range(0, len(cards), columns):
        row: list[object] = cards[idx : idx + columns]
        while len(row) < columns:
            row.append("")
        rows.append(row)
    gap = 4 * mm
    col_width = (CONTENT_W - gap * (columns - 1)) / columns
    widths: list[float] = []
    for i in range(columns):
        widths.append(col_width)
        if i < columns - 1:
            widths.append(gap)
    expanded: list[list[object]] = []
    for row in rows:
        out: list[object] = []
        for i, item in enumerate(row):
            out.append(item)
            if i < columns - 1:
                out.append("")
        expanded.append(out)
    table = Table(
        expanded,
        colWidths=widths,
        rowHeights=[row_height] * len(expanded) if row_height else None,
        hAlign="LEFT",
    )
    style = [
        ("FONTNAME", (0, 0), (-1, -1), "Inter"),
        ("BACKGROUND", (0, 0), (-1, -1), CARD),
        ("BOX", (0, 0), (-1, -1), 0.0, CARD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]
    for row_idx in range(len(expanded)):
        for col_idx in range(0, len(widths), 2):
            style.extend(
                [
                    ("BACKGROUND", (col_idx, row_idx), (col_idx, row_idx), CARD),
                    ("BOX", (col_idx, row_idx), (col_idx, row_idx), 0.7, LINE),
                    ("LEFTPADDING", (col_idx, row_idx), (col_idx, row_idx), 11),
                    ("RIGHTPADDING", (col_idx, row_idx), (col_idx, row_idx), 11),
                    ("TOPPADDING", (col_idx, row_idx), (col_idx, row_idx), 10),
                    ("BOTTOMPADDING", (col_idx, row_idx), (col_idx, row_idx), 10),
                ]
            )
        for gap_col in range(1, len(widths), 2):
            style.extend(
                [
                    ("BACKGROUND", (gap_col, row_idx), (gap_col, row_idx), BG),
                    ("LEFTPADDING", (gap_col, row_idx), (gap_col, row_idx), 0),
                    ("RIGHTPADDING", (gap_col, row_idx), (gap_col, row_idx), 0),
                ]
            )
    table.setStyle(TableStyle(style))
    return table


def data_table(
    headers: list[str],
    rows: list[list[str]],
    widths: list[float],
    small: bool = False,
    status_col: int | None = None,
) -> Table:
    body_style = "table_small" if small else "table"
    data: list[list[Paragraph]] = [[P(h.upper(), "table_head") for h in headers]]
    for row in rows:
        data.append([P(cell, body_style) for cell in row])
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table_style: list[tuple] = [
        ("FONTNAME", (0, 0), (-1, -1), "Inter"),
        ("BACKGROUND", (0, 0), (-1, 0), DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("BACKGROUND", (0, 1), (-1, -1), CARD),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CARD, HexColor("#F0F0EA")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    if status_col is not None:
        table_style.append(("FONTNAME", (status_col, 1), (status_col, -1), "Mono-Medium"))
    table.setStyle(TableStyle(table_style))
    return table


class ArchitectureDiagram(Flowable):
    def __init__(self, width: float, height: float = 190):
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, avail_width: float, avail_height: float) -> tuple[float, float]:
        return min(self.width, avail_width), self.height

    def draw_box(self, x: float, y: float, w: float, h: float, label: str, title: str, detail: str, accent: colors.Color = LINE_DARK) -> None:
        c = self.canv
        c.setFillColor(CARD)
        c.setStrokeColor(accent)
        c.setLineWidth(0.8)
        c.roundRect(x, y, w, h, 6, fill=1, stroke=1)
        c.setFillColor(ACCENT_DARK)
        c.setFont("Mono-Medium", 5.7)
        c.drawString(x + 10, y + h - 14, label.upper())
        c.setFillColor(INK)
        c.setFont("InterTight-Bold", 12)
        c.drawString(x + 10, y + h - 31, title)
        c.setFillColor(MUTED)
        c.setFont("Inter", 6.5)
        c.drawString(x + 10, y + 10, detail)

    def draw(self) -> None:
        c = self.canv
        w = self.width
        endpoint_w = 96
        center_x = 118
        center_w = w - 236
        self.draw_box(0, 55, endpoint_w, 80, "Endpoint", "Agent A", "Ed25519 identity")
        self.draw_box(w - endpoint_w, 55, endpoint_w, 80, "Endpoint", "Agent B", "Ed25519 identity")

        c.setFillColor(HexColor("#EEF7D9"))
        c.setStrokeColor(ACCENT)
        c.roundRect(center_x, 105, center_w, 62, 6, fill=1, stroke=1)
        c.setFillColor(ACCENT_DARK)
        c.setFont("Mono-Medium", 5.7)
        c.drawString(center_x + 10, 153, "COORDINATION PLANE")
        c.setFillColor(INK)
        c.setFont("InterTight-Bold", 10.5)
        c.drawString(center_x + 10, 136, "Registry + beacon")
        c.setFillColor(MUTED)
        c.setFont("Inter", 6.1)
        c.drawString(center_x + 10, 119, "Identity, discovery, endpoints, NAT assistance, relay")

        c.setFillColor(HexColor("#EAF8F8"))
        c.setStrokeColor(CYAN)
        c.roundRect(center_x, 24, center_w, 62, 6, fill=1, stroke=1)
        c.setFillColor(HexColor("#237A80"))
        c.setFont("Mono-Medium", 5.7)
        c.drawString(center_x + 10, 72, "PAYLOAD PLANE")
        c.setFillColor(INK)
        c.setFont("InterTight-Bold", 10.5)
        c.drawString(center_x + 10, 55, "Encrypted peer tunnel")
        c.setFillColor(MUTED)
        c.setFont("Inter", 6.1)
        c.drawString(center_x + 10, 38, "X25519 + AES-256-GCM; direct preferred, relay fallback")

        c.setStrokeColor(ACCENT_DARK)
        c.setLineWidth(1.0)
        c.line(endpoint_w, 138, center_x, 138)
        c.line(center_x + center_w, 138, w - endpoint_w, 138)
        c.setStrokeColor(HexColor("#237A80"))
        c.setLineWidth(1.4)
        c.line(endpoint_w, 55, center_x, 55)
        c.line(center_x + center_w, 55, w - endpoint_w, 55)

        c.setFillColor(LIGHT_MUTED)
        c.setFont("Mono", 5.5)
        c.drawCentredString(w / 2, 4, "CONTROL METADATA AND PAYLOAD CIPHERTEXT HAVE DIFFERENT VISIBILITY BOUNDARIES")


class AuditPipeline(Flowable):
    def __init__(self, width: float, height: float = 98):
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, avail_width: float, avail_height: float) -> tuple[float, float]:
        return min(self.width, avail_width), self.height

    def draw(self) -> None:
        c = self.canv
        labels = [
            ("State change", "registry mutation"),
            ("Audit entry", "context + hash fields"),
            ("Local query", "1,000-entry ring"),
            ("External export", "Splunk / CEF / JSON"),
        ]
        gap = 12
        box_w = (self.width - gap * 3) / 4
        for i, (title, detail) in enumerate(labels):
            x = i * (box_w + gap)
            fill = CARD if i != 1 else HexColor("#EEF7D9")
            stroke = LINE if i != 1 else ACCENT
            c.setFillColor(fill)
            c.setStrokeColor(stroke)
            c.roundRect(x, 26, box_w, 58, 5, fill=1, stroke=1)
            c.setFillColor(ACCENT_DARK)
            c.setFont("Mono-Medium", 5.2)
            c.drawString(x + 8, 71, f"0{i + 1}")
            c.setFillColor(INK)
            c.setFont("InterTight-Bold", 8.8)
            c.drawString(x + 8, 52, title)
            c.setFillColor(MUTED)
            c.setFont("Inter", 5.7)
            c.drawString(x + 8, 36, detail)
            if i < 3:
                c.setStrokeColor(LINE_DARK)
                c.line(x + box_w + 2, 55, x + box_w + gap - 2, 55)
                c.setFillColor(LINE_DARK)
                c.circle(x + box_w + gap - 3, 55, 1.5, fill=1, stroke=0)
        c.setFillColor(LIGHT_MUTED)
        c.setFont("Mono", 5.4)
        c.drawCentredString(self.width / 2, 5, "ASYNCHRONOUS DELIVERY REQUIRES EXTERNAL MONITORING OF RETRY, DROP, AND DLQ COUNTERS")


class Timeline(Flowable):
    def __init__(self, width: float, height: float = 125):
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, avail_width: float, avail_height: float) -> tuple[float, float]:
        return min(self.width, avail_width), self.height

    def draw(self) -> None:
        c = self.canv
        steps = [
            ("01", "Model", "architecture + data"),
            ("02", "Configure", "identity + policy"),
            ("03", "Exercise", "failure + revocation"),
            ("04", "Decide", "evidence + owners"),
        ]
        gap = 10
        box_w = (self.width - gap * 3) / 4
        y = 27
        for i, (num, title, detail) in enumerate(steps):
            x = i * (box_w + gap)
            c.setFillColor(CARD)
            c.setStrokeColor(ACCENT if i < 3 else CYAN)
            c.roundRect(x, y, box_w, 78, 6, fill=1, stroke=1)
            c.setFillColor(ACCENT_DARK if i < 3 else HexColor("#237A80"))
            c.setFont("Mono-Medium", 6.1)
            c.drawString(x + 9, y + 61, num)
            c.setFillColor(INK)
            c.setFont("InterTight-Bold", 11)
            c.drawString(x + 9, y + 40, title)
            c.setFillColor(MUTED)
            c.setFont("Inter", 6.1)
            c.drawString(x + 9, y + 20, detail)
        c.setFillColor(LIGHT_MUTED)
        c.setFont("Mono", 5.6)
        c.drawCentredString(self.width / 2, 6, "A SHORT EVALUATION SHOULD PRODUCE REPEATABLE EVIDENCE, NOT ONLY A CONNECTIVITY DEMO")


def draw_metadata(canvas) -> None:
    canvas.setTitle("Enterprise Readiness Report: Pilot Protocol")
    canvas.setAuthor("Calin Teodor")
    canvas.setSubject("Pilot Protocol enterprise security and deployment readiness")
    canvas.setKeywords("Pilot Protocol, enterprise, security, identity, policy, audit, AI agents")


def cover_page(canvas, doc) -> None:
    draw_metadata(canvas)
    canvas.saveState()
    canvas.setFillColor(DARK)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setStrokeColor(HexColor("#20231B"))
    canvas.setLineWidth(0.35)
    grid = 24 * mm
    x = 0
    while x <= PAGE_W:
        canvas.line(x, 0, x, PAGE_H)
        x += grid
    y = 0
    while y <= PAGE_H:
        canvas.line(0, y, PAGE_W, y)
        y += grid
    canvas.setFillColor(ACCENT)
    canvas.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
    canvas.setFillColor(CYAN)
    canvas.circle(PAGE_W - 42, 44, 6, fill=1, stroke=0)
    canvas.setStrokeColor(HexColor("#33382A"))
    canvas.setLineWidth(1)
    canvas.circle(PAGE_W - 80, 110, 58, fill=0, stroke=1)
    canvas.circle(PAGE_W - 80, 110, 84, fill=0, stroke=1)
    canvas.restoreState()


def body_page(canvas, doc) -> None:
    draw_metadata(canvas)
    canvas.saveState()
    canvas.setFillColor(BG)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(MARGIN_X, PAGE_H - 14 * mm, PAGE_W - MARGIN_X, PAGE_H - 14 * mm)
    canvas.setFillColor(INK)
    canvas.setFont("Mono-Medium", 6.4)
    canvas.drawString(MARGIN_X, PAGE_H - 10.5 * mm, "PILOT / PROTOCOL")
    canvas.setFillColor(MUTED)
    canvas.setFont("Mono", 5.8)
    canvas.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 10.5 * mm, "ENTERPRISE READINESS REPORT / JULY 2026")
    canvas.setStrokeColor(LINE)
    canvas.line(MARGIN_X, 12 * mm, PAGE_W - MARGIN_X, 12 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Mono", 5.8)
    canvas.drawString(MARGIN_X, 7.8 * mm, "TECHNICAL EVALUATION GUIDE")
    canvas.drawRightString(PAGE_W - MARGIN_X, 7.8 * mm, f"{doc.page:02d}")
    canvas.restoreState()


def cover_story() -> list[Flowable]:
    logo = Image(str(LOGO), width=14 * mm, height=14 * mm)
    brand = Table(
        [[logo, P("PILOT / PROTOCOL<br/><font color='#A8AAA1'>WHERE AGENTS GO</font>", "cover_brand")]],
        colWidths=[17 * mm, 70 * mm],
        hAlign="LEFT",
    )
    brand.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Inter"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    cover_chip_style = ParagraphStyle(
        "CoverChip",
        parent=STYLES["cover_meta"],
        fontName="Mono-Medium",
        fontSize=6.2,
        leading=8,
        textColor=WHITE,
        alignment=TA_CENTER,
    )
    chips = Table(
        [[
            Paragraph("CORE AVAILABLE", cover_chip_style),
            Paragraph("ENTERPRISE EARLY ACCESS", cover_chip_style),
            Paragraph("REPORT 2.1 / JULY 2026", cover_chip_style),
        ]],
        colWidths=[43 * mm, 55 * mm, 48 * mm],
        hAlign="LEFT",
    )
    chips.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Inter"),
                ("BACKGROUND", (0, 0), (0, 0), ACCENT_DARK),
                ("BACKGROUND", (1, 0), (1, 0), HexColor("#765A23")),
                ("BACKGROUND", (2, 0), (2, 0), HexColor("#244E51")),
                ("BOX", (0, 0), (-1, -1), 0.6, HexColor("#4A4E42")),
                ("INNERGRID", (0, 0), (-1, -1), 0.6, HexColor("#4A4E42")),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return [
        brand,
        Spacer(1, 43 * mm),
        P("ENTERPRISE READINESS REPORT", "cover_label"),
        P("Security and control,<br/><font color='#96BF21'>built into the network.</font>", "cover_title"),
        P(
            "Identity, encrypted transport, trust, policy, audit, and deployment boundaries for autonomous agent infrastructure.",
            "cover_sub",
        ),
        Spacer(1, 14 * mm),
        chips,
        Spacer(1, 35 * mm),
        P("A current-state guide for security, infrastructure, and architecture teams.", "cover_sub"),
        Spacer(1, 9 * mm),
        P("CALIN TEODOR / VULTURE LABS<br/>PILOTPROTOCOL.NETWORK", "cover_meta"),
        Spacer(1, 5 * mm),
        P("This report is a technical evaluation guide. Enterprise controls are early access and should be validated against the intended deployment.", "cover_meta"),
        PageBreak(),
    ]


def executive_snapshot() -> list[Flowable]:
    controls = [
        card("Core network controls", "Available", "Persistent identity, encrypted tunnels, private-node traffic admission, mutual trust, NAT traversal, and connection hardening.", ACCENT_DARK),
        card("Managed controls", "Enterprise early access", "RBAC, identity provider integration, directory sync, port policy, audit export, blueprints, and operational metrics.", AMBER),
        card("Application authority", "Customer configured", "Task scopes, approval flows, spend limits, data retention, model safety, and legal authority remain application responsibilities.", BLUE),
        card("Production evidence", "Deployment specific", "Firewall behavior, relay usage, failover, load, incident response, data residency, and contractual requirements require environment testing.", CYAN),
    ]
    rows = [
        ["Encrypted agent traffic", "Available", "X25519 key agreement and AES-256-GCM per tunnel."],
        ["Peer trust and revocation", "Available", "Private-node streams and datagrams require bilateral approval or shared-network trust; reject, untrust, and tunnel teardown are supported."],
        ["Network policy", "Early access", "Membership caps, allowed ports, member tags, and programmable expression policies."],
        ["Enterprise identity", "Early access", "OIDC/JWT validation, external ID mapping, provider webhooks, and directory sync."],
        ["Administrative governance", "Early access", "Owner/admin/member roles, scoped tokens, invites, key lifecycle, and blueprints."],
        ["Audit and SIEM", "Early access", "Structured events, query buffer, Splunk HEC, CEF/Syslog, JSON, webhooks, and metrics."],
        ["Independent certification", "Current status", "No independent security certification is listed in the current public materials."],
    ]
    story = section_header(
        "01",
        "Executive snapshot",
        "A practical readiness view.",
        "Pilot combines open-source agent networking software with optional hosted coordination. The core protocol secures peer connectivity; enterprise early access adds organizational identity, policy, administration, and audit controls.",
    )
    story += [
        callout(
            "Bottom line",
            "Pilot is ready for structured enterprise evaluation. A production decision should consider the core network controls and the operating model around them: identity source, policy ownership, audit retention, failover, incident response, and application-level authorization.",
        ),
        Spacer(1, 5 * mm),
        card_grid(controls, columns=2, row_height=34 * mm),
        Spacer(1, 6 * mm),
        P("READINESS SUMMARY", "eyebrow"),
        data_table(["Area", "Status", "Current position"], rows, [43 * mm, 34 * mm, CONTENT_W - 77 * mm], small=True, status_col=1),
        Spacer(1, 3 * mm),
        P("Status labels describe the public product surface as of July 2026; they do not replace a deployment-specific security review.", "body_tiny"),
        PageBreak(),
    ]
    return story


def architecture_page() -> list[Flowable]:
    story = section_header(
        "02",
        "Architecture boundary",
        "Peer traffic and coordination are separate concerns.",
        "Pilot prefers direct encrypted tunnels for agent traffic while using coordination services for registration, discovery, endpoint exchange, NAT assistance, and relay fallback. This distinction defines the operational and metadata boundary.",
    )
    modes = [
        ["Public coordination", "Default", "Pilot-operated registry and beacon. Fastest path to evaluation."],
        ["Configurable endpoints", "Core", "Registry and beacon addresses are configuration values in the client and daemon."],
        ["Dedicated deployment", "Early access", "Organization-specific coordination for isolation and operational control."],
        ["On-premises model", "Early access", "Evaluate packaging, ownership, upgrades, backups, and support requirements."],
    ]
    story += [
        ArchitectureDiagram(CONTENT_W, 48 * mm),
        Spacer(1, 6 * mm),
        P("VISIBILITY BOUNDARIES", "eyebrow"),
        card_grid(
            [
                card("Coordination metadata", "Registry + beacon", "Registry operations process registration metadata, public keys, advertised endpoints, timing, and network membership.", ACCENT_DARK),
                card("Relay path", "Encrypted payload", "A relay observes timing and packet metadata, carries ciphertext, and does not receive tunnel keys.", CYAN),
                card("Endpoint content", "Agent controlled", "Application payload is visible to its endpoints. Tool permissions and business authority remain above the network layer.", BLUE),
                card("Path selection", "Environment dependent", "Direct UDP is preferred; NAT, firewall, or compatibility constraints can select relay or outbound TLS paths.", AMBER),
            ],
            columns=2,
        ),
        Spacer(1, 6 * mm),
        P("DEPLOYMENT OPTIONS", "eyebrow"),
        data_table(["Mode", "Availability", "Evaluation note"], modes, [42 * mm, 33 * mm, CONTENT_W - 75 * mm], small=True, status_col=1),
        Spacer(1, 4 * mm),
        callout("Architecture review", "Document which coordination mode is in scope, whether relay fallback is allowed, which metadata can leave the environment, and who owns availability and incident response for each component.", CYAN),
        PageBreak(),
    ]
    return story


def core_controls_page() -> list[Flowable]:
    story = section_header(
        "03",
        "Core security controls",
        "Security travels with the connection.",
        "The core protocol provides identity, encrypted transport, trust gating, and connection hardening without requiring enterprise mode. These controls form the baseline for every deployment.",
    )
    story += [
        card_grid(
            [
                card("Persistent identity", "Ed25519", "Each agent keeps a stable keypair across IP, cloud, container, and process changes. Signed operations and handshakes bind actions to that identity.", ACCENT_DARK),
                card("Encrypted transport", "X25519 + AES-256-GCM", "Tunnel secrets are established per peer and payloads are authenticated and encrypted by default. Production profiles should prevent the explicit plaintext test override.", CYAN),
                card("Mutual trust", "Application access", "Private nodes admit streams and datagrams through bilateral approval or shared network membership. Requests can be approved, rejected, and revoked.", BLUE),
                card("Private discovery", "Endpoint gating", "Open directory lookups withhold private endpoints. Some directory metadata can remain visible and should be reviewed for the deployment.", AMBER),
                card("Connection hardening", "Protocol defenses", "Rate limits, connection caps, duplicate-handshake handling, and message limits reduce resource abuse. Optional strict controls extend pre-trust checks.", ACCENT_DARK),
                card("Package verification", "Agent-native apps", "Native services are SHA-256 pinned and signature-verified before installation. AEGIS can add an optional prompt-injection gate.", BLUE),
            ],
            columns=2,
            row_height=34 * mm,
        ),
        Spacer(1, 6 * mm),
        P("CONTROL NOTES", "eyebrow"),
        data_table(
            ["Control", "Behavior", "Deployment note"],
            [
                ["Trust gate", "Applied before an untrusted peer opens a connection.", "Test every exposed port, compatibility path, and relay mode."],
                ["Pre-trust strict mode", "Opt-in gates cover key exchange and control, private directory operations, and punch authorization.", "Enable the daemon, registry, and beacon controls together after compatibility testing."],
                ["Trust persistence", "Approved peers survive daemon restart until revoked.", "Include trust state in backup and incident-response procedures."],
                ["Key lifecycle", "Rotation is available; expiry is part of managed controls.", "Define rotation cadence and recovery authority before rollout."],
                ["Compatibility", "Outbound TLS/443 mode supports restrictive firewalls.", "Confirm the security and metadata boundary for the selected mode."],
                ["Application controls", "Network trust permits connectivity, not arbitrary business action.", "Enforce task, data, tool, and transaction permissions above Pilot."],
            ],
            [35 * mm, 66 * mm, CONTENT_W - 101 * mm],
            small=True,
        ),
        Spacer(1, 5 * mm),
        callout("Authority boundary", "A trusted connection means the endpoints may communicate under network policy. It does not by itself authorize purchases, payments, data disclosure, contractual commitments, or other consequential actions.", AMBER),
        PageBreak(),
    ]
    return story


def identity_access_page() -> list[Flowable]:
    story = section_header(
        "04",
        "Identity and access",
        "Built-in identity, connected to enterprise context.",
        "Enterprise early access layers organizational identity and administration on top of Pilot's persistent cryptographic identity. The result is a mapping between an agent address, an external identity, and a network role.",
    )
    rows = [
        ["Built-in identity", "Available", "Ed25519 keypair, signed mutations, key metadata, rotation, and authenticated handshakes."],
        ["OIDC / JWT", "Early access", "Native RS256 and HS256 validation with issuer, audience, expiry, not-before, and 60-second skew checks."],
        ["JWKS", "Early access", "Key selection by kid, 5-minute cache, 64 KB response cap, and fail-closed validation when keys are unavailable."],
        ["Provider integrations", "Early access", "OIDC/JWT and provider webhooks are native; SAML, Entra ID, and LDAP connect through OIDC or an external bridge/webhook."],
        ["External IDs", "Early access", "Map a node to an email, UPN, LDAP DN, or another directory identifier for audit and role assignment."],
        ["Directory sync", "Early access", "Update roles, remove unlisted members, and store role pre-assignments for identities that join later."],
        ["Key expiry", "Early access", "Expired identities are blocked from heartbeat; rotation and expiry must be operated as separate lifecycle actions."],
    ]
    roles = [
        card("Owner", "One per network", "Full network control, including role changes, ownership transfer, policy, and deletion.", ACCENT_DARK),
        card("Admin", "Delegated operator", "Invite and remove members, manage settings, and set policies within role boundaries.", BLUE),
        card("Member", "Standard access", "Communicate under network policy without administrative authority.", CYAN),
    ]
    story += [
        data_table(["Layer", "Status", "Current control"], rows, [39 * mm, 31 * mm, CONTENT_W - 70 * mm], small=True, status_col=1),
        Spacer(1, 6 * mm),
        P("ROLE MODEL", "eyebrow"),
        card_grid(roles, columns=3, row_height=34 * mm),
        Spacer(1, 6 * mm),
        P("AUTHORIZATION CHAIN", "eyebrow"),
        callout(
            "Layered administration",
            "Global admin token -> per-network admin token -> owner/admin/member role -> Ed25519 signature for identity-changing operations. Each mechanism has a different scope; production runbooks should specify which principals may use each one.",
            BLUE,
        ),
        Spacer(1, 4 * mm),
        P("Identity-provider configuration is registry-global in the current public control model: setting a new provider replaces the previous registry configuration. Organizations requiring per-network issuers or trust domains should validate that requirement during evaluation.", "body_small"),
        Spacer(1, 3 * mm),
        P("Native SPIFFE Workload API and SVID enrollment are not listed in the current public control set. Workload-attestation requirements should be mapped to OIDC/JWT, provider integration, or a deployment-specific extension.", "body_small"),
        PageBreak(),
    ]
    return story


def policy_governance_page() -> list[Flowable]:
    policy_rows = [
        ["Membership cap", "MaxMembers", "Rejects joins and invite acceptance when capacity is reached."],
        ["Port allowlist", "AllowedPorts", "Only listed Pilot ports are accepted; unlisted ports are silently dropped."],
        ["Programmable policy", "expr v1", "Rules evaluate membership events and can shape joins and trust links."],
        ["Member context", "Tags", "Admin-assigned, per-network labels supply policy inputs."],
        ["Declarative setup", "Blueprint", "Validates and applies network, policy, identity, webhook, audit, and role configuration."],
        ["Persistence", "Snapshot + HA", "Static and expression policies persist and replicate to configured standby registries."],
    ]
    authority = Table(
        [[
            [P("PILOT NETWORK AUTHORITY", "eyebrow"), P("Pilot controls", "card_title"), bullets([
                "Agent identity and signed network operations",
                "Peer trust, network membership, and port access",
                "Roles, scoped administration, and key lifecycle",
                "Structured network and security events",
            ], "body_small")],
            [P("APPLICATION AUTHORITY", "eyebrow"), P("Your system controls", "card_title"), bullets([
                "Which task or tool an agent may execute",
                "Data classification, retention, and disclosure",
                "Spend, order, counterparty, and approval limits",
                "Model safety, legal authority, and compliance",
            ], "body_small")],
        ]],
        colWidths=[(CONTENT_W - 4 * mm) / 2] * 2,
        hAlign="LEFT",
    )
    authority.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Inter"),
                ("BACKGROUND", (0, 0), (-1, -1), CARD),
                ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.7, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 11),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )
    story = section_header(
        "05",
        "Policy and governance",
        "Network policy supports the workflow; it does not define the workflow.",
        "Enterprise early access adds network-scoped controls for membership, ports, roles, and programmable rules. Application authorization remains a separate layer by design.",
    )
    story += [
        data_table(["Control", "Interface", "Enforcement"], policy_rows, [38 * mm, 31 * mm, CONTENT_W - 69 * mm], small=True),
        Spacer(1, 6 * mm),
        authority,
        Spacer(1, 6 * mm),
        P("REVOCATION PATHS", "eyebrow"),
        data_table(
            ["Action", "Scope", "Runbook consideration"],
            [
                ["Untrust", "One bilateral peer relationship", "Tears down the associated trust path and tunnel."],
                ["Kick / directory removal", "Membership in one network", "Removes membership-based access; separately established trust should be reviewed."],
                ["Key expiry", "Identity heartbeat lifecycle", "Blocks expired identities from heartbeating; define recovery and renewal steps."],
                ["Deregister", "Registry identity", "Broader removal path; test effects on networks, invites, audit, and reconnect behavior."],
            ],
            [37 * mm, 48 * mm, CONTENT_W - 85 * mm],
            small=True,
        ),
        Spacer(1, 4 * mm),
        callout("Cross-company workflows", "Combine narrow network membership and port policy with application scopes, counterparty rules, spend or order caps, and human approval for consequential actions.", AMBER),
        PageBreak(),
    ]
    return story


def audit_operations_page() -> list[Flowable]:
    story = section_header(
        "06",
        "Audit and operations",
        "Evidence is generated at the network control plane.",
        "Registry state changes produce structured events with action-specific context. Enterprise early access adds export, webhook reliability, query, and operational telemetry for integration with existing monitoring systems.",
    )
    story += [
        AuditPipeline(CONTENT_W, 28 * mm),
        Spacer(1, 6 * mm),
        data_table(
            ["Capability", "Current behavior", "Operational note"],
            [
                ["Structured events", "Timestamp, action, node/network IDs, and old/new context where applicable.", "Use JSON logging or external export for machine ingestion."],
                ["Query buffer", "Most recent 1,000 registry entries; included in snapshots when persistence is enabled.", "A finite operational buffer, not an unlimited compliance archive."],
                ["JSON integrity", "External JSON entries include prev_hash and hash chain fields.", "Retain and verify exported data outside the registry."],
                ["SIEM export", "Splunk HEC, CEF/Syslog, or generic JSON over asynchronous delivery.", "1,024-event buffer; 3 retries with exponential backoff; monitor dropped counters."],
                ["Webhooks", "Unique event IDs, retry behavior, status counters, and a redacted dead-letter queue.", "No automatic DLQ replay; define ownership and recovery procedures."],
                ["Metrics", "Audit, webhook, identity, policy, RBAC, and per-network Prometheus metrics.", "Alert on error, drop, DLQ, replication, and policy-load signals."],
                ["High availability", "Push-based standby replication with authenticated subscription and snapshot state.", "Exercise failover, rollback, backup, and version compatibility."],
            ],
            [38 * mm, 70 * mm, CONTENT_W - 108 * mm],
            small=True,
        ),
        Spacer(1, 6 * mm),
        P("EVENT COVERAGE", "eyebrow"),
        card_grid(
            [
                card("Identity and keys", "Examples", "Registration, removal, rotation, expiry, external IDs, providers, and directory sync.", ACCENT_DARK),
                card("Networks and policy", "Examples", "Lifecycle, ownership, policy, member tags, and blueprint provisioning.", BLUE),
                card("Trust and access", "Examples", "Handshakes, trust changes, invites, roles, removal, visibility, and membership.", CYAN),
                card("Delivery health", "Examples", "Export to an external SIEM for durable retention; monitor delivery, webhooks, the dead-letter queue, and errors.", AMBER),
            ],
            columns=2,
        ),
        PageBreak(),
    ]
    return story


def controls_matrix_page() -> list[Flowable]:
    rows = [
        ["Agent identity", "Ed25519 keypair and signatures", "External IDs, key expiry", "Available / EA"],
        ["Tunnel security", "X25519 + AES-256-GCM", "Policy-aware managed networks", "Available"],
        ["Peer access", "Mutual trust, reject, untrust", "Roles, invites, membership controls", "Available / EA"],
        ["Discovery privacy", "Private endpoints withheld", "Dedicated coordination options", "Available / EA"],
        ["Enterprise identity", "Built-in identity only", "OIDC/JWT, provider webhook, directory sync", "EA"],
        ["Administrative roles", "Admin tokens", "Owner, admin, member; scoped token", "EA"],
        ["Network policy", "Membership boundary", "Caps, ports, expression rules, member tags", "EA"],
        ["Revocation", "Bilateral untrust", "Kick, directory removal, expiry", "Available / EA"],
        ["Audit", "Structured logs and events", "Query, export, DLQ, hash fields", "EA"],
        ["Provisioning", "CLI and configuration", "Idempotent JSON blueprints", "EA"],
        ["Operations", "Health and protocol metrics", "Per-network metrics, standby replication", "Available / EA"],
        ["Package integrity", "Review, checksum, signature", "Optional AEGIS runtime gate", "Available"],
        ["Certification", "Technical controls published", "Independent certification not listed", "Evaluate"],
        ["Business authority", "Outside network layer", "Customer-defined application controls", "Customer"],
    ]
    story = section_header(
        "07",
        "Control status matrix",
        "One view of the current surface.",
        "The matrix separates core protocol behavior from enterprise early-access controls and customer-owned application policy. 'EA' means available for evaluation, not represented here as generally available with a standard SLA.",
    )
    story += [
        data_table(
            ["Area", "Core", "Enterprise / managed", "Status"],
            rows,
            [34 * mm, 47 * mm, 73 * mm, CONTENT_W - 154 * mm],
            small=True,
            status_col=3,
        ),
        Spacer(1, 7 * mm),
        P("STATUS LEGEND", "eyebrow"),
        card_grid(
            [
                card("Available", "Core", "Published implementation and current product behavior.", ACCENT_DARK),
                card("Early access", "EA", "Available for evaluation with Pilot; rollout and support are deployment specific.", AMBER),
                card("Customer", "Application / operations", "Configured and operated by the deploying organization.", BLUE),
                card("Evaluate", "Evidence required", "Validate against contractual, regulatory, and production requirements.", CYAN),
            ],
            columns=2,
            row_height=35 * mm,
        ),
        Spacer(1, 6 * mm),
        callout("Version discipline", "Tie the control matrix to an exact deployed release, registry configuration, daemon flags, and network blueprint. Re-evaluate after protocol, policy, or infrastructure changes.", ACCENT),
        PageBreak(),
    ]
    return story


def use_cases_page() -> list[Flowable]:
    scenarios = [
        card("Internal agent lab", "Strong evaluation fit", "Use private agents, explicit trust, isolated networks, and low-consequence tools. Confirm installer consent settings and package policy.", ACCENT_DARK),
        card("Single-organization pilot", "Candidate", "Add enterprise identity, RBAC, port policy, SIEM export, a revocation runbook, and environment-specific NAT/firewall tests.", BLUE),
        card("Cross-organization workflow", "Guardrails required", "Use narrow network membership and app-level scopes. Treat commercial authority, data sharing, and transaction approval as separate controls.", AMBER),
        card("Regulated production", "Evidence-led review", "Assess dedicated infrastructure, residency, retention, support, independent assurance, incident response, change control, and contractual terms.", CYAN),
    ]
    story = section_header(
        "08",
        "Deployment scenarios",
        "Readiness depends on the consequence of the workflow.",
        "The same network control can be sufficient for a low-risk internal pilot and insufficient for a regulated or financially consequential workflow. Scope the evaluation around the actions agents can take, not only the packets they can exchange.",
    )
    story += [
        card_grid(scenarios, columns=2, row_height=36 * mm),
        Spacer(1, 7 * mm),
        P("CROSS-ORGANIZATION PATTERN", "eyebrow"),
        data_table(
            ["Step", "Control", "Purpose"],
            [
                ["1", "Separate network or dedicated deployment", "Create an explicit collaboration boundary."],
                ["2", "Verified identities and named owners", "Make counterparties and administrative authority traceable."],
                ["3", "Narrow port and expression policy", "Limit the communication surface to required services."],
                ["4", "Application scopes and transaction limits", "Constrain what a connected agent can actually do."],
                ["5", "Human approval for consequential actions", "Keep contract, payment, and disclosure authority controlled."],
                ["6", "Exported audit and incident contacts", "Support evidence, investigation, and coordinated revocation."],
            ],
            [16 * mm, 68 * mm, CONTENT_W - 84 * mm],
            small=True,
        ),
        Spacer(1, 7 * mm),
        callout("Supply-chain example", "A practical first deployment is a narrowly scoped workflow such as order-status exchange or inventory reconciliation, with allowlisted peers, limited ports, bounded actions, and approval for exceptions.", ACCENT),
        Spacer(1, 4 * mm),
        P("The network layer can make cross-boundary communication secure and observable. The deploying organizations still decide which statements, orders, prices, payments, and commitments are valid.", "body_small"),
        PageBreak(),
    ]
    return story


def evaluation_plan_page() -> list[Flowable]:
    story = section_header(
        "09",
        "Evaluation plan",
        "Turn the pilot into evidence.",
        "A short enterprise evaluation should produce a reviewed architecture, repeatable configuration, tested failure behavior, and named operational owners. The sequence below can be completed in a focused pilot.",
    )
    criteria = [
        ["Architecture", "Document direct, relay, compatibility, coordination, and metadata paths.", "Reviewed data-flow diagram and deployment bill of materials."],
        ["Identity", "Validate key lifecycle, external identity mapping, token failure, and recovery.", "Positive and negative identity tests with assigned owners."],
        ["Policy", "Exercise membership, ports, tags, expression rules, invites, and role boundaries.", "Default-deny test cases and repeatable blueprint."],
        ["Revocation", "Test untrust, kick, directory removal, expiry, deregistration, and reconnect.", "Measured propagation time and documented authority."],
        ["Audit", "Confirm event coverage, export, retry, drops, DLQ, retention, and alerting.", "Events visible in the chosen SIEM with failure alerts."],
        ["Network", "Test NAT types, firewall rules, relay fallback, latency, and load.", "Environment-specific connectivity and performance results."],
        ["Operations", "Exercise restart, snapshot restore, standby failover, upgrade, and rollback.", "Runbook with recovery objectives and evidence."],
        ["Application", "Apply task scopes, data policy, transaction limits, and approval gates.", "End-to-end scenario with consequential actions blocked by default."],
    ]
    story += [
        Timeline(CONTENT_W, 34 * mm),
        Spacer(1, 7 * mm),
        P("ACCEPTANCE CRITERIA", "eyebrow"),
        data_table(["Area", "Test", "Expected evidence"], criteria, [30 * mm, 74 * mm, CONTENT_W - 104 * mm], small=True),
        Spacer(1, 7 * mm),
        P("RECOMMENDED DELIVERABLES", "eyebrow"),
        card_grid(
            [
                card("Architecture pack", "Design", "Component diagram, data flow, trust boundaries, deployment mode, and ownership map.", ACCENT_DARK),
                card("Control pack", "Configuration", "Blueprint, identity settings, role matrix, policy rules, and key lifecycle.", BLUE),
                card("Evidence pack", "Testing", "Positive/negative cases, performance results, failover, audit samples, and issue log.", CYAN),
                card("Operations pack", "Runbooks", "Provisioning, rotation, revocation, backup, recovery, alerting, upgrade, and rollback.", AMBER),
            ],
            columns=2,
            row_height=33 * mm,
        ),
        PageBreak(),
    ]
    return story


def boundaries_page() -> list[Flowable]:
    notes = [
        ["Enterprise availability", "Managed identity, RBAC, policy, audit export, and dedicated deployment options are early access. Confirm support model, release channel, upgrade process, and SLA for the intended rollout."],
        ["Coordination metadata", "The default registry and beacon process metadata required for identity, discovery, endpoint exchange, NAT assistance, and network membership. Decide whether public, dedicated, or on-premises coordination is appropriate."],
        ["Direct path is preferred, not guaranteed", "NAT and firewall behavior can require relay or compatibility mode. Test path selection and metadata exposure in each target environment."],
        ["Identity-provider scope", "Current provider configuration is registry-global. Per-network issuer, trust-domain, or workload-attestation requirements need explicit validation."],
        ["Revocation scopes differ", "Untrust, network kick, directory removal, key expiry, and deregistration affect different authorization paths. Build the incident runbook around those distinctions."],
        ["Audit buffers are finite", "The registry query buffer, exporter queue, retries, and webhook DLQ support operations but do not replace an external evidence store. Monitor drop and delivery health."],
        ["Application governance is separate", "Pilot governs connectivity. Tool permissions, transaction authority, human approval, data handling, and legal responsibility remain with the deploying system and organization."],
        ["Independent assurance", "Independent security certification is not currently listed in the public product materials. Regulated deployments should map technical evidence and contractual controls to their own assurance requirements."],
    ]
    data = []
    for i, (title, body) in enumerate(notes, 1):
        data.append([P(f"{i:02d}", "eyebrow"), P(f"<b>{title}</b><br/>{body}", "body_small")])
    table = Table(data, colWidths=[15 * mm, CONTENT_W - 15 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Inter"),
                ("BACKGROUND", (0, 0), (-1, -1), CARD),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [CARD, HexColor("#F0F0EA")]),
                ("GRID", (0, 0), (-1, -1), 0.45, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story = section_header(
        "10",
        "Current boundaries",
        "The details to carry into a production decision.",
        "These notes preserve the important qualifications around availability, metadata, control scope, and operating responsibility without changing the core product story.",
    )
    story += [
        table,
        Spacer(1, 7 * mm),
        callout("Decision principle", "Adopt the narrowest deployment that meets the use case, then expand access only when identity, policy, audit, and operational evidence support it.", ACCENT),
        Spacer(1, 4 * mm),
        P("Security contact: <link href='mailto:founders@pilotprotocol.network' color='#66850E'>founders@pilotprotocol.network</link> | Machine-readable contact: <link href='https://pilotprotocol.network/.well-known/security.txt' color='#66850E'>pilotprotocol.network/.well-known/security.txt</link>", "body_small"),
        PageBreak(),
    ]
    return story


def appendix_page() -> list[Flowable]:
    inventory = [
        ["Identity", "Ed25519", "Persistent node keypair; signed handshakes and identity-changing operations."],
        ["Tunnel key agreement", "X25519", "Per-peer secret establishment for encrypted tunnels."],
        ["Authenticated encryption", "AES-256-GCM", "Confidentiality and integrity for tunnel payloads."],
        ["Trust", "Bilateral + network", "Private-node application traffic is admitted by peer trust or shared network membership."],
        ["Pre-trust hardening", "Opt-in strict gates", "Key-exchange/control, private-directory, and NAT-punch authorization controls."],
        ["Enterprise auth", "OIDC/JWT", "RS256/HS256, issuer, audience, expiry, not-before, JWKS cache."],
        ["Access administration", "RBAC", "Owner, admin, member; global and per-network tokens."],
        ["Policy", "Static + expression", "Membership cap, allowed ports, member tags, versioned expression rules."],
        ["Audit", "Structured + export", "Ring buffer, snapshot persistence, hash fields, SIEM export, webhooks, DLQ."],
        ["Provisioning", "Blueprints", "Idempotent network, policy, identity, audit, webhook, and role configuration."],
        ["Operations", "Metrics + standby", "Prometheus-style metrics, health endpoints, authenticated replication."],
        ["Packages", "Checksum + signature", "SHA-256 pinning, signature verification, and optional AEGIS gate."],
    ]
    links = [
        ("Trust Center", "https://pilotprotocol.network/trust"),
        ("Security documentation", "https://pilotprotocol.network/docs/security"),
        ("Enterprise overview", "https://pilotprotocol.network/docs/enterprise"),
        ("Identity and SSO", "https://pilotprotocol.network/docs/enterprise-identity"),
        ("Network policies", "https://pilotprotocol.network/docs/enterprise-policies"),
        ("Audit and compliance", "https://pilotprotocol.network/docs/enterprise-audit"),
        ("Public implementation", "https://github.com/pilot-protocol/pilotprotocol"),
        ("Wire specification", "https://pilotprotocol.network/research/WHITEPAPER.pdf"),
        ("Product roadmap", "https://pilotprotocol.network/roadmap"),
        ("Company newsroom", "https://pilotprotocol.network/news/"),
    ]
    link_rows = []
    for idx in range(0, len(links), 2):
        left_name, left_url = links[idx]
        right_name, right_url = links[idx + 1]
        link_rows.append([
            P(f"<link href='{left_url}' color='#66850E'><b>{left_name}</b></link><br/><font color='#5F605B'>{left_url}</font>", "body_small"),
            P(f"<link href='{right_url}' color='#66850E'><b>{right_name}</b></link><br/><font color='#5F605B'>{right_url}</font>", "body_small"),
        ])
    refs = Table(link_rows, colWidths=[CONTENT_W / 2] * 2, hAlign="LEFT")
    refs.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Inter"),
                ("BACKGROUND", (0, 0), (-1, -1), CARD),
                ("GRID", (0, 0), (-1, -1), 0.45, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story = section_header(
        "11",
        "Technical appendix",
        "Control inventory and review sources.",
        "This appendix summarizes the technical mechanisms referenced in the report and points evaluators to the current public documentation and implementation.",
    )
    story += [
        data_table(["Area", "Mechanism", "Purpose"], inventory, [36 * mm, 44 * mm, CONTENT_W - 80 * mm], small=True),
        Spacer(1, 7 * mm),
        P("CURRENT REFERENCES", "eyebrow"),
        refs,
        Spacer(1, 8 * mm),
        callout(
            "Snapshot and validation",
            "Report version 2.1, July 2026. Validate every control against the exact deployed release and configuration. Public documentation, early-access behavior, and infrastructure packaging can evolve independently.",
            CYAN,
        ),
        Spacer(1, 8 * mm),
        P("Pilot Protocol is developed by Calin Teodor at Vulture Labs. For enterprise evaluation, contact <link href='mailto:founders@pilotprotocol.network' color='#66850E'>founders@pilotprotocol.network</link>.", "body_small"),
    ]
    return story


def build(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(output),
        pagesize=A4,
        leftMargin=MARGIN_X,
        rightMargin=MARGIN_X,
        topMargin=MARGIN_TOP,
        bottomMargin=MARGIN_BOTTOM,
        title="Enterprise Readiness Report: Pilot Protocol",
        author="Calin Teodor",
        subject="Pilot Protocol enterprise security and deployment readiness",
        pageCompression=1,
        initialFontName="Inter",
        initialFontSize=10,
        initialLeading=12,
    )
    story: list[Flowable] = []
    story += cover_story()
    story += executive_snapshot()
    story += architecture_page()
    story += core_controls_page()
    story += identity_access_page()
    story += policy_governance_page()
    story += audit_operations_page()
    story += controls_matrix_page()
    story += use_cases_page()
    story += evaluation_plan_page()
    story += boundaries_page()
    story += appendix_page()
    doc.build(story, onFirstPage=cover_page, onLaterPages=body_page)


def main() -> int:
    output = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_OUTPUT
    build(output)
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
