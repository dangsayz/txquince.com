import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";

type ConfirmationPageProps = {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  primaryLabel: string;
  homeLabel: string;
  homeHref: string;
  contactLabel: string;
};

export function ConfirmationPage({
  eyebrow,
  title,
  children,
  primaryLabel,
  homeLabel,
  homeHref,
  contactLabel,
}: ConfirmationPageProps) {
  return (
    <section className="bg-white">
      <div className="relative h-[32svh] min-h-64 overflow-hidden bg-greige sm:h-[40svh]">
        <Image src="/portfolio/save-date.webp" alt="" fill priority unoptimized sizes="100vw" className="object-cover object-[center_46%]" />
      </div>
      <div className="mx-auto max-w-[55rem] px-5 py-20 sm:px-10 sm:py-28">
        <p className="text-[.7rem] uppercase tracking-[.2em] text-ink-soft">{eyebrow}</p>
        <h1 className="mt-7 max-w-[22ch] font-display text-[clamp(2.1rem,3.3vw,3.3rem)] font-light leading-tight tracking-[-.035em] text-ink">{title}</h1>
        <div className="mt-7 max-w-2xl font-serif text-lg leading-8 text-ink-soft">{children}</div>
        <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-2 border-t border-line pt-6">
          <Link href="/portfolio" className="inline-flex min-h-12 items-center gap-6 border-b border-ink text-xs uppercase tracking-[.14em] text-ink">{primaryLabel}<span aria-hidden="true">↗</span></Link>
          <Link href={homeHref} className="inline-flex min-h-12 items-center text-xs uppercase tracking-[.14em] text-ink-soft">{homeLabel}</Link>
        </div>
        <p className="mt-12 text-sm leading-7 text-ink-soft">{contactLabel} <a href={`mailto:${site.contact.email}`} className="text-ink underline underline-offset-4">{site.contact.email}</a>.</p>
      </div>
    </section>
  );
}
