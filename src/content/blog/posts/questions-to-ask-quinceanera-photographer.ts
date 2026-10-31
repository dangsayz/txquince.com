import type { BlogPost } from "@/content/blog";
import { BASE_CREW } from "@/lib/commission";
import { PT } from "@/lib/price-text";

const retainerPct = PT.deposit.percent;

const post: BlogPost = {
  slug: "questions-to-ask-quinceanera-photographer",
  title: "Questions to Ask Your Quinceañera Photographer Before You Book",
  description:
    "The real screening questions to ask a quinceañera photographer before booking in Dallas–Fort Worth — and what a good, honest answer to each one actually sounds like.",
  category: "Photography & Film",
  excerpt:
    "You've narrowed it down to a few names. Here are the eight questions that separate a safe booking from a regret — and the answer you want to hear.",
  publishedAt: "2026-06-09",
  updatedAt: "2026-10-14",
  readMinutes: 8,
  lead: "By the time you're reading this, you probably already have two or three photographers saved and a quote or two in your inbox. You don't need more options — you need a way to screen the ones you have. Below are the eight questions that actually matter, along with what a good answer to each one sounds like, so you can tell a confident professional from a nice website.",
  content: [
    { type: "h2", text: "How to use this list" },
    {
      type: "p",
      text: "You don't need to interrogate anyone. Send these in one message, or ask them on a quick call. What you're listening for is specificity — a real photographer answers in numbers, names, and policies, not vibes. If an answer is vague or dodges the question, that's information too. Here's each one, and what a straight answer should sound like.",
    },
    { type: "h2", text: "1. How many quinceañeras have you photographed?" },
    {
      type: "p",
      text: "A quince is not a wedding and it's not a birthday party — it has its own rhythm: the vals, the surprise dance, the changing of the shoes, la misa. You want someone who has shot enough of them to know what's coming next without being told.",
    },
    {
      type: "p",
      text: "What a good answer sounds like: a clear number and proof. Not \"a lot\" — an actual count, plus a link to full galleries you can scroll start to finish. Ask to see a complete quince, not a highlight video of someone's best frames from ten different events. Our [portfolio](/portfolio) shows whole days the way they actually unfolded.",
    },
    { type: "h2", text: "2. Is the portrait session day-of, or a separate pre-quince session?" },
    {
      type: "p",
      text: "This trips up a lot of families. Some studios shoot formal portraits the morning of the event; others build in a separate session weeks before — in her gown or a second dress, at a location you choose — so the day itself stays relaxed.",
    },
    {
      type: "p",
      text: "What a good answer sounds like: a clear explanation of which one is included, whether the other is available, and what it costs if it is. There's no single right model here — what matters is that they tell you plainly, so you're not surprised by a session you assumed was included (or a fee you didn't budget for). Our [packages](/#commissions) spell out exactly what each one covers — the Full Celebration, for example, includes a portrait session at one location.",
    },
    { type: "h2", text: "3. How many edited photos will I get, and how and when are they delivered?" },
    {
      type: "p",
      text: "\"Unlimited photos\" sounds generous and means almost nothing. What you care about is how many fully edited, finished images land in your hands — and how long you'll wait for them.",
    },
    {
      type: "p",
      text: "What a good answer sounds like: a delivery range and a turnaround time, in writing. A private online gallery you can download and share, an honest edit count tied to your coverage hours, and a date you can hold them to. On our video packages the full-length film also comes with a short highlight — 1 minute with the Duo and the Trio, 3–5 minutes with the Full Celebration — the quick version you'll want to share with family.",
    },
    {
      type: "callout",
      text: "Watch for the soft \"a few months.\" A studio that's confident in its workflow gives you a window — and tells you what you'll have to share in the meantime.",
    },
    { type: "h2", text: "4. Do you bring a second shooter, and at what coverage length?" },
    {
      type: "p",
      text: "One camera can't be in two places. When she's walking into the reception and her court is already inside reacting, a second artist is the difference between one angle and the whole moment.",
    },
    {
      type: "p",
      text: `What a good answer sounds like: whether a second shooter is included, available as an add-on, or not offered — and on which packages. With us, the Trio comes with two photographers and a videographer, and the Full Celebration with a team of ${BASE_CREW.production} plus a coordinator who runs the day. They're TX Quince's own team photographers and videographers, assigned by date and availability — families can't request specific people, the owners included — and every gallery and film is edited by the owners. You can see the reverse angles and dual-coverage moments they make possible across the [portfolio](/portfolio). If a photographer can't show you two-camera coverage, assume they work solo.`,
    },
    { type: "h2", text: "5. Do I get full usage and print rights to the images?" },
    {
      type: "p",
      text: "This is the question most families forget to ask, and the one that causes the most heartbreak later. Some studios deliver low-resolution files, watermark everything, or charge per print — meaning you can't make your own album or order prints at your own lab without paying again.",
    },
    {
      type: "p",
      text: "What a good answer sounds like: \"Yes — full usage and print rights, high-resolution files, print wherever you like.\" That's the standard you should expect, and it's exactly what's [included in every TX Quince package](/#commissions). If the answer involves print packages or per-image fees, factor that into the real price.",
    },
    { type: "h2", text: "6. What's the deposit, the payment schedule, and what locks my date?" },
    {
      type: "p",
      text: "A date isn't yours until something secures it. You want to know the exact dollar amount, when the rest is due, and the precise moment your Saturday is off the market for everyone else.",
    },
    {
      type: "p",
      text: `What a good answer sounds like: a specific deposit, a clear payment schedule with the balance due before the event, and a simple statement that the signed agreement plus deposit locks the date. With us, you sign the agreement online, we approve it within one day, and then a deposit of ${retainerPct} of your package locks your date and goes toward your total. The rest is due ${PT.balanceDays} days before the event. You can review the numbers in our [packages](/#commissions) and [check whether your date is still open](/check-your-date) before you commit.`,
    },
    {
      type: "cta",
      heading: "Ask us all of these — start a conversation",
      body: `Bring this whole list. Ask for a quick call and we'll answer every question. Real prices, real policies, real galleries.`,
      href: "/#intake",
      label: "Start a conversation",
    },
    { type: "h2", text: "7. What's your backup-gear, illness, weather, and rescheduling policy?" },
    {
      type: "p",
      text: "This is the question that tells you whether you're hiring a professional or a hobbyist with a nice camera. Things go wrong — a card fails, someone gets sick, a venue floods. What matters is whether there's a plan.",
    },
    {
      type: "ul",
      items: [
        "Backup gear: a real photographer shoots to two memory cards at once and carries a second camera body. Files are backed up in multiple places before they ever leave for home.",
        "Illness: there should be a named backup — an associate shooter from the same studio or a trusted network — so your day is covered even if your lead artist can't be there.",
        "Weather: an indoor or covered alternative for portraits, and the flexibility to move the timeline, not cancel it.",
        "Rescheduling: a written policy for what happens if the event date itself moves, and how the deposit carries over.",
      ],
    },
    {
      type: "p",
      text: "What a good answer sounds like: a calm, specific run-through of all four — because it's been thought through before you asked. If a photographer has never considered what happens if they get sick, that's your answer.",
    },
    { type: "h2", text: "8. Do you also video, or is that a separate vendor?" },
    {
      type: "p",
      text: "Photo and video are two different crafts. The question is whether one team handles both — coordinating the same timeline, the same vision — or whether you're hiring and managing two vendors who've never met.",
    },
    {
      type: "p",
      text: `What a good answer sounds like: a direct yes or no. We offer photo + video as one team on every package from the Duo up — the full-length film of her whole day plus a short highlight — with a team of ${BASE_CREW.cinema} to ${BASE_CREW.production} working the same day, not one person juggling a camera and a tripod. If you're weighing whether video is worth it at all, [photo vs. video for a quinceañera](/blog/quinceanera-photo-vs-video) walks through the tradeoff honestly.`,
    },
    { type: "h2", text: "Putting it together" },
    {
      type: "p",
      text: "You don't have to love every answer — you have to understand it. A good photographer will be glad you asked, because clear expectations protect them as much as you. If you want the full screening framework, [how to choose a quinceañera photographer in DFW](/blog/how-to-choose-quinceanera-photographer-dfw) goes deeper, and [what quinceañera photography actually costs here](/blog/quinceanera-photographer-cost-dallas-fort-worth) breaks down the numbers so the prices you're hearing make sense.",
    },
    {
      type: "p",
      text: "When you're ready, send us this entire list. We answer every one of them the same way for every family — [start a conversation](/#intake) and see.",
    },
  ],
  faqs: [
    {
      q: "What questions should I ask a quinceañera photographer?",
      a: "Ask how many quinceañeras they've shot, whether the portrait session is day-of or separate, how many edited photos you'll get and the turnaround, whether a second shooter is available, whether you receive full print rights, what the deposit and payment schedule are, what their backup-gear and rescheduling policy is, and whether they also video or use a separate videographer. The goal is specific answers — numbers, policies, and full galleries you can see.",
    },
    {
      q: "Do quinceañera photographers include print rights?",
      a: "Not all do — some deliver low-resolution or watermarked files, or charge per print. Always ask directly. At TX Quince, full usage and print rights and high-resolution files are included in every package, so you can print and make albums wherever you like at no extra cost.",
    },
    {
      q: "How many edited photos should I expect?",
      a: "It depends on coverage hours, but you should get a clear delivery range and turnaround time in writing rather than a vague \"unlimited.\" Expect a private online gallery you can download and share, plus — on packages with video — the full-length film of her day and a short highlight to share.",
    },
    {
      q: "What happens if my photographer gets sick?",
      a: "A professional studio has a backup plan: a named associate shooter or trusted network photographer who can step in, plus gear redundancy and multiple file backups. Ask for this policy before you book — if there's no answer, your day has no safety net.",
    },
  ],
  related: [
    "how-to-choose-quinceanera-photographer-dfw",
    "quinceanera-photographer-cost-dallas-fort-worth",
    "quinceanera-photo-vs-video",
  ],
};

export default post;
