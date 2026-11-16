"""
Convert the migrated docs (content/docs/*.json, sanitized HTML) into Fumadocs MDX.
Run with: python3 -I scripts/html-to-mdx.py <json-dir> <out-dir>

Keeps heading ids with Fumadocs' `## Title [#id]` syntax so existing deep links
still land, turns tables into GFM, code blocks into fenced blocks with a language
for Shiki, and escapes MDX's special characters in prose.
"""
import json, os, re, sys
from bs4 import BeautifulSoup, NavigableString, Tag

SRC, OUT = sys.argv[1], sys.argv[2]

SPECIAL = re.compile(r"([\\`*_\[\]{}<>|#~])")


def esc(text, table=False):
    text = SPECIAL.sub(r"\\\1", text)
    return text


def guess_lang(code, hint):
    if hint:
        return {"sh": "bash", "shell": "bash", "console": "bash", "js": "js", "ts": "ts"}.get(hint, hint)
    s = code.lstrip()
    if s.startswith(("{", "[")) and s.rstrip().endswith(("}", "]")):
        return "json"
    if "package main" in s or re.search(r"^func \w", s, re.M) or 'import "' in s:
        return "go"
    if re.search(r"^(from \w+ import|import \w+$|def \w+\()", s, re.M):
        return "python"
    if re.search(r"^(import Foundation|import \w+Kit)|let \w+ = try", s, re.M):
        return "swift"
    if re.search(r"^(import .* from |const \w+ = |await |export )", s, re.M):
        return "ts"
    if re.search(r"^\s*[\w.-]+:\s", s, re.M) and not re.search(r"^\$ ", s, re.M) and "pilotctl" not in s:
        return "yaml"
    return "bash"


def inline(node, table=False):
    out = []
    for c in node.children:
        if isinstance(c, NavigableString):
            t = re.sub(r"\s+", " ", str(c))
            out.append(esc(t, table))
            continue
        if not isinstance(c, Tag):
            continue
        n = c.name
        if n in ("strong", "b"):
            inner = inline(c, table).strip()
            out.append(f"**{inner}**" if inner else "")
        elif n in ("em", "i"):
            inner = inline(c, table).strip()
            out.append(f"*{inner}*" if inner else "")
        elif n == "code":
            t = c.get_text()
            fence = "``" if "`" in t else "`"
            pad = " " if t.startswith("`") or t.endswith("`") else ""
            out.append(f"{fence}{pad}{t}{pad}{fence}")
        elif n == "a":
            href = c.get("href", "")
            label = inline(c, table).strip() or esc(href)
            out.append(f"[{label}]({href.replace(' ', '%20').replace(')', '%29')})" if href else label)
        elif n == "img":
            out.append(f"![{esc(c.get('alt', ''))}]({c.get('src', '')})")
        elif n == "br":
            out.append("<br />")
        elif n in ("sup", "sub", "kbd", "del", "mark"):
            out.append(f"<{n}>{inline(c, table)}</{n}>")
        else:
            out.append(inline(c, table))
    return "".join(out)


def blocks(node, depth=0):
    """Render block-level children as markdown, separated by blank lines."""
    parts = []
    buf = []

    def flush():
        text = "".join(buf).strip()
        if text:
            parts.append(text)
        buf.clear()

    for c in node.children:
        if isinstance(c, NavigableString):
            buf.append(esc(re.sub(r"\s+", " ", str(c))))
            continue
        if not isinstance(c, Tag):
            continue
        n = c.name
        if n in ("strong", "b", "em", "i", "code", "a", "img", "br", "sup", "sub", "kbd", "del", "mark"):
            wrapper = BeautifulSoup("<x></x>", "html.parser").x
            wrapper.append(c.__copy__())
            buf.append(inline(wrapper))
            continue
        flush()
        if n == "p":
            t = inline(c).strip()
            if t:
                parts.append(t)
        elif n in ("h2", "h3", "h4", "h5"):
            level = int(n[1])
            hid = c.get("id")
            title = inline(c).strip()
            parts.append("#" * level + " " + title + (f" [#{hid}]" if hid and level <= 3 else ""))
        elif n in ("ul", "ol"):
            parts.append(list_md(c, depth))
        elif n == "pre":
            code = c.get_text().rstrip("\n")
            lang = guess_lang(code, c.get("data-lang", ""))
            fence = "````" if "```" in code else "```"
            parts.append(f"{fence}{lang}\n{code}\n{fence}")
        elif n == "blockquote":
            inner = blocks(c, depth)
            parts.append("\n".join("> " + line if line else ">" for line in inner.split("\n")))
        elif n == "table":
            parts.append(table_md(c))
        elif n == "hr":
            parts.append("---")
        elif n == "details":
            summary = c.find("summary")
            title = inline(summary).strip() if summary else "Details"
            if summary:
                summary.extract()
            parts.append(f"<details>\n<summary>{title}</summary>\n\n{blocks(c, depth)}\n\n</details>")
        elif n == "dl":
            for item in c.children:
                if isinstance(item, Tag) and item.name == "dt":
                    parts.append(f"**{inline(item).strip()}**")
                elif isinstance(item, Tag) and item.name == "dd":
                    parts.append(blocks(item, depth))
        elif n == "figure":
            parts.append(blocks(c, depth))
        elif n == "figcaption":
            parts.append(f"*{inline(c).strip()}*")
        else:
            inner = blocks(c, depth)
            if inner:
                parts.append(inner)
    flush()
    return "\n\n".join(p for p in parts if p.strip())


def list_md(lst, depth):
    lines = []
    ordered = lst.name == "ol"
    start = int(lst.get("start", 1)) if ordered else 1
    for i, li in enumerate([x for x in lst.children if isinstance(x, Tag) and x.name == "li"]):
        marker = f"{start + i}." if ordered else "-"
        indent = " " * (len(marker) + 1)
        body = blocks(li, depth + 1)
        body_lines = body.split("\n") if body else [""]
        lines.append(f"{marker} {body_lines[0]}")
        for line in body_lines[1:]:
            lines.append((indent + line) if line else "")
    return "\n".join(lines)


def table_md(table):
    rows = []
    for tr in table.find_all("tr"):
        cells = []
        for cell in tr.find_all(["th", "td"]):
            # Block content inside a cell collapses onto one line.
            for br in cell.find_all(["p", "li"]):
                br.append(" ")
            text = inline(cell, True).strip().replace("\n", " ")
            cells.append(text)
        if cells:
            rows.append(cells)
    if not rows:
        return ""
    width = max(len(r) for r in rows)
    rows = [r + [""] * (width - len(r)) for r in rows]
    head, body = rows[0], rows[1:]
    out = ["| " + " | ".join(head) + " |", "| " + " | ".join(["---"] * width) + " |"]
    out += ["| " + " | ".join(r) + " |" for r in body]
    return "\n".join(out)


def yaml_str(s):
    return json.dumps(s, ensure_ascii=False)


os.makedirs(OUT, exist_ok=True)
for fn in sorted(os.listdir(SRC)):
    if not fn.endswith(".json"):
        continue
    d = json.load(open(os.path.join(SRC, fn)))
    soup = BeautifulSoup(d["html"], "html.parser")
    body = blocks(soup)
    desc = d.get("description", "")
    # The first paragraph of each doc restates the description; keep it as the lede only once.
    first = soup.find("p")
    if first and desc and first.get_text(" ", strip=True)[:60] == desc[:60]:
        pass
    fm = f"---\ntitle: {yaml_str(d['title'])}\ndescription: {yaml_str(desc)}\n---\n\n"
    name = "index" if d["slug"] == "index" else d["slug"]
    open(os.path.join(OUT, name + ".mdx"), "w").write(fm + body + "\n")
print("converted", len([f for f in os.listdir(OUT) if f.endswith(".mdx")]))
