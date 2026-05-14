#!/usr/bin/env python3
"""Convert markdown files to styled PDFs using reportlab."""

import re
import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
    Table, TableStyle, ListFlowable, ListItem, Image, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from PIL import Image as PILImage

PAGE_W, PAGE_H = A4
MARGIN = 2 * cm

# ── colour palette ──────────────────────────────────────────────────────────
GOLD   = colors.HexColor("#D4A017")
DARK   = colors.HexColor("#1A1A2E")
GRAY   = colors.HexColor("#555555")
LIGHT  = colors.HexColor("#F5F5F5")
BORDER = colors.HexColor("#CCCCCC")


def build_styles():
    base = getSampleStyleSheet()

    styles = {
        "h1": ParagraphStyle(
            "h1", parent=base["Normal"],
            fontSize=26, leading=32, textColor=DARK,
            fontName="Helvetica-Bold",
            spaceAfter=8, spaceBefore=0,
        ),
        "subtitle": ParagraphStyle(
            "subtitle", parent=base["Normal"],
            fontSize=13, leading=18, textColor=GRAY,
            fontName="Helvetica",
            spaceAfter=16,
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Normal"],
            fontSize=16, leading=22, textColor=DARK,
            fontName="Helvetica-Bold",
            spaceBefore=18, spaceAfter=6,
            borderPadding=(0, 0, 4, 0),
        ),
        "h3": ParagraphStyle(
            "h3", parent=base["Normal"],
            fontSize=13, leading=18, textColor=DARK,
            fontName="Helvetica-Bold",
            spaceBefore=12, spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body", parent=base["Normal"],
            fontSize=10, leading=16, textColor=GRAY,
            fontName="Helvetica",
            spaceAfter=4,
        ),
        "bullet": ParagraphStyle(
            "bullet", parent=base["Normal"],
            fontSize=10, leading=16, textColor=GRAY,
            fontName="Helvetica",
            leftIndent=16, spaceAfter=2,
        ),
        "numbered": ParagraphStyle(
            "numbered", parent=base["Normal"],
            fontSize=10, leading=16, textColor=GRAY,
            fontName="Helvetica",
            leftIndent=16, spaceAfter=2,
        ),
        "tip_box": ParagraphStyle(
            "tip_box", parent=base["Normal"],
            fontSize=10, leading=16, textColor=DARK,
            fontName="Helvetica",
            leftIndent=12, rightIndent=12,
            spaceAfter=3,
            backColor=colors.HexColor("#FFF9E6"),
        ),
        "img_placeholder": ParagraphStyle(
            "img_placeholder", parent=base["Normal"],
            fontSize=9, leading=14,
            textColor=colors.HexColor("#999999"),
            fontName="Helvetica-Oblique",
            alignment=TA_CENTER,
            spaceAfter=6, spaceBefore=4,
        ),
    }
    return styles


def inline_format(text):
    """Convert **bold** and *italic* to reportlab XML tags."""
    # Bold (must come before italic)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"__(.+?)__",     r"<b>\1</b>", text)
    # Italic
    text = re.sub(r"\*(.+?)\*",     r"<i>\1</i>", text)
    text = re.sub(r"_(.+?)_",       r"<i>\1</i>",  text)
    # Escape bare ampersands that aren't already entities
    text = re.sub(r"&(?!#?\w+;)", "&amp;", text)
    return text


def parse_table(lines):
    """Return a list of row-lists from a markdown table block."""
    rows = []
    for line in lines:
        line = line.strip()
        if re.match(r"^\|[-| :]+\|$", line):   # separator row
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        rows.append(cells)
    return rows


def build_reportlab_table(rows, styles):
    if not rows:
        return None

    col_count = max(len(r) for r in rows)
    # Pad short rows
    data = [r + [""] * (col_count - len(r)) for r in rows]
    # Format cells
    fmt_data = []
    for i, row in enumerate(data):
        fmt_row = []
        for cell in row:
            style = styles["body"] if i > 0 else ParagraphStyle(
                "th", parent=styles["body"],
                fontName="Helvetica-Bold", textColor=colors.white,
            )
            fmt_row.append(Paragraph(inline_format(cell), style))
        fmt_data.append(fmt_row)

    col_width = (PAGE_W - 2 * MARGIN) / col_count
    tbl = Table(fmt_data, colWidths=[col_width] * col_count, repeatRows=1)

    tbl_style = TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0),  DARK),
        ("TEXTCOLOR",    (0, 0), (-1, 0),  colors.white),
        ("FONTNAME",     (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("GRID",         (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN",       (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",   (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
        ("LEFTPADDING",  (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ])
    tbl.setStyle(tbl_style)
    return tbl


def markdown_to_flowables(md_text, styles, title_subtitle, img_dir=""):
    """Convert markdown string to a list of reportlab flowables."""
    flowables = []
    lines = md_text.splitlines()
    i = 0

    # Title block
    doc_title, doc_sub = title_subtitle
    flowables.append(Paragraph(inline_format(doc_title), styles["h1"]))
    flowables.append(Paragraph(inline_format(doc_sub), styles["subtitle"]))
    flowables.append(HRFlowable(width="100%", thickness=2,
                                color=GOLD, spaceAfter=16))

    in_tips = False     # tracking a **Tips:** block
    tip_items = []

    def flush_tips():
        nonlocal in_tips, tip_items
        if not tip_items:
            return
        bg_data = [[Paragraph("💡  Tips", ParagraphStyle(
            "tip_hd", parent=styles["body"],
            fontName="Helvetica-Bold", textColor=DARK))]]
        for t in tip_items:
            bg_data.append([Paragraph("• " + inline_format(t), styles["tip_box"])])
        tip_tbl = Table(bg_data, colWidths=[PAGE_W - 2 * MARGIN])
        tip_tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#FFF9E6")),
            ("LEFTPADDING",   (0, 0), (-1, -1), 12),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
            ("TOPPADDING",    (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("BOX", (0, 0), (-1, -1), 1, GOLD),
            ("LINEBELOW", (0, 0), (-1, 0), 1, GOLD),
        ]))
        flowables.append(tip_tbl)
        flowables.append(Spacer(1, 8))
        tip_items.clear()
        in_tips = False

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip the H1 (already used as title) and its following subtitle line
        if stripped.startswith("# "):
            i += 1
            continue

        # Horizontal rule
        if stripped in ("---", "***", "___"):
            flush_tips()
            flowables.append(HRFlowable(width="100%", thickness=0.5,
                                        color=BORDER, spaceBefore=8, spaceAfter=8))
            i += 1
            continue

        # H2
        if stripped.startswith("## "):
            flush_tips()
            text = stripped[3:].strip()
            flowables.append(Paragraph(inline_format(text), styles["h2"]))
            i += 1
            continue

        # H3
        if stripped.startswith("### "):
            flush_tips()
            text = stripped[4:].strip()
            flowables.append(Paragraph(inline_format(text), styles["h3"]))
            i += 1
            continue

        # Image reference — embed actual image if it exists
        if stripped.startswith("!["):
            m = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", stripped)
            if m:
                label = m.group(1)
                img_rel = m.group(2)
                img_path = os.path.join(img_dir, img_rel)
                if os.path.exists(img_path):
                    try:
                        max_w = PAGE_W - 2 * MARGIN
                        max_h = 10 * cm
                        with PILImage.open(img_path) as pil:
                            nat_w, nat_h = pil.size
                        scale = min(max_w / nat_w, max_h / nat_h, 1.0)
                        draw_w = nat_w * scale
                        draw_h = nat_h * scale
                        img_flowable = Image(img_path, width=draw_w, height=draw_h,
                                            hAlign="CENTER")
                        flowables.append(Spacer(1, 6))
                        flowables.append(img_flowable)
                        flowables.append(Spacer(1, 6))
                    except Exception:
                        flowables.append(Paragraph(f"[ {label} ]",
                                                    styles["img_placeholder"]))
                else:
                    flowables.append(Paragraph(f"[ {label} ]",
                                                styles["img_placeholder"]))
            i += 1
            continue

        # Table block
        if stripped.startswith("|"):
            flush_tips()
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i])
                i += 1
            rows = parse_table(table_lines)
            tbl = build_reportlab_table(rows, styles)
            if tbl:
                flowables.append(tbl)
                flowables.append(Spacer(1, 8))
            continue

        # Tips: block detection
        if stripped == "**Tips:**":
            in_tips = True
            i += 1
            continue

        # Bullet items under Tips
        if in_tips and stripped.startswith("- "):
            tip_items.append(stripped[2:].strip())
            i += 1
            continue

        # End of tips (non-bullet, non-empty line after tips started)
        if in_tips and stripped and not stripped.startswith("- "):
            flush_tips()

        # Numbered list  (1. 2. 3.)
        m = re.match(r"^(\d+)\.\s+(.*)", stripped)
        if m:
            num, text = m.group(1), m.group(2)
            flowables.append(Paragraph(
                f"<b>{num}.</b>  {inline_format(text)}", styles["numbered"]))
            i += 1
            continue

        # Bullet list
        if stripped.startswith("- ") or stripped.startswith("* "):
            text = stripped[2:].strip()
            flowables.append(Paragraph(
                f"• {inline_format(text)}", styles["bullet"]))
            i += 1
            continue

        # Sub-bullet (3-space indent)
        if stripped.startswith("   - ") or stripped.startswith("   * "):
            text = stripped.lstrip("- *").strip()
            flowables.append(Paragraph(
                f"    ◦ {inline_format(text)}",
                ParagraphStyle("subbullet", parent=styles["bullet"],
                               leftIndent=32)))
            i += 1
            continue

        # Empty line
        if not stripped:
            if in_tips:
                pass  # keep collecting
            else:
                flowables.append(Spacer(1, 4))
            i += 1
            continue

        # Normal paragraph
        flowables.append(Paragraph(inline_format(stripped), styles["body"]))
        i += 1

    flush_tips()
    return flowables


def md_file_to_pdf(md_path, pdf_path):
    with open(md_path, encoding="utf-8") as f:
        text = f.read()

    # Extract title (first H1) and subtitle (next non-empty line)
    title = "Document"
    subtitle = ""
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            title = stripped[2:].strip()
        elif title != "Document" and stripped and not stripped.startswith("#"):
            subtitle = stripped
            break

    styles = build_styles()

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
        title=title,
    )

    img_dir = os.path.dirname(md_path)
    flowables = markdown_to_flowables(text, styles, (title, subtitle), img_dir=img_dir)
    doc.build(flowables)
    print(f"  Created: {pdf_path}")


if __name__ == "__main__":
    docs = os.path.dirname(os.path.abspath(__file__))

    md_file_to_pdf(
        os.path.join(docs, "CLIENT_GUIDE.md"),
        os.path.join(docs, "CLIENT_GUIDE.pdf"),
    )
    md_file_to_pdf(
        os.path.join(docs, "COACH_GUIDE.md"),
        os.path.join(docs, "COACH_GUIDE.pdf"),
    )
