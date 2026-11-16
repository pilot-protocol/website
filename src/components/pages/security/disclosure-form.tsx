"use client";

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowUpRightIcon, CheckIcon } from "@/components/icons";
import { DISCLOSURE_SUBJECT, SECURITY_EMAIL } from "@/components/pages/security/contact";
import { CopyButton, FLAT_CARD, FLAT_CODE, SKY, SKY_H2, SkySplit } from "@/components/pages/security/kit";
import { SmartLink } from "@/components/ui";

/* Sky site: errors in red (the green site keeps them in its accent), labels in sans. */
const ERR = SKY ? "text-[13px] text-(--kit-error)" : "font-mono text-[12px] text-lime-ink";

/*
 * The private disclosure form. This site is static, so nothing is posted
 * anywhere: the report is composed here, previewed live on the right, and
 * opened in the reporter's own email app (or copied) addressed to the team.
 */

const TYPES = [
  ["security", "Security vulnerability"],
  ["privacy", "Privacy concern"],
  ["reliability", "Reliability defect"],
  ["product-bug", "Product bug"],
  ["other", "Other"],
] as const;

const SEVERITIES = [
  ["critical", "Critical", 4],
  ["high", "High", 3],
  ["medium", "Medium", 2],
  ["low", "Low", 1],
  ["unsure", "Unsure", 0],
] as const;

type Fields = {
  name: string;
  email: string;
  organization: string;
  type: string;
  severity: string;
  surface: string;
  summary: string;
  details: string;
  reproduction: string;
  impact: string;
  timeline: string;
  safe: boolean;
};

const EMPTY: Fields = {
  name: "",
  email: "",
  organization: "",
  type: "",
  severity: "",
  surface: "",
  summary: "",
  details: "",
  reproduction: "",
  impact: "",
  timeline: "",
  safe: false,
};

type Key = keyof Fields;
const REQUIRED: Key[] = ["email", "type", "severity", "surface", "summary", "details", "safe"];

// Things that look like live credentials. A nudge, not a filter.
const SECRET =
  /-----BEGIN [A-Z ]*PRIVATE KEY-----|\bAKIA[0-9A-Z]{16}\b|\b[sr]k_(?:live|test)_[0-9A-Za-z]{10,}|\bgh[pousr]_[0-9A-Za-z]{20,}|\bxox[abprs]-[0-9A-Za-z-]{10,}|\b(?:password|passwd|secret|api[_-]?key|token)\s*[:=]\s*["']?[^\s"']{8,}/i;

const label = (list: readonly (readonly [string, string, ...unknown[]])[], v: string) => list.find((t) => t[0] === v)?.[1] ?? "";

function compose(f: Fields) {
  const sev = label(SEVERITIES, f.severity);
  const subject = `${DISCLOSURE_SUBJECT}${sev ? ` [${sev}]` : ""}${f.summary ? `: ${f.summary.trim()}` : ""}`;
  const block = (title: string, body: string) => (body.trim() ? `\n${title}\n${"-".repeat(title.length)}\n${body.trim()}\n` : "");
  const body = [
    `Issue type: ${label(TYPES, f.type) || "—"}`,
    `Reporter-assessed severity: ${sev || "—"}`,
    `Affected surface: ${f.surface.trim() || "—"}`,
    `Summary: ${f.summary.trim() || "—"}`,
    block("Technical details", f.details) +
      block("Minimal reproduction", f.reproduction) +
      block("Potential impact", f.impact) +
      block("Disclosure timeline", f.timeline),
    "Reporter",
    `Name or handle: ${f.name.trim() || "—"}`,
    `Email: ${f.email.trim() || "—"}`,
    `Organization: ${f.organization.trim() || "—"}`,
    "",
    f.safe
      ? "Confirmed: this report does not intentionally include live credentials, private keys, customer data or destructive payloads, and testing stopped when continued activity could create harm or unauthorized access."
      : "Safe-testing confirmation: not yet given",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
  return { subject, body };
}

const inputBase =
  "w-full rounded-[10px] border bg-card px-3 text-[15px] text-fg placeholder:text-faint transition-[border-color,background-color] duration-200";

function Field({
  id,
  label: text,
  optional,
  error,
  help,
  children,
  className = "",
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  help?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="flex items-baseline gap-2 text-[14px] text-soft">
        {text}
        {optional ? (
          <span className={SKY ? "text-[12.5px] text-dim" : "font-mono text-[11.5px] text-faint"}>optional</span>
        ) : (
          <span className="text-lime-ink">*</span>
        )}
      </label>
      {children}
      {help && <p className="text-[13px] leading-[1.5] text-dim">{help}</p>}
      {error && (
        <p id={`${id}-error`} className={ERR}>
          {error}
        </p>
      )}
    </div>
  );
}

function Levels({ n, on }: { n: number; on: boolean }) {
  if (SKY)
    return (
      <span aria-hidden className="flex h-3 items-end gap-[2px]">
        {[1, 2, 3, 4].map((l) => (
          <span
            key={l}
            className={`w-[3px] rounded-full transition-colors duration-200 ${l <= n ? (on ? "bg-current" : "bg-fg/60") : on ? "bg-current opacity-30" : "bg-fg/15"}`}
            style={{ height: `${l * 3}px` }}
          />
        ))}
      </span>
    );
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {[1, 2, 3, 4].map((l) => (
        <span
          key={l}
          className={`w-[3px] transition-colors duration-200 ${l <= n ? (on ? "bg-ink" : "bg-fg/70") : on ? "bg-ink/25" : "bg-fg/15"}`}
          style={{ height: `${l * 3}px` }}
        />
      ))}
    </span>
  );
}

export function DisclosureForm() {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const [f, setF] = useState<Fields>(EMPTY);
  const [tried, setTried] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const set = <K extends Key>(k: K, v: Fields[K]) => setF((p) => ({ ...p, [k]: v }));

  const errors = useMemo(() => {
    const e: Partial<Record<Key, string>> = {};
    for (const k of REQUIRED) {
      const v = f[k];
      if (typeof v === "boolean" ? !v : !v.trim()) e[k] = k === "safe" ? "Please confirm before sending." : "Required.";
    }
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "That doesn’t look like an email address.";
    return e;
  }, [f]);

  const { subject, body } = compose(f);
  const mailto = `mailto:${SECURITY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const long = mailto.length > 1900;
  const secretIn = (["details", "reproduction", "impact", "surface", "summary"] as const).find((k) => SECRET.test(f[k]));
  const show = (k: Key) => (tried ? errors[k] : undefined);
  const aria = (k: Key) => ({ "aria-invalid": Boolean(show(k)) || undefined, "aria-describedby": show(k) ? `${id(k)}-error` : undefined });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    const first = REQUIRED.find((k) => errors[k]) ?? (errors.email ? "email" : undefined);
    if (first) {
      const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
      el?.focus();
      return;
    }
    window.location.href = mailto;
  }

  const border = (k: Key) => (show(k) ? (SKY ? "border-(--kit-error)" : "border-lime-ink/70") : "border-edge-2");

  const form = (
      <form ref={formRef} noValidate onSubmit={submit} aria-labelledby="form-title" className="flex min-w-0 flex-col">
        {SKY ? (
          <h2 id="form-title" className={SKY_H2}>
            Private disclosure, <span className="block text-mute">sent from your own email.</span>
          </h2>
        ) : (
          <h2 id="form-title" className="text-[24px] leading-[1.15] font-medium tracking-[-0.025em] text-fg">
            Private disclosure
          </h2>
        )}
        <p className={SKY ? "mt-4 text-[14.5px] leading-[1.55] text-mute" : "mt-2 text-[14.5px] leading-[1.55] text-mute"}>
          Fields marked <span className="text-lime-ink">*</span> are required. Reporter severity is an initial assessment,
          not a final classification.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2">
          <Field id={id("name")} label="Name or handle" optional>
            <input
              id={id("name")}
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
              autoComplete="name"
              maxLength={120}
              className={`${inputBase} h-11 border-edge-2`}
            />
          </Field>
          <Field id={id("email")} label="Email" error={show("email")}>
            <input
              id={id("email")}
              data-field="email"
              type="email"
              value={f.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
              maxLength={254}
              required
              {...aria("email")}
              className={`${inputBase} h-11 ${border("email")}`}
            />
          </Field>
          <Field id={id("org")} label="Organization" optional className="sm:col-span-2">
            <input
              id={id("org")}
              value={f.organization}
              onChange={(e) => set("organization", e.target.value)}
              autoComplete="organization"
              maxLength={160}
              className={`${inputBase} h-11 border-edge-2`}
            />
          </Field>

          <fieldset className="flex min-w-0 flex-col gap-3 sm:col-span-2" {...aria("type")}>
            <legend className="mb-3 flex items-baseline gap-2 text-[14px] text-soft">
              Issue type <span className="text-lime-ink">*</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(([v, text], i) => {
                const on = f.type === v;
                return (
                  <label
                    key={v}
                    className={`pressable relative inline-flex h-10 cursor-pointer items-center gap-2.5 border px-3.5 text-[14px] has-[:focus-visible]:outline has-[:focus-visible]:outline-[1.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lime-ink ${
                      SKY ? "rounded-full pl-3" : "rounded-[10px]"
                    } ${on ? "border-fg bg-fg text-bg" : "border-edge-2 text-soft hover:border-edge-3 hover:text-fg"}`}
                  >
                    <input
                      type="radio"
                      name="issue_type"
                      value={v}
                      checked={on}
                      onChange={() => set("type", v)}
                      data-field={i === 0 ? "type" : undefined}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={SKY ? `size-1.5 rounded-full ${on ? "bg-(--sky-400)" : "bg-edge-3"}` : `size-1.5 ${on ? "bg-lime" : "bg-edge-3"}`}
                    />
                    {text}
                  </label>
                );
              })}
            </div>
            {show("type") && <p className={ERR}>Choose a type.</p>}
          </fieldset>

          <fieldset className="flex min-w-0 flex-col gap-3 sm:col-span-2">
            <legend className="mb-3 flex items-baseline gap-2 text-[14px] text-soft">
              Reporter-assessed severity <span className="text-lime-ink">*</span>
            </legend>
            <div
              className={
                SKY
                  ? "grid grid-cols-5 gap-0.5 rounded-[8px] bg-fg/[0.05] p-1.5"
                  : "grid grid-cols-5 gap-px overflow-hidden rounded-[20px] border border-edge-2 bg-edge-2"
              }
            >
              {SEVERITIES.map(([v, text, n], i) => {
                const on = f.severity === v;
                return (
                  <label
                    key={v}
                    className={`relative flex h-14 cursor-pointer flex-col items-start justify-between px-2.5 py-2 text-[13px] transition-colors duration-200 has-[:focus-visible]:z-10 has-[:focus-visible]:outline has-[:focus-visible]:outline-[1.5px] has-[:focus-visible]:outline-lime-ink sm:px-3 sm:text-[14px] ${
                      SKY
                        ? `rounded-[3px] font-medium transition-[background-color,color] ${on ? "bg-[#1a1a1a] text-white dark:bg-[#f2f2ec] dark:text-[#141413]" : "text-soft hover:bg-fg/[0.05] hover:text-fg"}`
                        : on
                          ? "bg-lime text-ink"
                          : "bg-card text-soft hover:bg-card-2 hover:text-fg"
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={v}
                      checked={on}
                      onChange={() => set("severity", v)}
                      data-field={i === 0 ? "severity" : undefined}
                      className="sr-only"
                    />
                    {n > 0 ? (
                      <Levels n={n} on={on} />
                    ) : (
                      <span
                        aria-hidden
                        className={`font-mono text-[12px] leading-3 ${SKY ? (on ? "opacity-60" : "text-dim") : on ? "text-ink" : "text-dim"}`}
                      >
                        ?
                      </span>
                    )}
                    {text}
                  </label>
                );
              })}
            </div>
            {show("severity") && <p className={ERR}>Choose a severity.</p>}
          </fieldset>

          <Field id={id("surface")} label="Affected surface" error={show("surface")} className="sm:col-span-2">
            <input
              id={id("surface")}
              data-field="surface"
              value={f.surface}
              onChange={(e) => set("surface", e.target.value)}
              maxLength={500}
              required
              placeholder="Component, URL, version, endpoint, or app identifier"
              {...aria("surface")}
              className={`${inputBase} h-11 ${border("surface")}`}
            />
          </Field>
          <Field id={id("summary")} label="Summary" error={show("summary")} className="sm:col-span-2">
            <input
              id={id("summary")}
              data-field="summary"
              value={f.summary}
              onChange={(e) => set("summary", e.target.value)}
              maxLength={240}
              required
              placeholder="A concise description of the issue"
              {...aria("summary")}
              className={`${inputBase} h-11 ${border("summary")}`}
            />
          </Field>
          <Field id={id("details")} label="Technical details" error={show("details")} className="sm:col-span-2">
            <textarea
              id={id("details")}
              data-field="details"
              value={f.details}
              onChange={(e) => set("details", e.target.value)}
              maxLength={12000}
              required
              rows={7}
              placeholder="Describe the observed behavior, relevant conditions, and why it matters. Redact sensitive values."
              {...aria("details")}
              className={`${inputBase} resize-y py-2.5 leading-[1.55] ${border("details")}`}
            />
          </Field>
          <Field
            id={id("repro")}
            label="Minimal reproduction"
            optional
            className="sm:col-span-2"
            help="Do not paste live secrets or destructive payloads. We can coordinate a safer transfer method after initial contact."
          >
            <textarea
              id={id("repro")}
              value={f.reproduction}
              onChange={(e) => set("reproduction", e.target.value)}
              maxLength={12000}
              rows={5}
              placeholder="Numbered steps, safe proof of concept, expected behavior, and actual behavior"
              className={`${inputBase} resize-y border-edge-2 py-2.5 leading-[1.55]`}
            />
          </Field>
          <Field id={id("impact")} label="Potential impact" optional className="sm:col-span-2">
            <textarea
              id={id("impact")}
              value={f.impact}
              onChange={(e) => set("impact", e.target.value)}
              maxLength={6000}
              rows={3}
              placeholder="Who or what could be affected, and under which prerequisites?"
              className={`${inputBase} resize-y border-edge-2 py-2.5 leading-[1.55]`}
            />
          </Field>
          <Field id={id("timeline")} label="Disclosure timeline" optional className="sm:col-span-2">
            <textarea
              id={id("timeline")}
              value={f.timeline}
              onChange={(e) => set("timeline", e.target.value)}
              maxLength={2000}
              rows={2}
              placeholder="Any deadlines, prior contact, or publication plans"
              className={`${inputBase} resize-y border-edge-2 py-2.5 leading-[1.55]`}
            />
          </Field>

          <label
            className={`flex cursor-pointer gap-3.5 rounded-[16px] border p-4 text-[14px] leading-[1.55] text-mute transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-[1.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lime-ink sm:col-span-2 ${
              show("safe") ? (SKY ? "border-(--kit-error)" : "border-lime-ink/70") : f.safe ? "border-edge-3" : "border-edge-2"
            }`}
          >
            <input
              type="checkbox"
              data-field="safe"
              checked={f.safe}
              onChange={(e) => set("safe", e.target.checked)}
              required
              className="peer sr-only"
              {...aria("safe")}
            />
            <span
              aria-hidden
              className={`mt-[2px] grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors duration-200 ${
                f.safe ? (SKY ? "border-(--sky-fill) bg-(--sky-fill) text-white" : "border-lime bg-lime text-ink") : "border-edge-3 text-transparent"
              }`}
            >
              <CheckIcon className="size-3" />
            </span>
            <span>
              <span className="text-fg">
                I confirm that this report does not intentionally include live credentials, private keys, customer data,
                or destructive payloads,
              </span>{" "}
              and that I stopped testing when continued activity could create harm or unauthorized access.
              {show("safe") && <span className={`mt-1.5 block ${ERR}`}>{errors.safe}</span>}
            </span>
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-edge pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[420px] text-[13px] leading-[1.55] text-dim">
            Pilot will use this information to investigate and coordinate with you. See our{" "}
            <SmartLink href="/privacy" className="text-soft underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg">
              Privacy Policy
            </SmartLink>{" "}
            and{" "}
            <a href="/.well-known/security.txt" className="text-soft underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg">
              security.txt
            </a>
            .
          </p>
          <button
            type="submit"
            className="pressable inline-flex h-11 shrink-0 items-center justify-center gap-2.5 rounded-[10px] bg-fg px-4 text-[14px] font-medium text-bg hover:bg-fg/88"
          >
            Open in your email app
            <ArrowUpRightIcon className="size-3" />
          </button>
        </div>
      </form>
  );

  /* The report as it will arrive. */
  const preview = (
      <aside aria-label="Report preview" className={SKY ? "w-full min-w-0 self-stretch" : "min-w-0 lg:pt-[76px]"}>
        <div className="lg:sticky lg:top-24">
          <div className={SKY ? FLAT_CODE : "pp-island"}>
            <div className={`flex items-center justify-between border-b pl-4 ${SKY ? "h-11 border-(--sky-card-line) pr-2" : "h-10 border-edge pr-1.5"}`}>
              {SKY ? (
                <span className="min-w-0 truncate text-[13px] text-mute">
                  Your report <span className="text-dim">· opens in your email app</span>
                </span>
              ) : (
                <span className="font-mono text-[11.5px] text-dim">Your report, as it will arrive</span>
              )}
              <CopyButton value={`To: ${SECURITY_EMAIL}\nSubject: ${subject}\n\n${body}`} label="Copy report" />
            </div>
            {SKY ? (
              <dl className="border-b border-(--sky-card-line) px-4 py-3 text-[13.5px] leading-[1.6]">
                <div className="flex gap-3 py-0.5">
                  <dt className="w-16 shrink-0 text-mute">To</dt>
                  <dd className="min-w-0 truncate font-mono text-[12.5px] text-fg">{SECURITY_EMAIL}</dd>
                </div>
                <div className="flex gap-3 py-0.5">
                  <dt className="w-16 shrink-0 text-mute">Subject</dt>
                  <dd className="min-w-0 font-medium text-fg">{subject}</dd>
                </div>
              </dl>
            ) : (
            <dl className="border-b border-edge px-4 py-3 font-mono text-[12px] leading-[1.7]">
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 text-faint">To</dt>
                <dd className="min-w-0 truncate text-fg">{SECURITY_EMAIL}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 text-faint">Subject</dt>
                <dd className="min-w-0 text-fg">{subject}</dd>
              </div>
            </dl>
            )}
            <pre className="no-scrollbar max-h-[440px] overflow-auto px-4 py-4 font-mono text-[12px] leading-[1.7] whitespace-pre-wrap text-soft">
              {body}
            </pre>
          </div>
          {secretIn && (
            <p
              className={
                SKY
                  ? `mt-3 flex gap-3 p-3.5 text-[13.5px] leading-[1.5] text-fg ${FLAT_CARD}`
                  : "mt-3 flex gap-3 rounded-[16px] border border-lime-ink/50 bg-lime/[0.06] p-3.5 text-[13.5px] leading-[1.5] text-fg"
              }
            >
              <span aria-hidden className={SKY ? "mt-[6px] size-2 shrink-0 rounded-full bg-(--kit-error)" : "mt-[6px] size-2 shrink-0 bg-lime"} />
              Something in your report looks like a live secret. Redact it; a safer transfer method can be arranged after
              first contact.
            </p>
          )}
          {SKY ? (
            long && (
              <p className={`mt-3 flex gap-3 p-3.5 text-[13.5px] leading-[1.5] text-fg ${FLAT_CARD}`}>
                <span aria-hidden className="mt-[6px] size-2 shrink-0 rounded-full bg-(--sky-fill)" />
                It is long. If your email app cuts it short, copy it and paste it into the message.
              </p>
            )
          ) : (
            <p className="mt-4 text-[13px] leading-[1.55] text-dim">
              Nothing is sent from this page. The report opens in your email app, addressed to{" "}
              <span className="text-soft">{SECURITY_EMAIL}</span>
              {long ? ". It is long; if your email app cuts it short, copy it and paste it into the message." : "."}
            </p>
          )}
        </div>
      </aside>
  );

  // Sky site (Figma 233:1195): a split. The form on paper; the report it writes on the hatched half, beside it.
  if (SKY)
    return (
      <SkySplit
        labelledBy="form-title"
        text={form}
        visual={preview}
        textClassName="lg:justify-start"
        visualClassName="lg:items-start lg:py-[100px]"
      />
    );

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
      {form}
      {preview}
    </div>
  );
}
