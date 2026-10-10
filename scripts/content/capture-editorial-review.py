"""Capture the asset review with a real viewport; does not test the storefront."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
import json

root = Path(__file__).resolve().parents[2]
browser_path = os.environ.get('EDITORIAL_REVIEW_BROWSER', 'C:/Program Files/Google/Chrome/Application/chrome.exe')
manifest = json.loads((root / 'docs/content/editorial-manifest.json').read_text(encoding='utf-8'))
left = next(asset for asset in manifest['assets'] if asset['role'] == 'hero-left')
right = next(asset for asset in manifest['assets'] if asset['role'] == 'hero-right')
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path=browser_path, headless=True)
    for width, variant in [(390, 'compact'), (768, 'tablet'), (1024, 'desktop-narrow'), (1440, 'desktop')]:
        page = browser.new_page(viewport={'width': width, 'height': 1050})
        page.goto((root / 'docs/content/editorial-review.html').as_uri())
        page.evaluate('document.fonts.ready')
        page.evaluate('Promise.all([...document.images].map(image => image.decode()))')
        selected = page.locator('.hero img').first.evaluate('(image) => image.currentSrc')
        crop = next(crop for crop in left['crops'] if crop['name'] == variant)
        assert selected.endswith(Path(crop['webPath']).name), selected
        assert page.locator('.hero img:visible').count() == (2 if width >= 1024 else 1)
        if width >= 1024:
            right_crop = next(crop for crop in right['crops'] if crop['name'] == variant)
            selected_right = page.locator('.hero img').nth(1).evaluate('(image) => image.currentSrc')
            assert selected_right.endswith(Path(right_crop['webPath']).name), selected_right
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.screenshot(path=str(root / f'docs/content/editorial-hero-{width}-review.png'))
        page.close()
        print(f'{width}px: correct {variant} source, hero visibility and no horizontal overflow; screenshot captured.')
    browser.close()
