#!/usr/bin/env node
/**
 * secret-shopper.cjs — walks the site like a first-time mom and reports what is wrong.
 *
 *   node scripts/secret-shopper.cjs                  # live site, key pages + a blog sample
 *   node scripts/secret-shopper.cjs --all            # every URL in the sitemap
 *   node scripts/secret-shopper.cjs --base http://localhost:3000
 *
 * It only LOOKS and CLICKS, and is never counted as a visitor. It never submits a form, never pays, never signs
 * up, never posts a comment. Needs Playwright (pre-installed in Claude cloud
 * sessions; locally: npx playwright install chromium).
 *
 * Each page, on a phone (390px) and a desktop (1440px):
 *   loads (HTTP 200) · no script errors · no failed requests from our own site
 *   no stale-while-revalidate cache header (it breaks open browsers after a deploy)
 *   Gate 1: no sideways scroll · Gate 2: tap targets ≥44px · Gate 3: inputs ≥16px
 *   one <h1>, a <title> · no broken images
 * Then the flows: menu → log in / create account, package → booking panel,
 * budget page, highlight → "Comment on this", log in pages show a form,
 * private pages bounce to log in, write APIs refuse a stranger.
 * Last: every internal link found is checked for a 404.
 *
 * Exit code 1 when anything FAILS (warnings do not fail). Report: stdout, and
 * --out <file.md> for a markdown copy.
 */
const { chromium } = require("playwright");
const fs = require("node:fs");

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : true) : fallback;
};
const BASE = String(arg("base", "https://txquince.com")).replace(/\/$/, "");
const ALL = Boolean(arg("all", false));
const OUT = arg("out", null);
const VIEWPORTS = [
  { name: "phone", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];
// Console noise that is known and harmless (see src/lib/security-headers.ts).
// "%c%d font-size:0" is Cloudflare Turnstile's own console probe.
const IGNORE_CONSOLE = [/Content Security Policy/i, /cloudflareinsights/i, /Failed to load resource/i, /ERR_BLOCKED_BY_CLIENT/i, /report-only/i, /^%c%[do] font-size:0/];

/**
 * A fresh browser for one walk. The shopper is not a family: its page views
 * are answered here and never reach the site's visitor numbers (the site also
 * drops test browsers itself; see src/lib/own-traffic.ts).
 */
async function newShopper(browser, view) {
  const ctx = await browser.newContext({ viewport: { width: view.width, height: view.height } });
  await ctx.route("**/api/track", (route) => route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
  return ctx;
}

/** Load a page. Pages with live widgets (Turnstile, polling) never go "network idle", so wait for load + a beat. */
async function open(page, url) {
  const res = await page.goto(url, { waitUntil: "load", timeout: 45000 }).catch(() => null);
  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch(() => undefined);
  await page.waitForTimeout(500);
  return res;
}

const findings = []; // { level: "FAIL"|"WARN", page, view, what }
const add = (level, page, view, what) => findings.push({ level, page, view, what });

async function sitemapUrls() {
  const res = await fetch(`${BASE}/sitemap.xml`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

function pick(urls) {
  if (ALL) return urls;
  const blogEn = urls.filter((u) => u.startsWith("/blog/")).slice(0, 4);
  const blogEs = urls.filter((u) => u.startsWith("/es/blog/")).slice(0, 3);
  const cities = urls.filter((u) => /^\/(es\/fotografo-de-quinceaneras|quinceanera-photographer)\//.test(u)).slice(0, 3);
  const venues = urls.filter((u) => u.startsWith("/venues/")).slice(0, 2);
  const rest = urls.filter((u) => !/^\/(es\/)?blog\/|^\/(es\/fotografo-de-quinceaneras|quinceanera-photographer)\/|^\/venues\//.test(u));
  return [...new Set([...rest, ...blogEn, ...blogEs, ...cities, ...venues, "/login", "/signup", "/es/entrar", "/es/registro"])];
}

async function checkPage(ctx, path, view, links) {
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on("pageerror", (e) => errors.push(String(e.message || e).slice(0, 160)));
  page.on("console", (m) => {
    if (m.type() === "error" && !IGNORE_CONSOLE.some((r) => r.test(m.text()))) errors.push(m.text().slice(0, 160));
  });
  page.on("response", (r) => {
    const u = r.url();
    if (r.status() >= 400 && u.startsWith(BASE) && !u.includes("/api/csp-report")) failed.push(`${r.status()} ${new URL(u).pathname}`);
  });
  try {
    let res = await open(page, BASE + path);
    // A deploy landing mid-run leaves the old page pointing at deleted script files for a moment: look again once.
    if (failed.some((f) => f.includes("/_next/static/"))) {
      errors.length = 0;
      failed.length = 0;
      await page.waitForTimeout(4000);
      res = await open(page, BASE + path);
    }
    const status = res ? res.status() : 0;
    if (status !== 200) add("FAIL", path, view.name, `page did not load (HTTP ${status || "timeout"})`);
    // Chrome reuses a stale-while-revalidate page across deploys, then asks for files the deploy deleted (next.config.ts expireTime).
    if (/stale-while-revalidate/i.test((res && res.headers()["cache-control"]) || "")) add("FAIL", path, view.name, "page tells browsers to reuse an old copy (stale-while-revalidate): shows \"We couldn't load this page\" after a deploy");
    const r = await page.evaluate(() => {
      const vis = (e) => {
        const b = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        return b.width > 0 && b.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.05;
      };
      const label = (e) => (e.getAttribute("aria-label") || e.textContent || e.getAttribute("name") || e.tagName).trim().replace(/\s+/g, " ").slice(0, 40);
      const small = [];
      for (const e of document.querySelectorAll("a[href], button, input:not([type=hidden]):not([type=checkbox]):not([type=radio]), select, textarea, summary")) {
        if (!vis(e) || e.closest("[aria-hidden='true']") || e.tabIndex === -1) continue;
        // A link inside a sentence is text, not a button (WCAG inline exception).
        if (e.tagName === "A" && getComputedStyle(e).display === "inline" && e.closest("p, li, dd, label, figcaption, blockquote, .cl-footerAction")) continue;
        if (e.closest(".cl-footer") && /clerk/i.test(label(e))) continue; // Clerk's own badge
        const b = e.getBoundingClientRect();
        // 44px tall is the bar; a short word ("Home") may be narrower, down to the 24px floor.
        if (b.height < 43.5 || b.width < 24) small.push(`${label(e)} (${Math.round(b.width)}x${Math.round(b.height)})`);
      }
      const tiny = [...document.querySelectorAll("input:not([type=hidden]):not([type=checkbox]):not([type=radio]), select, textarea")]
        .filter((e) => vis(e) && parseFloat(getComputedStyle(e).fontSize) < 16)
        .map(label);
      const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc.slice(0, 90));
      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        // Top-level headings as a reader meets them: an <h1> marked aria-level 2+ is not one.
        h1: [...document.querySelectorAll("h1")].filter((h) => !(Number(h.getAttribute("aria-level")) > 1)).length,
        title: document.title,
        small: [...new Set(small)],
        tiny: [...new Set(tiny)],
        broken: [...new Set(broken)],
        links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
      };
    });
    if (r.overflow > 0) add("FAIL", path, view.name, `Gate 1: page scrolls sideways by ${r.overflow}px`);
    if (r.small.length) add(view.name === "phone" ? "FAIL" : "WARN", path, view.name, `Gate 2: ${r.small.length} tap target(s) under 44px: ${r.small.slice(0, 5).join("; ")}`);
    if (r.tiny.length) add("FAIL", path, view.name, `Gate 3: input text under 16px (iPhone zooms in): ${r.tiny.slice(0, 4).join("; ")}`);
    if (r.h1 !== 1) add("WARN", path, view.name, `${r.h1} <h1> headings (should be 1)`);
    if (!r.title) add("FAIL", path, view.name, "no page title");
    if (r.broken.length) add("FAIL", path, view.name, `broken image(s): ${r.broken.slice(0, 3).join("; ")}`);
    if (errors.length) add("FAIL", path, view.name, `script error: ${[...new Set(errors)].slice(0, 2).join(" | ")}`);
    if (failed.length) add("FAIL", path, view.name, `request failed: ${[...new Set(failed)].slice(0, 4).join(", ")}`);
    for (const h of r.links) {
      if (!h || h.startsWith("#") || /^(mailto:|tel:|sms:|javascript:)/.test(h)) continue;
      try {
        const u = new URL(h, BASE + path);
        if (u.origin === BASE) links.set(u.pathname, links.get(u.pathname) || path);
      } catch {
        add("WARN", path, view.name, `odd link: ${String(h).slice(0, 60)}`);
      }
    }
  } catch (e) {
    add("FAIL", path, view.name, `could not check: ${String(e).slice(0, 120)}`);
  } finally {
    await page.close();
  }
}

/** The things a mom actually does. Each step says what it expected. */
async function flows(browser) {
  const step = async (name, view, fn) => {
    const ctx = await newShopper(browser, view);
    const page = await ctx.newPage();
    try {
      await fn(page);
    } catch (e) {
      add("FAIL", `flow: ${name}`, view.name, String(e.message || e).split("\n")[0].slice(0, 200));
    } finally {
      await ctx.close();
    }
  };
  const expect = (ok, msg) => {
    if (!ok) throw new Error(msg);
  };
  const [phone, desktop] = VIEWPORTS;

  for (const view of VIEWPORTS) {
    await step("menu shows Log in and Create account", view, async (p) => {
      await open(p, BASE + "/");
      await p.click(".sh-menu");
      await p.waitForSelector(".sm-acct__btn", { timeout: 5000 });
      const hrefs = await p.$$eval(".sm-acct__btn", (as) => as.map((a) => a.getAttribute("href")));
      expect(hrefs.includes("/login") && hrefs.includes("/signup"), `menu account buttons go to ${hrefs.join(", ")}`);
    });
    await step("log in page shows a form with an email field", view, async (p) => {
      for (const path of ["/login", "/signup", "/es/entrar", "/es/registro"]) {
        await open(p, BASE + path);
        const ok = await p.waitForSelector(".cl-rootBox input[name='identifier'], .cl-rootBox input[name='emailAddress']", { timeout: 15000 }).then(() => true, () => false);
        expect(ok, `${path}: the log in form did not appear`);
      }
    });
    await step("picking a package opens the booking panel", view, async (p) => {
      await open(p, BASE + "/?collection=duo#intake");
      const box = await p.locator("#intake").boundingBox();
      expect(box && box.height > 200, "the booking panel (#intake) is missing or empty");
      const controls = await p.locator("#intake button, #intake input, #intake a").count();
      expect(controls > 2, "the booking panel has nothing to tap");
    });
    await step("budget page answers a typed budget", view, async (p) => {
      await open(p, BASE + "/budget");
      const input = p.locator("input[inputmode='numeric'], input[type='number'], input[type='text']").first();
      expect(await input.count(), "no budget field on /budget");
      const before = await p.locator("main, body").first().innerText();
      await input.fill("2000");
      await p.waitForTimeout(900);
      const after = await p.locator("main, body").first().innerText();
      expect(before !== after, "typing 2000 into the budget field changed nothing on the page");
    });
    await step("a shared budget link opens on the same answer; the offer form opens", view, async (p) => {
      await open(p, BASE + "/budget?b=1500");
      await p.waitForSelector(".bp-card", { timeout: 15000 }).catch(() => {});
      expect(await p.locator(".bp-card").count(), "/budget?b=1500 shows no package (the link lost the number)");
      expect((await p.locator(".bp-money input").first().inputValue()) === "1,500", "/budget?b=1500 did not fill the budget field with 1,500");
      await p.locator(".bp-offer__toggle").click();
      expect(await p.locator(".bp-offer form").count(), "the offer form did not open");
    });
  }

  await step("highlight a sentence → Comment on this → it lands in the comment box", desktop, async (p) => {
    const posts = (await sitemapUrls()).filter((u) => u.startsWith("/blog/"));
    await open(p, BASE + posts[0]);
    const rail = await p.waitForSelector(".tq-cmt__box[data-place='rail']", { state: "attached", timeout: 15000 }).then(() => true, () => false);
    expect(rail, "no comment box in the left column");
    const picked = await p.evaluate(() => {
      const para = [...document.querySelectorAll(".tq-blog-prose p")].find((x) => x.firstChild && x.firstChild.nodeType === 3 && x.firstChild.data.length > 90);
      if (!para) return false;
      para.scrollIntoView({ block: "center" });
      const r = document.createRange();
      r.setStart(para.firstChild, 2);
      r.setEnd(para.firstChild, 70);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
      return true;
    });
    expect(picked, "no paragraph to highlight");
    await p.waitForSelector(".tq-cmt-pick", { timeout: 4000 });
    await p.click(".tq-cmt-pick");
    await p.waitForSelector(".tq-cmt__quote-text", { timeout: 4000 });
    const login = await p.locator(".tq-cmt__box a.tq-btn").first().getAttribute("href");
    expect(login && login.includes("next="), "the comment box has no log in link back to the post");
  });

  await step("comment box is under the comments on a phone", phone, async (p) => {
    const posts = (await sitemapUrls()).filter((u) => u.startsWith("/blog/"));
    await open(p, BASE + posts[0]);
    // The box mounts after the page hydrates: wait for it, do not sample once.
    const box = await p.waitForSelector("#comments .tq-cmt__box[data-place='bottom']", { state: "attached", timeout: 15000 }).then(() => true, () => false);
    expect(box, "no comment box in the comments section");
  });

  // "Our experience at this venue": the Facebook button must share the venue's
  // share page, and that page must carry its own preview picture.
  await step("a venue's experience shares with its own preview card", desktop, async (p) => {
    await open(p, BASE + "/venues/vm-ballroom");
    const fb = p.locator(".tq-vx a[href*='facebook.com/sharer']");
    if (!(await fb.count())) return; // nothing is written for this venue yet
    const shared = new URL(decodeURIComponent((await fb.first().getAttribute("href")).split("u=")[1]));
    expect(shared.pathname === "/venues/vm-ballroom/experience", `Facebook button shares ${shared.pathname}`);
    expect(shared.searchParams.get("src") === "facebook", "Facebook link has no ?src=facebook tag");
    const res = await open(p, BASE + shared.pathname);
    expect(res && res.status() === 200, `share page answered ${res && res.status()}`);
    expect(await p.locator(".tq-vx h1").count(), "share page has no review heading");
    const og = await p.locator("meta[property='og:image']").first().getAttribute("content");
    expect(og && og.includes("/experience/card?v="), `og:image is ${og}`);
    const img = await fetch(og.replace(/^https?:\/\/[^/]+/, BASE));
    expect(img.ok && String(img.headers.get("content-type")).includes("image/png"), `preview card answered ${img.status}`);
  });

  await step("private pages send a stranger to log in", desktop, async (p) => {
    for (const [path, want] of [["/account", "/login"], ["/admin", "/admin/login"], ["/admin/comments", "/admin/login"]]) {
      await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
      // The bounce can be a client-side redirect: give it a moment.
      await p.waitForURL((u) => u.pathname === want, { timeout: 10000 }).catch(() => undefined);
      expect(new URL(p.url()).pathname === want, `${path} went to ${new URL(p.url()).pathname}, not ${want}`);
    }
  });

  // Write APIs must refuse someone who is not signed in (nothing is created).
  const refuse = async (name, path, method, body, want) => {
    const res = await fetch(BASE + path, { method, headers: { "content-type": "application/json", origin: BASE }, body: JSON.stringify(body) }).catch(() => null);
    if (!res || !want.includes(res.status)) add("FAIL", `flow: ${name}`, "api", `${method} ${path} answered ${res ? res.status : "nothing"}, expected ${want.join(" or ")}`);
  };
  await refuse("comment API refuses a stranger", "/api/comments", "POST", { post_slug: "x", lang: "en", body: "secret shopper" }, [401]);
  await refuse("comment admin API refuses a stranger", "/api/admin/comments", "PATCH", { id: "00000000-0000-0000-0000-000000000000", status: "approved" }, [401, 403]);
}

async function checkLinks(links) {
  const paths = [...links.keys()].filter((p) => !/^\/(api|_next|cdn-cgi)\//.test(p));
  let i = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (i < paths.length) {
        const path = paths[i++];
        const res = await fetch(BASE + path, { method: "GET", redirect: "follow" }).catch(() => null);
        if (!res || res.status >= 400) add("FAIL", links.get(path), "links", `link to ${path} is broken (HTTP ${res ? res.status : "no answer"})`);
      }
    }),
  );
  return paths.length;
}

(async () => {
  const started = Date.now();
  const urls = pick(await sitemapUrls());
  const browser = await chromium.launch();
  const links = new Map();
  for (const view of VIEWPORTS) {
    const ctx = await newShopper(browser, view);
    let i = 0;
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        while (i < urls.length) await checkPage(ctx, urls[i++], view, links);
      }),
    );
    await ctx.close();
  }
  await flows(browser);
  await browser.close();
  const linkCount = await checkLinks(links);

  const fails = findings.filter((f) => f.level === "FAIL");
  const warns = findings.filter((f) => f.level === "WARN");
  const group = (list) => {
    const by = new Map();
    for (const f of list) {
      const k = f.what;
      by.set(k, [...(by.get(k) || []), `${f.page} (${f.view})`]);
    }
    return [...by].map(([what, where]) => `- ${what}\n  on: ${[...new Set(where)].slice(0, 6).join(", ")}${new Set(where).size > 6 ? `, +${new Set(where).size - 6} more` : ""}`);
  };
  const lines = [
    `# Secret shopper · ${BASE} · ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`,
    "",
    `${urls.length} pages on phone and desktop, ${linkCount} links, 8 flows. ${Math.round((Date.now() - started) / 1000)}s.`,
    `**${fails.length} problem(s), ${warns.length} warning(s).**`,
    "",
    "## Problems",
    ...(fails.length ? group(fails) : ["None."]),
    "",
    "## Warnings",
    ...(warns.length ? group(warns) : ["None."]),
    "",
  ];
  const report = lines.join("\n");
  console.log(report);
  if (OUT) fs.writeFileSync(String(OUT), report);
  process.exit(fails.length ? 1 : 0);
})();
