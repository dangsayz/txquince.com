import Link from "next/link";
import { CTAButton } from "@/components/CTAButton";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-2xl flex-col items-center justify-center px-5 py-section text-center md:px-10 lg:px-16">
      <p className="font-display text-6xl text-wine md:text-7xl">404</p>
      <h1 className="mt-6 font-display text-3xl leading-tight text-ink text-balance md:text-4xl">
        This page slipped away.
      </h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
        The page you&apos;re looking for isn&apos;t here — but her day still deserves
        to be remembered beautifully.
      </p>
      <div className="mt-10">
        <CTAButton href="/" variant="primary">
          Back to home
        </CTAButton>
      </div>
      <Link
        href="/portfolio"
        className="mt-6 text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
      >
        Or browse the galleries
      </Link>
    </section>
  );
}
