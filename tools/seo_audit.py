import re
from pathlib import Path
import json

root = Path('..').resolve()  # script is in tools/
html_files = list(root.rglob('*.html'))
results = []

for f in sorted(html_files):
    if 'node_modules' in str(f):
        continue
    text = f.read_text(encoding='utf-8')
    title = re.search(r'<title>(.*?)</title>', text, re.I|re.S)
    desc = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', text, re.I|re.S)
    canonical = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\']', text, re.I|re.S)
    og = bool(re.search(r'property=["\']og:', text, re.I))
    twitter = bool(re.search(r'name=["\']twitter:', text, re.I))
    jsonld = bool(re.search(r'<script[^>]*type=["\']application/ld\+json["\']', text, re.I))
    viewport = bool(re.search(r'<meta\s+name=["\']viewport["\']', text, re.I))
    h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', text, re.I|re.S)
    h2s = re.findall(r'<h2[^>]*>(.*?)</h2>', text, re.I|re.S)
    h3s = re.findall(r'<h3[^>]*>(.*?)</h3>', text, re.I|re.S)
    imgs = re.findall(r'<img[^>]*>', text, re.I)
    imgs_no_alt = []
    for img in imgs:
        if not re.search(r'\salt=\s*"', img) and not re.search(r"\salt=\s*'", img):
            imgs_no_alt.append(img)
    breadcrumb = bool(re.search(r'class=["\']breadcrumb', text, re.I))
    # links
    hrefs = re.findall(r'href=["\']([^"\']+)["\']', text)
    internal_links = []
    broken = []
    for href in hrefs:
        if href.startswith('http') or href.startswith('mailto:') or href.startswith('tel:') or href.startswith('#'):
            continue
        # resolve relative path
        target = (f.parent / href).resolve()
        # strip query
        target = Path(str(target).split('?')[0].split('#')[0])
        if not target.exists():
            broken.append(href)
        internal_links.append(href)

    results.append({
        'file': str(f.relative_to(root)),
        'title': title.group(1).strip() if title else '',
        'meta_description': desc.group(1).strip() if desc else '',
        'canonical': canonical.group(1).strip() if canonical else '',
        'has_og': og,
        'has_twitter': twitter,
        'has_jsonld': jsonld,
        'has_viewport': viewport,
        'h1_count': len(h1s),
        'h1_texts': [re.sub(r'\s+',' ', re.sub(r'<[^>]+>','',h)).strip() for h in h1s],
        'h2_count': len(h2s),
        'h3_count': len(h3s),
        'images_total': len(imgs),
        'images_missing_alt': len(imgs_no_alt),
        'breadcrumb': breadcrumb,
        'internal_links_count': len(internal_links),
        'broken_internal_links': broken,
    })

print(json.dumps(results, indent=2))
