"""
One-off migration: turn the scraped pilotprotocol.network pages into clean JSON
content for the new site. Run with: python3 -I scripts/migrate-content.py <pages-dir> <out-dir>
Keeps only semantic HTML (no classes, styles or scripts), adds heading ids for
tables of contents, and rewrites absolute site links to relative ones.
"""
import json, os, re, sys, unicodedata
from urllib.parse import urljoin
from bs4 import BeautifulSoup, Comment, NavigableString, Tag

PAGES, OUT = sys.argv[1], sys.argv[2]
SITE = "https://pilotprotocol.network"

ALLOWED = {
    "p", "h2", "h3", "h4", "h5", "ul", "ol", "li", "a", "strong", "b", "em", "i", "code", "pre", "blockquote",
    "table", "thead", "tbody", "tr", "th", "td", "img", "hr", "br", "figure", "figcaption", "details", "summary",
    "sup", "sub", "kbd", "dl", "dt", "dd", "del", "mark",
}
UNWRAP = {"section", "div", "span", "article", "header", "footer", "main", "small", "time", "label", "abbr", "cite", "u", "font", "center", "picture"}
DROP = {"script", "style", "noscript", "svg", "button", "nav", "form", "input", "iframe", "video", "audio", "canvas", "template", "aside", "source"}
KEEP_ATTRS = {"a": {"href"}, "img": {"src", "alt"}, "h2": {"id"}, "h3": {"id"}, "h4": {"id"}, "th": {"colspan", "rowspan"}, "td": {"colspan", "rowspan"}, "ol": {"start"}}


def slugify(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:64] or "section"


def cf_email(hexstr):
    """Undo Cloudflare's email obfuscation (first byte is the XOR key)."""
    key = int(hexstr[:2], 16)
    return "".join(chr(int(hexstr[i:i + 2], 16) ^ key) for i in range(2, len(hexstr), 2))


def clean(root, base="/"):
    for a in root.find_all("a", href=re.compile(r"/cdn-cgi/l/email-protection#")):
        email = cf_email(a["href"].split("#", 1)[1])
        a["href"] = "mailto:" + email
        a.string = email
    for el in root.find_all(attrs={"data-cfemail": True}):
        el.replace_with(cf_email(el["data-cfemail"]))
    for c in root.find_all(string=lambda s: isinstance(s, Comment)):
        c.extract()
    for t in root.find_all(DROP):
        t.decompose()
    # Code blocks: keep only text, remember the language if the source marked one.
    for pre in root.find_all("pre"):
        lang = ""
        code = pre.find("code")
        for el in (code, pre):
            if el is None:
                continue
            for c in el.get("class", []) or []:
                m = re.match(r"(?:language|lang)-(\w+)", c)
                if m:
                    lang = m.group(1)
            lang = lang or (el.get("data-language") or "")
        text = pre.get_text()
        pre.clear()
        new = BeautifulSoup("", "html.parser").new_tag("code")
        new.string = text.rstrip("\n")
        if lang:
            pre["data-lang"] = lang
        pre.append(new)
    for t in list(root.find_all(True)):
        if t.parent is None:
            continue
        if t.name in UNWRAP:
            t.unwrap()
            continue
        if t.name == "h1":
            t.name = "h2"
        if t.name == "h6":
            t.name = "h5"
        if t.name not in ALLOWED and t.name != "pre":
            t.unwrap()
            continue
        keep = KEEP_ATTRS.get(t.name, set())
        if t.name == "pre":
            keep = {"data-lang"}
        for a in list(t.attrs):
            if a not in keep:
                del t.attrs[a]
        if t.name == "a" and t.get("href"):
            href = t["href"]
            if href.startswith(SITE):
                href = href[len(SITE):] or "/"
            elif not href.startswith(("/", "#", "http:", "https:", "mailto:", "tel:")):
                href = urljoin("https://x" + base, href)[len("https://x"):]
            t["href"] = href
        if t.name == "img" and t.get("src", "").startswith(SITE):
            t["src"] = t["src"][len(SITE):]
    # Drop empty paragraphs left behind by removed widgets.
    for p in root.find_all(["p", "li"]):
        if not p.get_text(strip=True) and not p.find("img"):
            p.decompose()
    # In-page "On this page" lists are replaced by the template's own table of contents.
    for h in root.find_all(["h4", "h5", "p"]):
        if h.get_text(strip=True).lower() in ("on this page", "contents", "table of contents"):
            nxt = h.find_next_sibling()
            if nxt is not None and nxt.name in ("ul", "ol"):
                nxt.decompose()
            h.decompose()
    seen = {}
    toc = []
    for h in root.find_all(["h2", "h3"]):
        # Keep the source's ids so existing deep links (#nat, #trust) still land.
        base = h.get("id") or slugify(h.get_text(" ", strip=True))
        n = seen.get(base, 0)
        seen[base] = n + 1
        hid = base if n == 0 else f"{base}-{n}"
        h["id"] = hid
        toc.append({"id": hid, "text": h.get_text(" ", strip=True), "level": int(h.name[1])})
    html = "".join(str(c) for c in root.contents).strip()
    html = re.sub(r"\n{3,}", "\n\n", html)
    return html, toc


def meta(soup):
    title = soup.title.get_text(strip=True) if soup.title else ""
    d = soup.find("meta", attrs={"name": "description"})
    return title, (d["content"].strip() if d and d.get("content") else "")


def words(html):
    return len(re.sub(r"<[^>]+>", " ", html).split())


def article(soup, kind, slug):
    art = soup.find("article")
    h1 = art.find("h1")
    m = art.find(class_="article-meta")
    author = date = ""
    tags = []
    if m:
        a = m.find("a") or m.find(string=re.compile("By "))
        author = (a.get_text(strip=True) if isinstance(a, Tag) else str(a or "")).replace("By ", "").strip()
        t = m.find("time")
        date = t.get("datetime", "") if t else ""
        tags = [x.get_text(strip=True) for x in m.find_all(class_="tag")]
    banner = art.find("img", class_="article-banner")
    banner_src = banner.get("src") if banner else ""
    heading = h1.get_text(" ", strip=True) if h1 else ""
    for el in [art.find("nav"), h1, m, banner] + art.find_all("script"):
        if el is not None:
            el.decompose()
    html, toc = clean(art, f"/{kind}/{slug}")
    title, desc = meta(soup)
    return {
        "kind": kind, "slug": slug, "title": heading or title, "seoTitle": title,
        "description": desc, "author": author, "date": date, "tags": tags, "banner": banner_src,
        "minutes": max(1, round(words(html) / 230)), "toc": toc, "html": html,
    }


def doc(soup, slug):
    body = soup.select_one(".content-body")
    h1 = body.find("h1")
    heading = h1.get_text(" ", strip=True) if h1 else ""
    # The small section pill ("Flow") that sits above each docs title.
    first = body.find(True, recursive=False)
    while first is not None and first.name in ("div", "span") and not first.find(["p", "h2"]):
        first = first.find_next_sibling()
    for a in body.find_all("a", recursive=False)[:1]:
        if a.find_previous_sibling(["p", "h2"]) is None:
            a.decompose()
    for el in body.find_all("nav") + [h1]:
        if el is not None:
            el.decompose()
    html, toc = clean(body, "/docs/" if slug == "index" else f"/docs/{slug}")
    title, desc = meta(soup)
    return {"kind": "docs", "slug": slug, "title": heading or title, "seoTitle": title,
            "description": desc, "toc": toc, "html": html}


def app(soup, slug):
    main = soup.find("main")
    head = main.select_one(".dh-grid")
    title, desc = meta(soup)
    name = head.find(["h1", "h2"]).get_text(" ", strip=True) if head.find(["h1", "h2"]) else slug
    text = head.get_text(" | ", strip=True).split(" | ")
    metrics = {}
    for m in main.select(".dh-metrics > *"):
        parts = [x for x in m.get_text(" | ", strip=True).split(" | ") if x]
        if len(parts) >= 2:
            metrics[parts[-1].lower()] = " ".join(parts[:-1])
    icon = main.select_one(".dh-grid img")
    body = main.select_one(".detail-body")
    html, toc = clean(body, f"/apps/{slug}") if body else ("", [])
    related = [a.get("href", "").rsplit("/", 1)[-1] for a in main.select("section.shelf a[href*='/apps/']")]
    return {"kind": "app", "slug": slug, "name": name, "seoTitle": title, "description": desc, "headText": text,
            "metrics": metrics, "icon": icon.get("src") if icon else "", "related": related, "toc": toc, "html": html}


def page(soup, slug):
    main = soup.find("main") or soup.body
    h1 = main.find("h1")
    html, toc = clean(main, f"/{slug}")
    title, desc = meta(soup)
    return {"kind": "page", "slug": slug, "title": h1.get_text(" ", strip=True) if h1 else title, "seoTitle": title,
            "description": desc, "toc": toc, "html": html}


counts = {}
for fn in sorted(os.listdir(PAGES)):
    if not fn.endswith(".html"):
        continue
    path = fn[:-5].replace("__", "/")
    soup = BeautifulSoup(open(os.path.join(PAGES, fn), encoding="utf-8").read(), "html.parser")
    section, _, rest = path.partition("/")
    if section in ("blog", "learn", "news") and rest and soup.find("article") and soup.find("article").find("h1"):
        data, folder = article(soup, section, rest), section
    elif section == "apps" and rest:
        data, folder = app(soup, rest), "apps"
    elif section == "docs" and soup.select_one(".content-body"):
        data, folder = doc(soup, rest or "index"), "docs"
    else:
        data, folder = page(soup, path), "pages"
    os.makedirs(os.path.join(OUT, folder), exist_ok=True)
    name = (data["slug"] or "index").replace("/", "__")
    json.dump(data, open(os.path.join(OUT, folder, name + ".json"), "w"), ensure_ascii=False, indent=1)
    counts[folder] = counts.get(folder, 0) + 1
print(counts)
