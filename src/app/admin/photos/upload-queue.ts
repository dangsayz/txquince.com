/**
 * Upload queue for the Photo dump (ported from dnpixels upload-queue): photos
 * are prepared one at a time (decoding big camera files is memory-heavy on a
 * phone) and sent a few at a time, each with its own progress, retry and
 * remove. A failed photo keeps its prepared copy so "Try again" is instant.
 */
import { fileProblem, preparePhoto, shortName, type PreparedPhoto } from "./prepare-photo";

export type QueueItem = {
  id: string;
  name: string;
  preview: string;
  file: File;
  prepared?: PreparedPhoto;
  state: "waiting" | "preparing" | "uploading" | "done" | "failed";
  progress: number;
  error?: string;
};

/** Sends one prepared photo; resolves when the server has saved it. */
export type Transport = (photo: PreparedPhoto, name: string, signal: AbortSignal, progress: (pct: number) => void) => Promise<void>;

export class UploadQueue {
  items: QueueItem[] = [];
  private transport: Transport | null = null;
  private active = new Map<string, AbortController>();
  private preparing = false;
  private disposed = false;

  constructor(
    private changed: (items: QueueItem[]) => void,
    private concurrency = 2,
  ) {}

  private emit() {
    if (!this.disposed) this.changed([...this.items]);
  }
  private set(id: string, patch: Partial<QueueItem>) {
    this.items = this.items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    this.emit();
  }

  /** Stage files (nothing is sent until `start`). Returns problems found. */
  add(files: File[]): string[] {
    const problems: string[] = [];
    for (const file of files) {
      const fingerprint = `${file.name}:${file.size}:${file.lastModified}`;
      if (this.items.some((i) => `${i.file.name}:${i.file.size}:${i.file.lastModified}` === fingerprint)) continue;
      const problem = fileProblem(file);
      if (problem) {
        problems.push(`${shortName(file.name)}: ${problem}`);
        continue;
      }
      this.items.push({
        id: crypto.randomUUID(),
        name: file.name,
        preview: URL.createObjectURL(file),
        file,
        state: "waiting",
        progress: 0,
      });
    }
    this.emit();
    this.pump();
    return problems;
  }

  start(transport: Transport) {
    this.transport = transport;
    this.pump();
  }

  remove(id: string) {
    const item = this.items.find((i) => i.id === id);
    this.active.get(id)?.abort();
    this.items = this.items.filter((i) => i.id !== id);
    if (item) URL.revokeObjectURL(item.preview);
    this.emit();
    this.pump();
  }

  retry(id: string) {
    this.items = this.items.map((i) => (i.id === id && i.state === "failed" ? { ...i, state: "waiting", progress: 0, error: undefined } : i));
    this.emit();
    this.pump();
  }

  retryAll() {
    this.items = this.items.map((i) => (i.state === "failed" ? { ...i, state: "waiting", progress: 0, error: undefined } : i));
    this.emit();
    this.pump();
  }

  clear() {
    for (const c of this.active.values()) c.abort();
    this.active.clear();
    for (const i of this.items) URL.revokeObjectURL(i.preview);
    this.items = [];
    this.transport = null;
    this.preparing = false;
    this.emit();
  }

  dispose() {
    this.clear();
    this.disposed = true;
  }

  private pump() {
    if (this.disposed || !this.transport) return;
    while (this.active.size < this.concurrency) {
      // A photo needing preparation waits while another one is being prepared.
      const item = this.items.find((i) => i.state === "waiting" && (i.prepared || !this.preparing));
      if (!item) break;
      this.run(item, this.transport);
    }
  }

  private run(item: QueueItem, transport: Transport) {
    const controller = new AbortController();
    this.active.set(item.id, controller);
    const needsPrep = !item.prepared;
    if (needsPrep) this.preparing = true;
    this.set(item.id, { state: needsPrep ? "preparing" : "uploading", progress: 0 });

    const work = (async () => {
      let prepared = item.prepared;
      if (!prepared) {
        try {
          prepared = await preparePhoto(item.file, controller.signal);
        } finally {
          this.preparing = false;
          // Let the next photo start preparing while this one uploads.
          queueMicrotask(() => this.pump());
        }
        this.set(item.id, { prepared, state: "uploading", progress: 0 });
      }
      await transport(prepared, item.name, controller.signal, (progress) => {
        if (!controller.signal.aborted) this.set(item.id, { progress });
      });
    })();

    void work
      .then(() => {
        if (!controller.signal.aborted) this.set(item.id, { state: "done", progress: 100 });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        this.set(item.id, {
          state: "failed",
          error: error instanceof Error ? error.message : "Upload failed. Try again.",
        });
      })
      .finally(() => {
        this.active.delete(item.id);
        this.pump();
      });
  }
}

/** POST one photo to /api/admin/photos with upload progress (XHR). */
export function sendPhoto(
  fields: Record<string, string>,
): Transport {
  return (photo, name, signal, progress) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/photos");
      xhr.responseType = "json";
      xhr.timeout = 180000;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) progress(Math.round((e.loaded / e.total) * 100));
      };
      const abort = () => xhr.abort();
      signal.addEventListener("abort", abort, { once: true });
      xhr.onloadend = () => signal.removeEventListener("abort", abort);
      xhr.onerror = () => reject(new Error("The connection dropped. Try again."));
      xhr.ontimeout = () => reject(new Error("This took too long. Try again."));
      xhr.onabort = () => reject(new Error("Upload stopped."));
      xhr.onload = () => {
        const body = xhr.response as { error?: string } | null;
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else if (xhr.status === 401 || xhr.status === 403) reject(new Error("You were signed out. Sign in again, then try again."));
        else reject(new Error(body?.error ?? "Could not upload this photo. Try again."));
      };
      const data = new FormData();
      const ext = photo.blob.type === "image/webp" ? "webp" : "jpg";
      data.set("file", photo.blob, `${name.replace(/\.[^.]+$/, "")}.${ext}`);
      data.set("w", String(photo.w));
      data.set("h", String(photo.h));
      for (const [k, v] of Object.entries(fields)) data.set(k, v);
      xhr.send(data);
    });
}
