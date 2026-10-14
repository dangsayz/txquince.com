/** Short display reference ("TXQ-1A2B3C"). Not a credential. Pure. */
export function refFor(id: string): string {
  return `TXQ-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}
