import Link from "next/link";
import { requireAdminPage } from "@/lib/require-admin";
import { StudioPage } from "@/components/admin/StudioPage";
import { ArrowIcon } from "@/components/admin/StudioIcons";

export const metadata = { title: "Website · TX Quince Studio" };

/** /admin/website — one calm list of everything on the public site the owner can change. */
const GROUPS: { title: string; links: { href: string; label: string; what: string }[] }[] = [
  {
    title: "Photos and films",
    links: [
      { href: "/admin/photos", label: "Photo dump", what: "Add new photos fast. They show under “Latest photos” on the homepage." },
      { href: "/admin/portfolio", label: "Portfolio", what: "Sort, star and tag the photographs families see across the site." },
      { href: "/admin/videos", label: "Films", what: "The films and the featured story." },
      { href: "/admin/hero", label: "Page imagery", what: "The first image or film on each page." },
      { href: "/admin/images", label: "Every image", what: "Every photo on the site, page by page, with Replace and Undo." },
    ],
  },
  {
    title: "Prices and packages",
    links: [
      { href: "/admin/prices", label: "Prices", what: "What families pay, the deposit and when the rest is due." },
      { href: "/admin/packages", label: "Packages", what: "What each package includes, in words." },
      { href: "/admin/price-guide", label: "DFW price guide", what: "The public quince price guide, from your lead sheet." },
    ],
  },
  {
    title: "Reviews",
    links: [{ href: "/admin/reviews", label: "Reviews", what: "Make a private review link for each mom, then approve what shows on the site." }],
  },
  {
    title: "Places",
    links: [{ href: "/admin/venues", label: "Venues", what: "The stories and details on each venue page." }],
  },
];

export default async function AdminWebsite() {
  await requireAdminPage("/admin/website");
  return (
    <StudioPage
      title="Website"
      intro="Everything on txquince.com you can change. Saves show on the site right away."
      actions={<a href="/" target="_blank" rel="noopener noreferrer" className="st-btn-ghost">View the site <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span></a>}
    >
      {GROUPS.map((g) => (
        <section key={g.title} aria-labelledby={`w-${g.title}`} className="st-card overflow-hidden">
          <h2 id={`w-${g.title}`} className="st-h2 px-5 pb-3 pt-5 sm:px-6">{g.title}</h2>
          <ul className="m-0 list-none p-0">
            {g.links.map((l) => (
              <li key={l.href} className="border-t border-[var(--tq-surface-2)]">
                <Link href={l.href} className="group flex min-h-16 items-center justify-between gap-4 px-5 py-3 transition-colors duration-[var(--tq-dur-fast)] hover:bg-[var(--tq-canvas)] focus-visible:-outline-offset-2 sm:px-6">
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold group-hover:underline group-hover:underline-offset-4">{l.label}</span>
                    <span className="mt-0.5 block text-sm text-[var(--tq-ink-mute)]">{l.what}</span>
                  </span>
                  <ArrowIcon className="shrink-0 text-[var(--tq-ink-mute)] group-hover:text-[var(--tq-ink)]" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </StudioPage>
  );
}
