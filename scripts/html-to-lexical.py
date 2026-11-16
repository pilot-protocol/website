"""
Convert migrated articles (content/{blog,learn,news}/*.json, sanitized HTML) into
Payload seed files whose `content` is Lexical JSON, ready for `payload run scripts/seed.ts`.
Run with: python3 -I scripts/html-to-lexical.py <content-dir> <out-dir>
"""
import json, os, re, secrets, sys
from bs4 import BeautifulSoup, NavigableString, Tag

SRC, OUT = sys.argv[1], sys.argv[2]

BOLD, ITALIC, STRIKE, UNDERLINE, CODE, SUB, SUP = 1, 2, 4, 8, 16, 32, 64


def text(t, fmt=0):
    return {"type": "text", "text": t, "format": fmt, "detail": 0, "mode": "normal", "style": "", "version": 1}


def element(kind, children, **extra):
    base = {"type": kind, "children": children, "direction": "ltr", "format": "", "indent": 0, "version": 1}
    base.update(extra)
    return base


def paragraph(children):
    return element("paragraph", children, textFormat=0, textStyle="")


def guess_lang(code, hint):
    if hint:
        return {"sh": "bash", "shell": "bash", "console": "bash"}.get(hint, hint)
    s = code.lstrip()
    if s.startswith(("{", "[")) and s.rstrip().endswith(("}", "]")):
        return "json"
    if "package main" in s or re.search(r"^func \w", s, re.M):
        return "go"
    if re.search(r"^(from \w+ import|import \w+$|def \w+\()", s, re.M):
        return "python"
    if re.search(r"^(import .* from |const \w+ = |await |export )", s, re.M):
        return "ts"
    return "bash"


def inlines(node, fmt=0):
    """Inline children → Lexical text/link/linebreak nodes."""
    out = []
    for c in node.children:
        if isinstance(c, NavigableString):
            t = re.sub(r"\s+", " ", str(c))
            if t:
                out.append(text(t, fmt))
            continue
        if not isinstance(c, Tag):
            continue
        n = c.name
        if n in ("strong", "b"):
            out += inlines(c, fmt | BOLD)
        elif n in ("em", "i"):
            out += inlines(c, fmt | ITALIC)
        elif n in ("del",):
            out += inlines(c, fmt | STRIKE)
        elif n == "sub":
            out += inlines(c, fmt | SUB)
        elif n == "sup":
            out += inlines(c, fmt | SUP)
        elif n in ("code", "kbd"):
            out.append(text(c.get_text(), fmt | CODE))
        elif n == "br":
            out.append({"type": "linebreak", "version": 1})
        elif n == "a":
            href = c.get("href", "")
            kids = inlines(c, fmt) or [text(href, fmt)]
            out.append(
                element(
                    "link",
                    kids,
                    version=3,
                    fields={"linkType": "custom", "url": href, "newTab": href.startswith("http")},
                    id=secrets.token_hex(12),
                )
            )
        elif n == "img":
            alt = c.get("alt", "")
            if alt:
                out.append(text(f"[{alt}]", fmt | ITALIC))
        else:
            out += inlines(c, fmt)
    # Trim edge whitespace so paragraphs don't start or end with a space.
    if out and out[0]["type"] == "text":
        out[0]["text"] = out[0]["text"].lstrip()
    if out and out[-1]["type"] == "text":
        out[-1]["text"] = out[-1]["text"].rstrip()
    return [n for n in out if n["type"] != "text" or n["text"]]


def code_block(code, lang):
    return {
        "type": "block",
        "version": 2,
        "format": "",
        "fields": {"id": secrets.token_hex(12), "blockName": "", "blockType": "Code", "language": lang, "code": code},
    }


def list_node(lst):
    ordered = lst.name == "ol"
    items = []
    for i, li in enumerate([x for x in lst.children if isinstance(x, Tag) and x.name == "li"]):
        kids = []
        nested = []
        for c in li.children:
            if isinstance(c, Tag) and c.name in ("ul", "ol"):
                nested.append(list_node(c))
            elif isinstance(c, Tag) and c.name == "p":
                if kids:
                    kids.append({"type": "linebreak", "version": 1})
                kids += inlines(c)
            elif isinstance(c, Tag) and c.name == "pre":
                kids.append(text(c.get_text().strip(), CODE))
            else:
                wrapper = BeautifulSoup("<x></x>", "html.parser").x
                wrapper.append(c.__copy__() if isinstance(c, Tag) else NavigableString(str(c)))
                kids += inlines(wrapper)
        items.append(element("listitem", kids, value=i + 1))
        # Lexical nests a list inside its own listitem that follows the parent item.
        for n in nested:
            items.append(element("listitem", [n], value=i + 1))
    return element(
        "list",
        items,
        listType="number" if ordered else "bullet",
        start=int(lst.get("start", 1)) if ordered else 1,
        tag="ol" if ordered else "ul",
    )


def table_node(table):
    rows = []
    for r, tr in enumerate(table.find_all("tr")):
        cells = []
        for cell in tr.find_all(["th", "td"]):
            header = 1 if cell.name == "th" or r == 0 and tr.find_parent("thead") else 0
            cells.append(
                {
                    "type": "tablecell",
                    "headerState": header,
                    "colSpan": int(cell.get("colspan", 1)),
                    "rowSpan": int(cell.get("rowspan", 1)),
                    "backgroundColor": None,
                    "children": [paragraph(inlines(cell))],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "version": 1,
                }
            )
        rows.append({"type": "tablerow", "children": cells, "direction": "ltr", "format": "", "indent": 0, "version": 1})
    return {"type": "table", "children": rows, "direction": "ltr", "format": "", "indent": 0, "version": 1}


def blocks(node):
    out = []
    loose = []

    def flush():
        kids = [k for k in loose if k["type"] != "text" or k["text"].strip()]
        if kids:
            out.append(paragraph(kids))
        loose.clear()

    for c in node.children:
        if isinstance(c, NavigableString):
            t = re.sub(r"\s+", " ", str(c))
            if t.strip():
                loose.append(text(t))
            continue
        if not isinstance(c, Tag):
            continue
        n = c.name
        if n in ("strong", "b", "em", "i", "code", "a", "br", "kbd", "sup", "sub", "del", "img"):
            wrapper = BeautifulSoup("<x></x>", "html.parser").x
            wrapper.append(c.__copy__())
            loose += inlines(wrapper)
            continue
        flush()
        if n == "p":
            kids = inlines(c)
            if kids:
                out.append(paragraph(kids))
        elif n in ("h2", "h3", "h4", "h5"):
            out.append(element("heading", inlines(c), tag=n))
        elif n in ("ul", "ol"):
            out.append(list_node(c))
        elif n == "pre":
            code = c.get_text().rstrip("\n")
            out.append(code_block(code, guess_lang(code, c.get("data-lang", ""))))
        elif n == "blockquote":
            inner = blocks(c)
            kids = []
            for i, b in enumerate(inner):
                if i:
                    kids.append({"type": "linebreak", "version": 1})
                kids += b.get("children", [])
            out.append(element("quote", kids))
        elif n == "table":
            out.append(table_node(c))
        elif n == "hr":
            out.append({"type": "horizontalrule", "version": 1})
        elif n == "details":
            summary = c.find("summary")
            if summary:
                out.append(element("heading", inlines(summary), tag="h4"))
                summary.extract()
            out += blocks(c)
        elif n == "dl":
            for item in c.children:
                if isinstance(item, Tag) and item.name == "dt":
                    out.append(paragraph(inlines(item, BOLD)))
                elif isinstance(item, Tag) and item.name == "dd":
                    out += blocks(item)
        else:
            out += blocks(c)
    flush()
    return out


os.makedirs(OUT, exist_ok=True)
count = 0
for section in ("blog", "learn", "news"):
    folder = os.path.join(SRC, section)
    for fn in sorted(os.listdir(folder)):
        if not fn.endswith(".json"):
            continue
        d = json.load(open(os.path.join(folder, fn)))
        soup = BeautifulSoup(d["html"], "html.parser")
        root = {"root": {"type": "root", "children": blocks(soup), "direction": "ltr", "format": "", "indent": 0, "version": 1}}
        post = {
            "title": d["title"],
            "slug": d["slug"],
            "section": section,
            "description": d["description"],
            "seoTitle": d.get("seoTitle", ""),
            "author": d.get("author", ""),
            "publishedAt": f"{d['date']}T12:00:00.000Z" if d.get("date") else None,
            "tags": d.get("tags", []),
            "content": root,
        }
        json.dump(post, open(os.path.join(OUT, f"{section}__{d['slug']}.json"), "w"), ensure_ascii=False)
        count += 1
print("converted", count)
