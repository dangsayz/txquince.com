"use client";

import { SignaturePad } from "@/components/txq/SignaturePad";
import type { Agreement } from "@/lib/agreement";
import { cleanNameInput, NAME_MAX } from "@/lib/person-name";

export type SignValue = { name: string; signature: string | null; agree: boolean };
export type SignErrors = { signName?: string; signature?: string; agree?: string };

const COPY = {
  en: {
    title: "Read and sign your agreement",
    lead: "This is your agreement. It shows your date, your package and your total. Read it, then sign below. Nothing is charged when you sign.",
    name: "Type your first and last name",
    nameHint: "Letters only, as on your ID.",
    sign: "Sign here with your finger or mouse",
    clear: "Clear",
    useTyped: "Use my typed name",
    agree: "I have read this agreement and I agree to it.",
    after: "After you sign: we check your date and email you within one day. Then you pay your deposit from your account page.",
  },
  es: {
    title: "Lee y firma tu contrato",
    lead: "Este es tu contrato. Muestra tu fecha, tu paquete y tu total. Léelo y luego firma abajo. No se cobra nada al firmar.",
    name: "Escribe tu nombre y apellido",
    nameHint: "Solo letras, como en tu identificación.",
    sign: "Firma aquí con tu dedo o el mouse",
    clear: "Borrar",
    useTyped: "Usar mi nombre escrito",
    agree: "Leí este contrato y estoy de acuerdo.",
    after: "Después de firmar: revisamos tu fecha y te escribimos en un día. Luego pagas tu depósito desde tu cuenta.",
  },
} as const;

/**
 * One section's lines, laid out for reading (same words, nothing dropped):
 *   "Total: $400"                      → label on the left, value in bold
 *   "Deposit: $100 (25%). You pay …"   → label, bold value, the rest as a note
 *   a full sentence                    → a bullet
 */
function splitLine(line: string): { label: string; value: string; note: string } | null {
  const m = /^([^:.]{2,42}): (.+)$/.exec(line);
  if (!m) return null;
  const rest = m[2];
  const cut = rest.search(/[.·] /);
  return cut > 0 && cut < rest.length - 2
    ? { label: m[1], value: rest.slice(0, cut + (rest[cut] === "." ? 1 : 0)).trim(), note: rest.slice(cut + 1).replace(/^[·\s]+/, "").trim() }
    : { label: m[1], value: rest, note: "" };
}

function Lines({ lines }: { lines: string[] }) {
  const facts = lines.map((l) => ({ l, f: splitLine(l) }));
  const rows = facts.filter((x) => x.f);
  const prose = facts.filter((x) => !x.f);
  return (
    <>
      {rows.length > 0 && (
        <dl className="acct-doc__facts">
          {rows.map(({ l, f }) => (
            <div key={l}>
              <dt>{f!.label}</dt>
              <dd>
                <strong>{f!.value}</strong>
                {f!.note ? <span className="acct-doc__note">{f!.note}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {prose.length > 0 && (
        <ul className="acct-doc__points">
          {prose.map(({ l }) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
    </>
  );
}

/** The agreement to read, then typed name + drawn signature + consent. */
export function SignStep({ lang, agreement, value, onChange, errors }: {
  lang: "en" | "es";
  agreement: Agreement;
  value: SignValue;
  onChange: (patch: Partial<SignValue>) => void;
  errors: SignErrors;
}) {
  const c = COPY[lang];
  return (
    <div className="acct-sign">
      <h4 className="tq-bk-label">{c.title}</h4>
      <p className="acct-sign__lead">{c.lead}</p>
      <article className="acct-doc" aria-label={agreement.title}>
        <header className="acct-doc__top">
          <h5 className="acct-doc__title">{agreement.title}</h5>
          <p className="acct-doc__intro">{agreement.intro}</p>
        </header>
        {agreement.sections.map((sec, i) => (
          <section key={sec.title} className="acct-doc__sec" data-money={sec.lines.some((l) => /^Total: /.test(l)) || undefined}>
            <h6 className="acct-doc__h">
              <span className="acct-doc__n" aria-hidden>{i + 1}</span>
              {sec.title}
            </h6>
            <div className="acct-doc__body">
              <Lines lines={sec.lines} />
            </div>
          </section>
        ))}
      </article>
      <div className="tq-field">
        <label htmlFor="acct-sign-name" className="tq-bk-label">{c.name}</label>
        <input
          id="acct-sign-name"
          className="tq-input"
          value={value.name}
          onChange={(e) => onChange({ name: cleanNameInput(e.target.value) })}
          autoComplete="name"
          autoCapitalize="words"
          maxLength={NAME_MAX}
          spellCheck={false}
          aria-invalid={errors.signName ? true : undefined}
          aria-describedby={errors.signName ? "acct-sign-name-err" : undefined}
        />
        <p className="tq-hint" style={{ margin: 0 }}>{c.nameHint}</p>
        {errors.signName ? <p id="acct-sign-name-err" className="tq-error" role="alert">{errors.signName}</p> : null}
      </div>
      <SignaturePad
        value={value.signature}
        onChange={(png) => onChange({ signature: png })}
        label={c.sign}
        clearLabel={c.clear}
        typedName={value.name}
        useTypedLabel={c.useTyped}
        error={errors.signature}
      />
      <label className="tq-check">
        <input type="checkbox" checked={value.agree} onChange={(e) => onChange({ agree: e.target.checked })} aria-invalid={errors.agree ? true : undefined} />
        <span className="tq-check__box" aria-hidden>{value.agree ? "✓" : ""}</span>
        <span>{c.agree}</span>
      </label>
      {errors.agree ? <p className="tq-error" role="alert">{errors.agree}</p> : null}
      <p className="acct-sign__after">{c.after}</p>
    </div>
  );
}
