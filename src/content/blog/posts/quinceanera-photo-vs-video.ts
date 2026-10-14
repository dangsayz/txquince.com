import type { BlogPost } from "@/content/blog";
import { TIER_PRICE_USD, BASE_CREW, BASE_HOURS, MAX_HOURS, usd } from "@/lib/commission";

const study = usd(TIER_PRICE_USD.study);
const cinema = usd(TIER_PRICE_USD.cinema);
const production = usd(TIER_PRICE_USD.production);
const archive = usd(TIER_PRICE_USD.archive);

const post: BlogPost = {
  slug: "quinceanera-photo-vs-video",
  title: "Quinceañera Photo vs. Video: Do You Need Both? (And What Each Costs in DFW)",
  metaTitle: "Quinceañera Photo vs. Video — Do You Need Both? (DFW Costs)",
  description:
    "Photos or video for your quinceañera — or both? A clear look at what each one captures, what quince videography includes, and the real DFW cost when you book them together.",
  category: "Photography & Film",
  excerpt:
    "Photos hold the still, perfect frames. Video holds the sound and the motion — the vals, the speeches, the surprise dance. How to decide between them, and what each costs in DFW.",
  publishedAt: "2026-06-09",
  updatedAt: "2026-10-14",
  readMinutes: 8,
  lead: "Almost every parent planning a quinceañera asks the same question: do we really need video, or is a photographer enough? It's a fair question, and the answer depends on which moments you can't imagine losing. This walks through what photos capture, what video captures, what quince videography actually includes, and the real cost picture in Dallas–Fort Worth so you can decide without guessing.",
  content: [
    { type: "h2", text: "The short answer" },
    {
      type: "p",
      text: "You don't technically need both. Plenty of families book photo-only and are happy. But photo and video capture two different things, and the moments that move — the vals, the speeches, the surprise dance, your daughter's face when the music starts — only fully live on video. If your budget can stretch to both, a single team that does photo + video is the easiest way to get there. At [TX Quince](/#commissions), the Portrait Session is our photo-only package; Photo + Video, the Full Celebration, and the Two-Day Celebration all include both.",
    },
    { type: "h2", text: "What photos capture that video can't" },
    {
      type: "p",
      text: "A photograph stops time. It's the frame you print, hang on the wall, and hand to your daughter twenty years from now. Photos are deliberate, composed, and built to last — the formal portraits with both families, the detail shots of the dress and the zapatilla, the one perfect look across the room. You can hold a photo in your hand. You scroll past video; you frame a photograph.",
    },
    {
      type: "p",
      text: "Photos are also how most of the day gets shared — the gallery your relatives in Mexico will open the next morning, the prints for the abuelos, the image that becomes the thank-you card. If you only ever do one thing, professional photography is the foundation. That's why every [TX Quince package](/#commissions) includes it.",
    },
    { type: "h2", text: "What video captures that a photo never will" },
    {
      type: "p",
      text: "Video captures the two things a still image physically cannot: motion and sound. And at a quinceañera, those are exactly where the emotion lives.",
    },
    {
      type: "ul",
      items: [
        "The voices — your toast, the padrinos' words, the priest during la misa, the song your daughter chose. A photo of a speech is a person holding a microphone. Video is the words themselves.",
        "The vals — the waltz is choreography. It only makes sense in motion, turning across the floor with the court. A single frame can't tell that story.",
        "The surprise dance — the baile sorpresa is built to be watched start to finish. The drop, the reveal, the crowd's reaction. This is the clip the family replays for years.",
        "The reactions — her father's face during the father–daughter dance, her mother tearing up, the room erupting. Those happen in a second and a half. Video holds them; a shutter usually misses them.",
      ],
    },
    {
      type: "p",
      text: "Two of those — the [vals and the surprise dance](/blog/court-vals-surprise-dance-quinceanera) — are the single most common thing families wish they had on video afterward. See how they read on screen in our [portfolio highlight videos](/portfolio).",
    },
    { type: "h2", text: "The emotional case for video" },
    {
      type: "p",
      text: "We won't fear-monger you into a bigger package. But we'll tell you what we see: the families who skip video are the ones who most often wish, a year later, that they hadn't. Photos almost never get regretted — you have them, they're beautiful, done. Video is the one people wish for after the fact, because by then the day is gone and there's no second chance to record a voice or a dance.",
    },
    {
      type: "callout",
      text: "Nobody has ever told us they regret having video of their daughter's quinceañera. The regret only ever runs the other way. That's the whole case — not pressure, just what we've watched happen.",
    },
    { type: "h2", text: "What quince videography actually includes" },
    {
      type: "p",
      text: "\"Video\" sounds vague, so let's be specific. A real quince video is not a raw, hour-long recording nobody watches. It's edited storytelling, usually delivered in two forms:",
    },
    {
      type: "ul",
      items: [
        "A documentary-style edit — the longer cut that walks through the day in order: getting ready, la misa, the toasts, the vals, the dancing. This is the keepsake you sit down and watch with family.",
        "A 3–5 minute highlight video — the short version, cut to music, that captures the feeling of the whole day. This is the one you'll actually share, and the one your daughter will post.",
      ],
    },
    {
      type: "p",
      text: "On our photo + video packages, the full-length video comes with a short trailer and short vertical videos for social media — and with the Two-Day Celebration the first one arrives within 48 hours — so you have something to post while the day is still fresh instead of waiting months.",
    },
    {
      type: "cta",
      heading: "See exactly which packages include video",
      body: `The Portrait Session is photo only. Photo + Video, the Full Celebration, and the Two-Day Celebration pair photographers with videographers — one of each with Photo + Video, or a team of ${BASE_CREW.production} or ${BASE_CREW.archive} with the bigger packages, in the mix you choose. Compare them side by side.`,
      href: "/#commissions",
      label: "Compare packages",
    },
    { type: "h2", text: "One team for both vs. two separate vendors" },
    {
      type: "p",
      text: "If you decide on both, the next question is whether to hire one team that shoots photo + video or book a separate photographer and a separate videographer. We're biased, but the practical case for one team comes down to four things.",
    },
    {
      type: "ul",
      items: [
        "Coordination — two vendors who've never met have to negotiate angles, lighting, and who stands where during the vals. One team has already worked that out. You won't see two strangers blocking each other's shots.",
        "One point of contact — one contract, one timeline, one deposit, one person who knows your whole day. Not two email threads and two invoices to chase.",
        "A matched look — the photos and the video share an eye, so the gallery and the video feel like the same day, not two different events shot by people with different taste.",
        "Cost — and this is the part most families don't expect. At the same level of craft, booking both from one team usually costs less than hiring two solo vendors separately.",
      ],
    },
    { type: "h2", text: "The real DFW cost picture" },
    {
      type: "p",
      text: "In Dallas–Fort Worth, most quince studios publish photo-only packages around $1,500–$3,000, and a separate videographer can add a similar amount on top. Combined photo + video packages usually run about $3,000–$5,500, and luxury quince collections $5,500–$8,000 and up — usually less than hiring the same caliber of photographer and videographer separately, because the team is already on-site and the day is planned once. Across a whole celebration, photo and video typically take about 8–15% of the budget.",
    },
    {
      type: "p",
      text: `Anchored to our packages: the Portrait Session is ${study} — photos only, ${BASE_HOURS.study} hours with one photographer. Photo + Video is ${cinema} — ${BASE_HOURS.cinema} hours with one photographer and one videographer, an 8–10 minute full-length video in 4K, a short trailer, and short videos for social media. The Full Celebration, at ${production}, is the one we recommend for most celebrations — ${BASE_HOURS.production} hours, a team of ${BASE_CREW.production} and a day-of coordinator, a portrait session, a 12–15 minute full-length video, and a printed photo album. The Two-Day Celebration, at ${archive}, gives you ${BASE_HOURS.archive} hours plus a second day for portraits, with a team of ${BASE_CREW.archive} and a day-of coordinator. Need more time on the day? You can add hours, one at a time, up to ${MAX_HOURS} in all. For the full breakdown of every inclusion, see [which packages include video](/#commissions), and for a wider look at pricing read our [quinceañera photographer cost guide for DFW](/blog/quinceanera-photographer-cost-dallas-fort-worth).`,
    },
    { type: "h2", text: "If your budget only stretches one way" },
    {
      type: "p",
      text: "Sometimes both isn't in the budget this year, and that's okay — there's no wrong answer here, only a clear way to choose. Ask yourself one thing: which matters more to your family, the framed still you'll hang on the wall, or the moving record of the speeches and the dances?",
    },
    {
      type: "ol",
      items: [
        "If you want something to hold, print, and display — choose photo. It's the durable keepsake, and it's the foundation we'd start everyone on.",
        "If the moments that matter most to you move and make sound — the vals, the surprise dance, the toasts — lean video, because those don't survive as photos.",
        "If you can stretch a little, choose a package that includes both rather than adding a second vendor — it's the better value and the smoother day.",
      ],
    },
    {
      type: "p",
      text: "Still weighing it? Read [how to choose a quinceañera photographer in DFW](/blog/how-to-choose-quinceanera-photographer-dfw) so you know what to look for in either one, then run through [the questions to ask before you book](/blog/questions-to-ask-quinceanera-photographer). When you're ready, you can [check if your date is open](/check-your-date) in a few seconds, or [reserve your date](/#intake) to lock today's price.",
    },
  ],
  faqs: [
    {
      q: "Do I need a videographer for my quinceañera?",
      a: "You don't strictly need one — many families book photo-only and are happy. But the moments families most often wish they'd recorded — the vals, the surprise dance, the toasts, your daughter's reactions — only fully live on video, because they're made of motion and sound. If your budget allows, video is the thing people regret skipping, not the thing they regret having.",
    },
    {
      q: "Is photo or video more important for a quinceañera?",
      a: "Photos are the foundation — the framed, printable photos you'll hang on the wall and share with family. Video captures what a photo can't: the speeches, the music, the dances, and the reactions in motion. If you can only do one, choose photo as the keepsake; if the moving, sound-filled moments matter most to your family, lean video. Ideally a combined team gives you both.",
    },
    {
      q: "What's included in quinceañera videography?",
      a: "A proper quince video isn't a raw recording — it's an edited story, usually delivered in two pieces: a documentary-style edit that walks through the full day in order, and a 3–5 minute highlight video cut to music. On TX Quince photo + video packages it also includes a short trailer and short vertical videos for social media, so you have something to share while the day is fresh.",
    },
    {
      q: "Is it cheaper to book photo and video together?",
      a: "Usually, yes — at the same level of craft. In DFW, combined photo + video packages commonly run about $3,000–$5,500, typically less than booking a comparable photographer and videographer separately, because the team is already on-site and the day is planned once.",
    },
    {
      q: "Which TX Quince packages include both photo and video?",
      a: `The Portrait Session (${study}) is photo only. Photo + Video (${cinema}), the Full Celebration (${production}), and the Two-Day Celebration (${archive}) all include photo + video, with a team of ${BASE_CREW.cinema}, ${BASE_CREW.production} or ${BASE_CREW.archive} in whatever mix of photographers and videographers you choose. The Full Celebration is the one we recommend for most celebrations. You can compare every inclusion in the packages on our homepage.`,
    },
    {
      q: "Can one team shoot both the photos and the video?",
      a: "Yes — and it's usually the better choice. One team means coordinated angles during the vals and surprise dance, a single point of contact and contract, a matched visual style between gallery and video, and lower cost than hiring two separate vendors. Every TX Quince photo + video package is built exactly this way.",
    },
  ],
  related: [
    "how-to-choose-quinceanera-photographer-dfw",
    "court-vals-surprise-dance-quinceanera",
    "quinceanera-photographer-cost-dallas-fort-worth",
    "questions-to-ask-quinceanera-photographer",
  ],
};

export default post;
