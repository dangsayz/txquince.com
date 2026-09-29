"use client";

import { useState } from "react";
import { Avatar, Badge, Button, ButtonLink, Chip, Divider, Drawer, IconButton, Input, Lightbox, Modal, Select, Skeleton, Tag, Tabs, Textarea, Toast, Tooltip } from "@/components/ui";

const swatches = [
  { name: "Canvas", className: "bg-cream", hex: "#FAFAFA" },
  { name: "Surface", className: "bg-ivory", hex: "#F5F5F5" },
  { name: "Ink", className: "bg-ink", hex: "#1D1D1F" },
  { name: "Action", className: "bg-accent", hex: "#303033" },
  { name: "Border", className: "bg-line", hex: "#D7D7D9" },
  { name: "Error", className: "bg-danger", hex: "#B42318" },
] as const;

export default function StyleguidePage() {
  const [filter, setFilter] = useState("All moments");
  const [collection, setCollection] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-20">
      <div className="border-b border-line pb-10">
        <Badge>TX Quince design system</Badge>
        <h1 className="mt-4 font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink">The visual language</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-soft">A clear frame for real quinceañera photography, planning, and date requests.</p>
      </div>

      <section className="py-12" aria-labelledby="colors-heading">
        <h2 id="colors-heading" className="text-xl font-semibold text-ink">Color</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {swatches.map((swatch) => (
            <div key={swatch.name} className="overflow-hidden rounded-xl border border-line bg-white">
              <div className={`h-24 ${swatch.className}`} aria-hidden="true" />
              <div className="border-t border-line p-3">
                <p className="text-sm font-medium text-ink">{swatch.name}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{swatch.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line py-12" aria-labelledby="type-heading">
        <h2 id="type-heading" className="text-xl font-semibold text-ink">Typography</h2>
        <p className="mt-6 font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink">A day worth remembering.</p>
        <p className="mt-4 max-w-xl text-base leading-7 text-ink-soft">Inter carries headlines and body copy. Moderate weight and restrained spacing keep the photography in focus.</p>
        <p className="mt-5 text-xs font-bold tracking-[0.02em] text-accent-strong">Section label and metadata</p>
      </section>

      <section className="border-t border-line py-12" aria-labelledby="controls-heading">
        <h2 id="controls-heading" className="text-xl font-semibold text-ink">Controls</h2>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ButtonLink href="/reserve">Reserve your date</ButtonLink>
          <ButtonLink href="/check-your-date" tone="secondary">Check your date</ButtonLink>
          <Button tone="quiet" onClick={() => setToastOpen(true)}>Quiet action</Button>
          <Button disabled>Disabled action</Button>
          <Button loading>Loading action</Button>
          <IconButton label="Sample save action" onClick={() => setToastOpen(true)}>♡</IconButton>
          <Badge>Photography</Badge>
          <Tag>Portraits</Tag>
        </div>
        <div className="mt-8 flex flex-wrap gap-2" aria-label="Example filters">
          {["All moments", "Portraits", "Celebration", "Details"].map((item) => (
            <Chip key={item} active={filter === item} onClick={() => setFilter(item)}>{item}</Chip>
          ))}
        </div>
        <div className="mt-8 max-w-md">
          <Input id="styleguide-email" label="Email address" type="email" placeholder="you@example.com" hint="We reply personally to date requests." />
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-ink">Collection</label>
            <Select value={collection} onChange={setCollection} options={[{ value: "essential", label: "Essential" }, { value: "signature", label: "Signature" }, { value: "legacy", label: "Legacy" }]} ariaLabel="Collection" />
          </div>
          <div className="mt-5"><Textarea id="styleguide-message" label="Your message" placeholder="Tell us about your celebration" /></div>
        </div>
      </section>

      <section className="border-t border-line py-12" aria-labelledby="components-heading">
        <h2 id="components-heading" className="text-xl font-semibold text-ink">More components</h2>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Avatar alt="TX Quince studio" initials="TX" />
          <Tooltip text="A small piece of helpful context"><span className="inline-flex size-11 items-center justify-center rounded-full border border-line text-sm text-ink">?</span></Tooltip>
          <Button tone="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button tone="secondary" onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          <Button tone="secondary" onClick={() => setToastOpen(true)}>Show toast</Button>
          <Button tone="secondary" onClick={() => setLightboxOpen(true)}>Open lightbox</Button>
        </div>
        <Divider className="my-8" />
        <Tabs label="Example details" items={[{ id: "overview", label: "Overview", content: <p className="text-sm text-ink-soft">A concise view of the collection.</p> }, { id: "details", label: "Details", content: <p className="text-sm text-ink-soft">More detail about what is included.</p> }]} />
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Plan your celebration" description="A focused decision surface."><p className="text-sm leading-6 text-ink-soft">Choose an action and continue when you are ready.</p></Modal>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Your selection"><p className="text-sm leading-6 text-ink-soft">A side panel for supporting details.</p></Drawer>
      <Toast open={toastOpen} onClose={() => setToastOpen(false)} message="Your selection was saved in this preview." />
      <Lightbox open={lightboxOpen} onClose={() => setLightboxOpen(false)} src="/brand/wm.png" alt="TX Quince wordmark" caption="Studio wordmark preview" />

      <section className="border-t border-line py-12" aria-labelledby="loading-heading">
        <h2 id="loading-heading" className="text-xl font-semibold text-ink">Loading state</h2>
        <div className="mt-6 max-w-xs rounded-xl border border-line bg-white p-3">
          <Skeleton className="aspect-[4/3] w-full" label="Loading portfolio image" />
          <Skeleton className="mt-4 h-4 w-2/3" label="Loading portfolio title" />
          <Skeleton className="mt-2 h-3 w-1/3" label="Loading portfolio details" />
        </div>
      </section>
    </div>
  );
}
