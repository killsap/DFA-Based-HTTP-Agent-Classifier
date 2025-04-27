#!/usr/bin/env python3
"""
aiAgentTestHeadless.py  –  Playwright bot simulator for the DFA demo

- Spoofs a bot-like User-Agent  (H₂ token)
- Adds X-Requested-With: fetch    (H₁ token)
- Fires 11 rapid fetches           (D₁ + T₁ tokens, optional but reinforces)

The DFA will therefore classify the browser as **Agent** on the first click.

Usage
-----
    python click_live_button.py --url http://localhost:8080            # basic run
    python click_live_button.py --url http://localhost:8080 --openai   # plus LLM

Environment
-----------
    OPENAI_API_KEY   (only needed when --openai flag is used)
"""

import argparse, os, asyncio, openai
from playwright.async_api import async_playwright


# ---------- optional helper --------------------------------------------------
async def llm_explanation(prompt: str) -> str:
    openai.api_key = os.getenv("OPENAI_API_KEY")
    resp = openai.chat.completions.create(
        model="gpt-4o-mini",            # change to any model you have
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return resp.choices[0].message.content.strip()


# ---------- main -------------------------------------------------------------
async def main(url: str, ask_llm: bool):
    async with async_playwright() as pw:
        # 1) Launch browser
        browser = await pw.chromium.launch(headless=True)

        # 2) New context with bot-style headers
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (bot; HeadlessChrome/134.0) Safari/537.36",
            extra_http_headers={"X-Requested-With": "fetch"}
        )

        # 3) New page and navigate
        page = await context.new_page()
        await page.goto(url, wait_until="networkidle")

        # 4) (Optional) fire 11 quick fetches to trigger D₁/T₁
        await page.evaluate("() => { for (let i = 0; i < 11; i++) fetch('/'+i); }")

        # 5) Click the live-classify button
        await page.click("#live")
        await page.wait_for_selector("#result:not(:empty)")

        verdict = await page.text_content("#result")
        ua      = await page.evaluate("navigator.userAgent")
        print(f"Verdict displayed: {verdict} | UA sent: {ua}")

        # 6) Optional LLM explanation
        if ask_llm:
            summary = await llm_explanation(
                f"User-Agent: {ua}\nVerdict shown on page: {verdict}\n\n"
                "Give a one-sentence explanation of why the DFA classified the browser this way."
            )
            print("\nLLM explanation →", summary)

        await context.close()
        await browser.close()


# ---------- CLI --------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:8080",
                        help="URL of the DFA demo page")
    parser.add_argument("--openai", action="store_true",
                        help="Query OpenAI for a short explanation")
    args = parser.parse_args()
    asyncio.run(main(args.url, args.openai))

