from playwright.async_api import async_playwright
from playwright.sync_api import sync_playwright
import asyncio


async def capture_snapshot():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto('https://github.com/search?q=dump+website+language%3APython&type=repositories&l=Python',wait_until='networkidle')

        session = await page.context.new_cdp_session(page)

        doc = await session.send('Page.captureSnapshot', {'format': 'mhtml'})

        with open('snapshot.mhtml', 'w', encoding='utf-8') as f:
            f.write(doc['data'])

        await browser.close()


asyncio.run(capture_snapshot())