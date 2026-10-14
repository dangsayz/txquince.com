/**
 * transport.ts — how a built email leaves the building.
 *
 * MAIL SINK: when MAIL_SINK=1, when RESEND_API_KEY is unset, or whenever we are
 * NOT in production (local dev, tests, `next start` on a laptop with
 * NODE_ENV=development), nothing is sent. Each email is written to
 * ./.mail-sink/<time>-<tag>.html and .json (gitignored) instead.
 * Only a production server with a Resend key and MAIL_SINK unset sends.
 */
import "server-only";
import { Resend } from "resend";
import { site } from "@/content/site";

export type Attachment = { filename: string; content: Uint8Array; contentType?: string };
export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Short machine name for logs and sink filenames ("request-received"). */
  tag: string;
  attachments?: Attachment[];
};
export type MailResult = { ok: boolean; id?: string; sink?: string; error?: string };

export function mailSinkActive(): boolean {
  return process.env.MAIL_SINK === "1" || !process.env.RESEND_API_KEY || process.env.NODE_ENV !== "production";
}

let resendClient: Resend | null = null;

async function writeSink(msg: OutgoingEmail): Promise<MailResult> {
  try {
    const fs = await import("node:fs/promises");
    const dir = process.env.MAIL_SINK_DIR || `${process.cwd()}/.mail-sink`;
    await fs.mkdir(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const base = `${dir}/${stamp}-${msg.tag.replace(/[^a-z0-9-]/gi, "")}-${Math.random().toString(36).slice(2, 6)}`;
    await fs.writeFile(`${base}.html`, msg.html);
    await fs.writeFile(
      `${base}.json`,
      JSON.stringify(
        {
          to: msg.to,
          subject: msg.subject,
          tag: msg.tag,
          text: msg.text,
          attachments: (msg.attachments ?? []).map((a) => ({ filename: a.filename, bytes: a.content.byteLength })),
        },
        null,
        2,
      ),
    );
    for (const a of msg.attachments ?? []) await fs.writeFile(`${base}-${a.filename.replace(/[^\w.-]/g, "")}`, a.content);
    return { ok: true, sink: `${base}.html` };
  } catch (err) {
    console.error("[mail-sink] could not write:", err);
    return { ok: false, error: "sink-write-failed" };
  }
}

export async function sendEmail(msg: OutgoingEmail): Promise<MailResult> {
  if (mailSinkActive()) return writeSink(msg);
  resendClient ??= new Resend(process.env.RESEND_API_KEY!);
  try {
    const { data, error } = await resendClient.emails.send({
      from: process.env.RESEND_FROM ?? `${site.brand} <hello@${site.domain}>`,
      to: msg.to,
      replyTo: process.env.OPERATOR_NOTIFY_EMAIL || undefined,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      attachments: msg.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content),
        contentType: a.contentType,
      })),
    });
    if (error) return { ok: false, error: String(error.message ?? error) };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
