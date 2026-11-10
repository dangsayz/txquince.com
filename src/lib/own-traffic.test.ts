import { describe, expect, it } from "vitest";
import { isAutomatedUA, networkKey, OWNER_NET_MAX, parseNetworks, pruneNetworks, touchNetwork } from "./own-traffic";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1";
const CHROME_MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";
const ANDROID = "Mozilla/5.0 (Linux; Android 15; SM-S921U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36";
const IG_APP = `${IPHONE} Instagram 356.0.0.21.109 (iPhone15,3; iOS 18_6; en_US; en; scale=3.00; 1290x2796; 665336423)`;
const FB_APP = "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UQ1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/141.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/480.0.0.54.88;]";
const CUBOT = "Mozilla/5.0 (Linux; Android 13; CUBOT KINGKONG 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36";

describe("isAutomatedUA", () => {
  it("counts real browsers, the Instagram and Facebook in-app browsers included", () => {
    for (const ua of [IPHONE, CHROME_MAC, ANDROID, IG_APP, FB_APP, CUBOT]) expect(isAutomatedUA(ua)).toBe(false);
  });

  it("drops our own test tools (Playwright / headless Chrome)", () => {
    expect(isAutomatedUA(CHROME_MAC.replace("Chrome/", "HeadlessChrome/"))).toBe(true);
    expect(isAutomatedUA("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Chrome-Lighthouse")).toBe(true);
  });

  it("drops crawlers, link previews, monitors and scripts", () => {
    for (const ua of [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "WhatsApp/2.23.20.0 A",
      "Mozilla/5.0 (compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)",
      "curl/8.5.0",
      "python-requests/2.32.3",
    ]) {
      expect(isAutomatedUA(ua)).toBe(true);
    }
  });

  it("drops a request with no User-Agent", () => {
    expect(isAutomatedUA(null)).toBe(true);
    expect(isAutomatedUA("  ")).toBe(true);
  });
});

describe("networkKey", () => {
  it("IPv4: the address itself", () => {
    expect(networkKey("203.0.113.24")).toBe("4:203.0.113.24");
    expect(networkKey("::ffff:203.0.113.24")).toBe("4:203.0.113.24");
  });

  it("IPv6: the /64, so every device in one home matches", () => {
    const a = networkKey("2600:1700:abcd:12:a1b2:c3d4:e5f6:1");
    expect(a).toBe("6:2600:1700:abcd:12");
    expect(networkKey("2600:1700:ABCD:0012::99")).toBe(a);
    expect(networkKey("2600:1700:abcd:13::99")).not.toBe(a);
    expect(networkKey("2001:db8::1")).toBe("6:2001:db8:0:0");
  });

  it("null for anything that is not an address", () => {
    for (const bad of [null, "", "unknown", "999.1.1.1", "1.2.3", "not-an-ip", "1::2::3", "1:2:3"]) expect(networkKey(bad)).toBeNull();
  });
});

describe("owner network list", () => {
  const now = Date.parse("2026-11-10T12:00:00Z");
  const h = (c: string) => c.repeat(64);
  const ago = (days: number) => new Date(now - days * 86_400_000).toISOString();

  it("adds a new network and keeps the others", () => {
    const next = touchNetwork({ [h("a")]: ago(3) }, h("b"), now);
    expect(Object.keys(next ?? {}).sort()).toEqual([h("a"), h("b")]);
  });

  it("does not write again when the network was seen in the last hours", () => {
    expect(touchNetwork({ [h("a")]: new Date(now - 3_600_000).toISOString() }, h("a"), now)).toBeNull();
    expect(touchNetwork({ [h("a")]: ago(1) }, h("a"), now)).not.toBeNull();
  });

  it("forgets a network 45 days after the owner last used it, and bad keys", () => {
    expect(pruneNetworks({ [h("a")]: ago(46), [h("b")]: ago(44), nope: ago(1) }, now)).toEqual({ [h("b")]: ago(44) });
  });

  it("keeps only the newest networks", () => {
    const many = Object.fromEntries(Array.from({ length: 16 }, (_, i) => [h(i.toString(16)), ago(i)]));
    const kept = pruneNetworks(many, now);
    expect(Object.keys(kept)).toHaveLength(OWNER_NET_MAX);
    expect(kept[h("0")]).toBe(ago(0));
    expect(kept[h("f")]).toBeUndefined();
  });

  it("parses only string values from a stored object", () => {
    expect(parseNetworks({ a: "x", b: 2 })).toEqual({ a: "x" });
    expect(parseNetworks([1])).toEqual({});
    expect(parseNetworks(null)).toEqual({});
  });
});
