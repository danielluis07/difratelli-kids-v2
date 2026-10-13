"""Check the content review; storefront acceptance belongs to implementation."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os

root = Path(__file__).resolve().parents[2]
if (root / "docs/content/homepage-approval.json").exists():
    raise SystemExit("The approved review screenshots are immutable. Create a new revision before recapturing.")
browser_path = os.environ.get("EDITORIAL_REVIEW_BROWSER", "C:/Program Files/Google/Chrome/Application/chrome.exe")
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path=browser_path, headless=True)
    for width in [390, 768, 1024, 1440, 1920]:
        page = browser.new_page(viewport={"width": width, "height": 1080}, reduced_motion="reduce")
        page.goto((root / "docs/content/homepage-review.html").as_uri())
        page.evaluate("document.fonts.ready")
        page.evaluate("Promise.all([...document.images].map(image => image.decode()))")
        assert page.locator(".hero img:visible").count() == (2 if width >= 1024 else 1)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), width
        assert page.locator(".tiles article").count() == 8
        assert page.locator(".looks article > .look-row").count() == 3
        assert page.locator(".social article").count() == 7
        for selector in [".hero-copy", ".hero-actions"]:
            rect = page.locator(selector).bounding_box()
            panel = page.locator(".hero-left").bounding_box()
            assert rect["x"] >= panel["x"] and rect["x"] + rect["width"] <= panel["x"] + panel["width"], (width, selector)
            assert rect["y"] >= panel["y"] and rect["y"] + rect["height"] <= panel["y"] + panel["height"], (width, selector)
        page.locator(".hero").screenshot(path=str(root / f"docs/content/homepage-hero-{width}-review.png"))
        page.close()
        print(f"{width}px: images decoded, hero visibility/copy bounds correct, no horizontal overflow.")
    browser.close()
