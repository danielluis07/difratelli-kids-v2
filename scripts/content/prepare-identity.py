"""Export editable outlined wordmarks and transparent motifs from approved fonts."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
import json
import hashlib
import sys

ROOT = Path(__file__).resolve().parents[2]
approval_path = ROOT / 'docs/content/identity-approval.json'
if approval_path.exists():
    approval = json.loads(approval_path.read_text(encoding='utf-8'))
    if approval.get('status') == 'approved' and approval.get('revision') == 'issue-28-identity-v1':
        for file in approval['files']:
            if hashlib.sha256((ROOT / file['path']).read_bytes()).hexdigest() != file['sha256']:
                raise ValueError(f"{file['path']}: approved file changed; prepare a new revision for review.")
        print('Preserved approved identity revision issue-28-identity-v1; all approved file hashes match.')
        sys.exit(0)
OUT = ROOT / 'public/identity'
OUT.mkdir(parents=True, exist_ok=True)

def outlines(filename, text, size, axes):
    font = instantiateVariableFont(TTFont(ROOT / 'assets/identity/fonts' / filename), axes, inplace=False)
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    scale = size / font['head'].unitsPerEm
    x, paths = 0, []
    for char in text:
        glyph = glyphs[cmap[ord(char)]]
        pen = SVGPathPen(glyphs)
        glyph.draw(pen)
        paths.append(f'<path transform="translate({x:.4f} 0)" d="{pen.getCommands()}"/>')
        x += glyph.width
    return f'<g transform="scale({scale:.6f} {-scale:.6f})">' + ''.join(paths) + '</g>', x * scale

name, width = outlines('Fraunces-variable.ttf', 'difratelli', 90, {'wght': 600, 'opsz': 72, 'SOFT': 50, 'WONK': 1})
kids, kids_width = outlines('DM-Sans-variable.ttf', 'kids', 22, {'wght': 500, 'opsz': 22})

def svg(title, viewbox, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" role="img" aria-labelledby="title"><title id="title">{title}</title>{body}</svg>\n'

for color, hex_value in [('brown', '#382C25'), ('white', '#FFFFFF')]:
    body = f'<g fill="{hex_value}"><g transform="translate(16 90)">{name}</g><g transform="translate({16 + width - kids_width:.4f} 122)">{kids}</g></g>'
    (OUT / f'wordmark-{color}-v1.svg').write_text(svg('Difratelli Kids', f'0 0 {width + 32:.4f} 140', body), encoding='utf-8')

motifs = {
    'sprout': '<g fill="none" stroke="#246B63" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M60 101Q65 74 56 54"/><path d="M57 60C26 64 19 44 20 28C42 25 57 35 57 60Z"/><path d="M60 75C61 47 82 40 103 43C100 65 87 78 60 75Z"/></g>',
    'chalk-path': '<g fill="none" stroke-width="5" stroke-linecap="round"><path stroke="#246B63" d="M15 96C9 74 45 87 43 65S20 47 33 28S72 21 74 41S45 67 72 82S108 68 102 57"/><path stroke="#E9A18F" d="M84 20L99 17M100 29L108 36"/></g>',
    'spark': '<path fill="#F2D477" stroke="#382C25" stroke-width="3" stroke-linejoin="round" d="M60 15L70 47L105 58L72 70L61 105L48 71L15 60L48 47Z"/><path fill="none" stroke="#E9A18F" stroke-width="4" stroke-linecap="round" d="M91 19L98 12M106 84L114 89M17 29L10 24"/>',
}
for name, body in motifs.items():
    (OUT / f'motif-{name}-v1.svg').write_text(svg(f'Motivo decorativo: {name}', '0 0 120 120', body), encoding='utf-8')

letter, _ = outlines('Fraunces-variable.ttf', 'd', 45, {'wght': 600, 'opsz': 72, 'SOFT': 50, 'WONK': 1})
(OUT / 'favicon-v1.svg').write_text(svg('Difratelli Kids', '0 0 64 64', '<rect width="64" height="64" rx="16" fill="#FAF7F0"/>' + f'<g fill="#382C25" transform="translate(18 49)">{letter}</g>'), encoding='utf-8')
manifest = {
    'revision': 'issue-28-identity-v1', 'approvalStatus': 'pending-human-review',
    'sourceIssue': 'https://github.com/danielluis07/difratelli-kids-v2/issues/28',
    'palette': {'ivory': '#FAF7F0', 'brown': '#382C25', 'teal': '#246B63', 'butter': '#F2D477', 'coral': '#E9A18F'},
    'typography': {'wordmark': 'Fraunces 600 / optical size 72 / SOFT 50 / WONK 1', 'descriptor': 'DM Sans 500 / optical size 22'},
    'editing': 'SVG paths and groups are editable; outlined glyphs render without font installation. Rerun the source script with retained OFL fonts to edit wording.',
    'assets': [{'id': p.stem, 'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'format': 'editable-svg', 'approvalStatus': 'pending-human-review'} for p in sorted(OUT.glob('*.svg'))],
    'fonts': [{'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted((ROOT / 'assets/identity/fonts').iterdir())],
}
(ROOT / 'docs/content/identity-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print(f'Exported {len(manifest["assets"])} editable SVG assets; human approval pending.')
