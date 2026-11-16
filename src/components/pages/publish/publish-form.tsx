"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CheckIcon, XIcon } from "@/components/icons";
import { Tile, type IconName } from "@/components/pages/compatibility/marks";
import { SKY } from "@/components/pages/security/kit";
import {
  API,
  DRAFT_KEY,
  LATENCY,
  PARAM_IN,
  STEPS,
  TYPES,
  VERBS,
  appName,
  defaultIn,
  emptyDraft,
  loadDraft,
  localPreview,
  newMethod,
  newParam,
  pathHas,
  payload,
  validate,
  type Draft,
  type Errors,
  type Method,
  type Param,
} from "./draft";

/* ---------------- primitives ---------------- */

/*
 * The sky site (flight design) gets the home page's form fields: paper-coloured wells with a hairline ring that turns
 * sky blue on focus, pill toggles, round step markers and solid cards. The green site keeps its own classes.
 */
const INPUT = SKY
  ? "h-11 w-full min-w-0 rounded-[10px] bg-bg px-3.5 text-[14.5px] text-fg outline-none ring-1 ring-edge-2 ring-inset transition-shadow duration-200 placeholder:text-faint focus:ring-2 focus:ring-(--sky-fill)/70 aria-invalid:ring-[#b3372a]/60 dark:aria-invalid:ring-[#ff9b8f]/70"
  : "h-10 w-full min-w-0 rounded-[10px] border border-edge-2 bg-card px-3 text-[14.5px] text-fg outline-none transition-colors placeholder:text-faint focus:border-fg/45 aria-invalid:border-[#b3372a]/60 dark:aria-invalid:border-[#ff9b8f]/70";
const AREA = `${INPUT} h-auto min-h-[96px] py-2.5 leading-[1.5]`;
const MONO = "font-mono text-[13px]";
/** Notes inside a step: a quiet sky wash on the sky site. */
const NOTE = SKY
  ? "rounded-[10px] bg-(--sky-tint) px-4 py-3 text-[13.5px] leading-[1.55] text-soft"
  : "rounded-[16px] border-l-2 border-lime-ink bg-lime/[0.05] px-4 py-3 text-[13.5px] leading-[1.55] text-mute";

/** Sky: a real checkbox, drawn as the home page's pill toggle (the invisible input on top keeps keyboard and labels working). */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (on: boolean) => void; label?: string }) {
  return (
    <span className="relative inline-flex h-5 w-[34px] shrink-0">
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0"
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-fg/15 transition-colors duration-300 ease-(--ease-out) peer-checked:bg-(--sky-fill) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--sky-fill)"
      />
      <span
        aria-hidden
        className="absolute top-[3px] left-[3px] size-[14px] rounded-full bg-white shadow-tile transition-transform duration-300 ease-(--ease-out) peer-checked:translate-x-[14px] motion-reduce:transition-none"
      />
    </span>
  );
}

function Field({ label, hint, error, children, className = "" }: { label: string; hint?: ReactNode; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <span className="text-[13.5px] font-medium text-fg">{label}</span>
      {children}
      {hint && <span className={`text-[12.5px] leading-[1.5] ${SKY ? "text-mute" : "text-dim"}`}>{hint}</span>}
      {error && (
        <span className="text-[12.5px] leading-[1.5] text-[#b3372a] dark:text-[#ff9b8f]" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

function SmallButton({ children, onClick, danger, label }: { children: ReactNode; onClick: () => void; danger?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={
        SKY
          ? `pressable inline-flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium ${
              danger
                ? "text-mute hover:bg-[#b3372a]/[0.08] hover:text-[#b3372a] dark:hover:bg-[#ff9b8f]/10 dark:hover:text-[#ff9b8f]"
                : "bg-fg/[0.05] text-soft hover:bg-fg/[0.09] hover:text-fg"
            }`
          : `pressable inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 font-mono text-[12px] ${
              danger ? "border-edge text-dim hover:border-[#b3372a]/50 hover:text-[#b3372a] dark:hover:border-[#ff9b8f]/50 dark:hover:text-[#ff9b8f]" : "border-edge-2 text-soft hover:border-fg/40 hover:text-fg"
            }`
      }
    >
      {children}
    </button>
  );
}

const C = ({ children }: { children: ReactNode }) => <code className="font-mono text-[0.92em] text-soft">{children}</code>;

/* ---------------- storage ---------------- */

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
const readSaved = () => {
  try {
    return localStorage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
};

type Preview = { help: { method: string; duration: string; summary: string }[]; commands: string[]; live: boolean };
type Result = { state: "idle" | "sending" | "ok" | "bad"; caseId?: string; errors?: string[] };

/* ---------------- the steps, before you start ---------------- */

/** Sky site: what each step is about, as an icon. */
const STEP_ICON: Record<(typeof STEPS)[number], IconName> = {
  Email: "mail",
  Identity: "package",
  Backend: "server",
  Methods: "terminal",
  Listing: "bag",
  Vendor: "building",
  Review: "shield",
};

/** Sky site: the seven steps ahead, drawn as the stepper you're about to use, each with its icon. */
function StepsPreview() {
  return (
    <ol aria-label="The seven steps" className="mt-7 grid grid-cols-4 gap-y-5 sm:grid-cols-7">
      {STEPS.map((s, i) => (
        <li key={s} className="relative flex flex-col items-center gap-2 text-center">
          {i < STEPS.length - 1 && (
            <span aria-hidden className={`sky-step-line absolute top-[18px] left-[calc(50%+24px)] w-[calc(100%-48px)] ${i === 3 ? "max-sm:hidden" : ""}`} />
          )}
          <Tile icon={STEP_ICON[s]} accent={i === 0} />
          <span className="text-[12.5px] leading-4 text-mute">{s}</span>
        </li>
      ))}
    </ol>
  );
}

/* ---------------- the form ---------------- */

export function PublishForm() {
  const saved = useSyncExternalStore(subscribeStorage, readSaved, () => null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<Result>({ state: "idle" });
  const head = useRef<HTMLHeadingElement>(null);
  const top = useRef<HTMLDivElement>(null);

  const name = STEPS[step];

  function update(fn: (d: Draft) => void) {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        // Private mode or full storage: the form still works, it just won't remember.
      }
      return next;
    });
  }

  function go(to: number) {
    setErrors({});
    setStep(to);
    requestAnimationFrame(() => {
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      head.current?.focus({ preventScroll: true });
      const rail = top.current?.querySelector("ol");
      const now = rail?.querySelector<HTMLElement>('[aria-current="step"]');
      if (rail && now) rail.scrollTo({ left: now.offsetLeft - rail.clientWidth / 2 + now.clientWidth / 2, behavior: "smooth" });
    });
  }

  function next() {
    if (!draft) return;
    const e = validate(name, draft);
    setErrors(e);
    if (Object.keys(e).length === 0) go(step + 1);
  }

  // Ask the publish API for its own preview; fall back to ours when it can't be reached.
  useEffect(() => {
    if (!draft || (name !== "Methods" && name !== "Review")) return;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload(draft)),
        });
        const data = (await res.json()) as { help?: { methods?: Preview["help"] }; commands?: Preview["commands"] };
        if (!res.ok || !data.help) throw new Error("no preview");
        if (!cancelled) setPreview({ help: data.help.methods ?? [], commands: data.commands ?? [], live: true });
      } catch {
        if (!cancelled) setPreview({ ...localPreview(draft), live: false });
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [draft, name]);

  async function submit() {
    if (!draft) return;
    const e = validate("Review", draft);
    setErrors(e);
    if (Object.keys(e).length) return;
    setResult({ state: "sending" });
    const body = payload(draft);
    (body.release as Record<string, unknown>).signed_at = new Date().toISOString();
    try {
      const res = await fetch(`${API}/api/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json()) as { case_id?: string; errors?: string[]; error?: string };
      if (res.ok) {
        setResult({ state: "ok", caseId: data.case_id });
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}
      } else setResult({ state: "bad", errors: data.errors ?? [data.error ?? "submission failed"] });
    } catch (err) {
      setResult({ state: "bad", errors: [`Could not reach the API: ${(err as Error).message}`] });
    }
  }

  /* ---------- not started yet ---------- */
  if (!draft) {
    return (
      <div className={SKY ? "sky-card rounded-[20px]! p-6 sm:p-10" : "rounded-[20px] bg-card p-6 shadow-card sm:p-10"}>
        <p className={SKY ? "text-[13px] text-mute" : "font-mono text-[12px] text-dim"}>7 steps · saved in this browser as you go</p>
        <h3 className="mt-4 text-[clamp(24px,2.6vw,32px)] leading-[1.1] font-medium tracking-[-0.03em] text-fg">
          {saved ? "Pick up where you left off." : "Describe your app once."}
        </h3>
        {SKY ? (
          <>
            <StepsPreview />
            <p className="mt-6 max-w-[520px] text-[15px] leading-[1.55] text-mute">You can stop at any point and come back.</p>
          </>
        ) : (
          <p className="mt-3 max-w-[520px] text-[15.5px] leading-[1.55] text-mute">
            Email, identity, backend, methods, listing, vendor, review. You can stop at any point and come back.
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setDraft(loadDraft(saved));
              setStep(0);
            }}
            className="pressable inline-flex h-10 items-center rounded-[10px] bg-fg px-[13px] text-[14px] font-medium text-bg hover:bg-fg/88"
          >
            {saved ? "Continue your draft" : "Publish your app now"}
          </button>
          {saved && (
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem(DRAFT_KEY);
                } catch {}
                setDraft(emptyDraft());
                setStep(0);
              }}
              className={
                SKY
                  ? "pressable inline-flex h-10 items-center rounded-[10px] px-[13px] text-[14px] font-medium text-fg ring-1 ring-edge-2 ring-inset hover:bg-fg/[0.04]"
                  : "pressable inline-flex h-10 items-center rounded-[10px] border border-edge-3 px-[13px] text-[14px] font-medium text-fg hover:border-fg/45"
              }
            >
              Start over
            </button>
          )}
        </div>
      </div>
    );
  }

  const app = appName(draft);
  const cli = draft.app_type === "cli";

  /* ---------- steps ---------- */
  let body: ReactNode = null;
  if (name === "Email") {
    body = (
      <>
        <p className="text-[15px] leading-[1.55] text-mute">We’ll use this to send you a submission confirmation and the review decision.</p>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={draft.email}
            aria-invalid={!!errors.email}
            onChange={(e) => update((d) => void (d.email = e.target.value.trim()))}
            className={INPUT}
          />
        </Field>
      </>
    );
  } else if (name === "Identity") {
    body = (
      <>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Field
            label="App ID"
            hint={
              <>
                Reverse-DNS id under the io.pilot namespace. Your app installs as <C>{draft.id || "io.pilot.…"}</C>.
              </>
            }
            error={errors.id}
          >
            <span className={`${INPUT} flex items-center gap-0 p-0 ${SKY ? "focus-within:ring-2 focus-within:ring-(--sky-fill)/70" : "focus-within:border-fg/45"}`} aria-invalid={!!errors.id}>
              <span className={`${MONO} shrink-0 border-r border-edge px-3 text-dim`}>io.pilot.</span>
              <input
                placeholder="weather"
                value={draft.id.replace(/^io\.pilot\./, "")}
                onChange={(e) => update((d) => void (d.id = `io.pilot.${e.target.value.trim().toLowerCase()}`))}
                className={`${MONO} h-full min-w-0 flex-1 bg-transparent px-3 text-fg outline-none placeholder:text-faint`}
              />
            </span>
          </Field>
          <Field label="Version" hint="Semver. Bump for every new build." error={errors.version}>
            <input placeholder="0.1.0" value={draft.version} aria-invalid={!!errors.version} onChange={(e) => update((d) => void (d.version = e.target.value.trim()))} className={`${INPUT} ${MONO}`} />
          </Field>
        </div>
        <Field label="One-line description" hint="What the app does, shown in the store and to agents." error={errors.description}>
          <input
            placeholder="Current weather and forecasts."
            value={draft.description}
            aria-invalid={!!errors.description}
            onChange={(e) => update((d) => void (d.description = e.target.value))}
            className={INPUT}
          />
        </Field>
      </>
    );
  } else if (name === "Backend") {
    body = (
      <>
        <p className="text-[15px] leading-[1.55] text-mute">What kind of app are you publishing?</p>
        <div role="radiogroup" aria-label="App type" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(
            [
              ["api", "HTTP API", "Your app is reachable over HTTP. We generate, sign, and verify an adapter that forwards each method to it."],
              ["cli", "CLI", "Front a command-line tool installed on the host. Each method runs a subprocess; pilotctl appstore call translates into <cli> <args>."],
            ] as const
          ).map(([v, t, b]) => {
            const on = draft.app_type === v;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => update((d) => void (d.app_type = v))}
                className={
                  SKY
                    ? `pressable relative rounded-[16px] p-4 pr-11 text-left ring-inset ${
                        on ? "bg-(--sky-tint) ring-2 ring-(--sky-fill)/70" : "ring-1 ring-edge-2 hover:ring-edge-3"
                      }`
                    : `relative rounded-[16px] border p-4 text-left transition-colors ${on ? "border-fg/55 bg-fg/[0.04]" : "border-edge-2 hover:border-edge-3"}`
                }
              >
                {SKY ? (
                  <span
                    aria-hidden
                    className={`absolute top-4 right-4 grid size-5 place-items-center rounded-full transition-colors duration-200 ${
                      on ? "bg-(--sky-fill) text-white" : "ring-1 ring-edge-3 ring-inset"
                    }`}
                  >
                    {on && <CheckIcon className="size-3" />}
                  </span>
                ) : (
                  on && <span aria-hidden className="absolute -top-px -right-px size-2 bg-lime" />
                )}
                <span className="block text-[15px] font-medium text-fg">{t}</span>
                <span className="mt-1.5 block text-[13.5px] leading-[1.5] text-mute">{b}</span>
              </button>
            );
          })}
        </div>
        {cli ? (
          <>
            <p className={NOTE}>
              The command must already be installed on the operator’s host. The child runs with a scrubbed environment: only
              the variables you list (plus PATH, HOME and locale) pass through. The app ships with a <C>proc.exec</C> grant
              scoped to exactly this command, and installs only through the reviewed catalogue.
            </p>
            <Field label="Command" hint="The base argv the adapter runs. Comma-separated, e.g. gh, or python, -m, tool. Each method appends its own args." error={errors.command}>
              <input placeholder="gh" value={draft.backend.command} aria-invalid={!!errors.command} onChange={(e) => update((d) => void (d.backend.command = e.target.value))} className={`${INPUT} ${MONO}`} />
            </Field>
            <Field label="Env passthrough (optional)" hint="Host environment variables the CLI may see, comma-separated. Everything else is scrubbed from the child.">
              <input placeholder="GH_TOKEN, AWS_PROFILE" value={draft.backend.env_passthrough} onChange={(e) => update((d) => void (d.backend.env_passthrough = e.target.value))} className={`${INPUT} ${MONO}`} />
            </Field>
          </>
        ) : (
          <>
            <p className={NOTE}>
              Add any auth headers your app needs. A value like <C>{"${WEATHER_TOKEN}"}</C> is a secret placeholder: the
              operator who installs the app supplies it at install time. It is never stored in the published app.
            </p>
            <Field label="Base URL" hint="The production endpoint. Baked in as the default; operators can override." error={errors.base_url}>
              <input placeholder="https://api.example.com" value={draft.backend.base_url} aria-invalid={!!errors.base_url} onChange={(e) => update((d) => void (d.backend.base_url = e.target.value.trim()))} className={`${INPUT} ${MONO}`} />
            </Field>
            <div className="flex flex-col gap-2">
              <span className="text-[13.5px] font-medium text-fg">
                Auth headers <span className="font-normal text-dim">(optional)</span>
              </span>
              {draft.backend.headers.map((h, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] gap-2">
                  <input aria-label="Header name" placeholder="x-api-key" value={h.name} onChange={(e) => update((d) => void (d.backend.headers[i].name = e.target.value))} className={`${INPUT} ${MONO}`} />
                  <input aria-label="Header value" placeholder="${WEATHER_TOKEN}" value={h.value} onChange={(e) => update((d) => void (d.backend.headers[i].value = e.target.value))} className={`${INPUT} ${MONO}`} />
                  <SmallButton
                    danger
                    label="Remove header"
                    onClick={() =>
                      update((d) => {
                        d.backend.headers.splice(i, 1);
                        if (!d.backend.headers.length) d.backend.headers.push({ name: "", value: "" });
                      })
                    }
                  >
                    <XIcon className="size-3" />
                  </SmallButton>
                </div>
              ))}
              <div>
                <SmallButton onClick={() => update((d) => void d.backend.headers.push({ name: "", value: "" }))}>+ header</SmallButton>
              </div>
            </div>
          </>
        )}
      </>
    );
  } else if (name === "Methods") {
    body = (
      <>
        <p className="text-[15px] leading-[1.55] text-mute">
          Each method is one call an agent can make. Give it a clear name, the backend route, a latency class, a description, and
          its parameters. The preview shows what agents will see and run.
        </p>
        {draft.methods.map((m, mi) => (
          <MethodCard
            key={mi}
            m={m}
            app={app}
            cli={cli}
            removable={draft.methods.length > 1}
            onChange={(fn) => update((d) => fn(d.methods[mi]))}
            onRemove={() => update((d) => void d.methods.splice(mi, 1))}
          />
        ))}
        <div className="flex flex-wrap items-center gap-3">
          <SmallButton onClick={() => update((d) => void d.methods.push(newMethod()))}>+ method</SmallButton>
          {errors.methods && (
            <span className="text-[12.5px] leading-[1.5] text-[#b3372a] dark:text-[#ff9b8f]" role="alert">
              {errors.methods}
            </span>
          )}
        </div>
        <PreviewPanel app={app} preview={preview} />
      </>
    );
  } else if (name === "Listing") {
    const L = (k: keyof Draft["listing"]) => ({
      value: draft.listing[k] as string,
      onChange: (e: { target: { value: string } }) => update((d) => void ((d.listing[k] as string) = e.target.value)),
    });
    body = (
      <>
        <p className="text-[15px] leading-[1.55] text-mute">How the app appears in the store.</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Display name">
            <input placeholder="Weather" {...L("display_name")} className={INPUT} />
          </Field>
          <Field label="License (SPDX)" hint="e.g. MIT, Apache-2.0, AGPL-3.0-or-later">
            <input placeholder="Apache-2.0" {...L("license")} className={`${INPUT} ${MONO}`} />
          </Field>
        </div>
        <Field label="Tagline">
          <input placeholder="One-line pitch for the store card" {...L("tagline")} className={INPUT} />
        </Field>
        <Field label="App description" hint="Long-form description (markdown ok), shown on the app store page.">
          <textarea placeholder="What the app does, who it is for, what makes it useful…" {...L("app_description")} className={AREA} />
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Homepage">
            <input placeholder="https://example.com" {...L("homepage")} className={`${INPUT} ${MONO}`} />
          </Field>
          <Field label="Source URL">
            <input placeholder="https://github.com/org/app" {...L("source_url")} className={`${INPUT} ${MONO}`} />
          </Field>
          <Field label="Categories" hint="Comma-separated, e.g. search, weather">
            <input placeholder="weather, data" {...L("categories")} className={INPUT} />
          </Field>
          <Field label="Keywords">
            <input placeholder="weather, forecast" {...L("keywords")} className={INPUT} />
          </Field>
        </div>
      </>
    );
  } else if (name === "Vendor") {
    const V = (k: keyof Draft["vendor"]) => ({
      value: draft.vendor[k],
      onChange: (e: { target: { value: string } }) => update((d) => void (d.vendor[k] = e.target.value)),
    });
    body = (
      <>
        <p className="text-[15px] leading-[1.55] text-mute">
          About you, and how agents should use this app. We’ll reach you at <span className="text-fg">{draft.email || "your email"}</span>.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Vendor name">
            <input placeholder="Acme Inc." {...V("name")} className={INPUT} />
          </Field>
          <Field label="Vendor URL">
            <input placeholder="https://acme.example" {...V("url")} className={`${INPUT} ${MONO}`} />
          </Field>
        </div>
        <Field
          label="How will autonomous AI agents use this app?"
          hint="Include package details, whether methods must be called in a specific order, auth and setup, and anything an agent needs to use it correctly."
        >
          <textarea placeholder="e.g. Call search first to get a result id, then fetch with that id. No human steps required…" {...V("agent_usage")} className={AREA} />
        </Field>
        <Field label="List of all capabilities" hint="Everything this app can do, in plain language. One per line is fine.">
          <textarea placeholder={"- Search the web\n- Fetch page contents\n- Summarize a URL"} {...V("capabilities")} className={AREA} />
        </Field>
      </>
    );
  } else {
    body = <Review draft={draft} errors={errors} preview={preview} result={result} update={update} />;
  }

  return (
    <div ref={top} className="scroll-mt-24">
      {/* Stepper (the sky site's sits inside the card, below) */}
      {!SKY && (
      <ol className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0" aria-label="Steps">
        {STEPS.map((s, i) => {
          const done = i < step;
          const now = i === step;
          return (
            <li key={s} className="shrink-0">
              <button
                type="button"
                disabled={i > step}
                onClick={() => go(i)}
                aria-current={now ? "step" : undefined}
                className={`flex h-9 items-center gap-2 rounded-[10px] border px-2.5 font-mono text-[12px] transition-colors disabled:cursor-default ${
                  now ? "border-fg/55 text-fg" : done ? "border-edge text-soft hover:border-edge-3" : "border-transparent text-faint"
                }`}
              >
                <span
                  className={`grid size-[18px] place-items-center text-[10.5px] font-medium ${
                    now ? "bg-lime text-ink" : done ? "bg-fg/15 text-fg" : "border border-edge-2"
                  }`}
                >
                  {done ? <CheckIcon className="size-2.5" /> : i + 1}
                </span>
                {s}
              </button>
            </li>
          );
        })}
      </ol>
      )}

      <div className={SKY ? "sky-card rounded-[20px]!" : "mt-4 rounded-[16px] border border-edge-2 bg-bg-deep"}>
        {SKY && (
          <div className="border-b border-(--sky-card-line) px-5 pt-5 pb-4 sm:px-7">
            {/* The kit's stepper heads (Figma 233:1195; the docs' 233:56): a dot per step, blue on the step you're on,
                ticked once done, the title under it and a hairline on to the next. Done steps take you back. */}
            <ol className="no-scrollbar -mx-5 grid auto-cols-[minmax(72px,1fr)] grid-flow-col overflow-x-auto px-5 sm:-mx-7 sm:px-7" aria-label="Steps">
              {STEPS.map((s, i) => {
                const done = i < step;
                const now = i === step;
                return (
                  <li key={s} className="relative">
                    {i < STEPS.length - 1 && (
                      <span
                        aria-hidden
                        className="sky-step-line absolute top-[16px] left-[calc(50%+18px)] w-[calc(100%-36px)]"
                        style={done ? { background: "var(--sky-fill)", opacity: 0.45 } : undefined}
                      />
                    )}
                    <button
                      type="button"
                      disabled={i > step}
                      onClick={() => go(i)}
                      aria-current={now ? "step" : undefined}
                      className="group flex w-full flex-col items-center gap-2.5 rounded-[8px] pt-1 pb-1.5 text-center disabled:cursor-default"
                    >
                      <span
                        className="sky-step-dot relative tabular-nums"
                        data-on={now}
                        style={done ? { background: "var(--sky-tint)", color: "var(--sky-accent)" } : undefined}
                      >
                        {done ? <CheckIcon className="size-2.5" /> : i + 1}
                      </span>
                      <span
                        className={`text-[13.5px] leading-5 font-medium tracking-[-0.02em] whitespace-nowrap transition-colors duration-200 ${
                          now ? "text-fg" : done ? "text-soft group-hover:text-fg" : "text-mute"
                        }`}
                      >
                        {s}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        <div className={`flex items-baseline justify-between gap-4 border-b px-5 py-4 sm:px-7 ${SKY ? "border-(--sky-card-line)" : "border-edge"}`}>
          <h3 ref={head} tabIndex={-1} style={{ outline: "none" }} className="text-[20px] font-medium tracking-[-0.02em] text-fg">
            {name === "Review" ? "Review and submit" : name === "Email" ? "Your email" : name}
          </h3>
          <p className={SKY ? "text-[13px] text-mute tabular-nums" : "font-mono text-[11.5px] text-dim"}>
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
        <div key={name} className="flex flex-col gap-6 px-5 py-6 motion-safe:animate-[row-in_400ms_var(--ease-out)_both] sm:px-7 sm:py-7">
          {body}
        </div>
        {result.state !== "ok" && (
          <div className="flex items-center justify-between gap-3 border-t border-edge px-5 py-4 sm:px-7">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => go(step - 1)}
                className={SKY ? "pressable text-[14px] font-medium text-mute hover:text-fg" : "pressable font-mono text-[12.5px] text-soft hover:text-fg"}
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            {name === "Review" ? (
              <button
                type="button"
                onClick={submit}
                disabled={!draft.release.signer_name.trim() || !draft.release.agreed || result.state === "sending"}
                className="pressable inline-flex h-10 items-center rounded-[10px] bg-fg px-[13px] text-[14px] font-medium text-bg hover:bg-fg/88 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {result.state === "sending" ? "Building, signing, verifying…" : "Submit for review"}
              </button>
            ) : (
              <button type="button" onClick={next} className="pressable inline-flex h-10 items-center rounded-[10px] bg-fg px-[13px] text-[14px] font-medium text-bg hover:bg-fg/88">
                {step === STEPS.length - 2 ? "Review →" : "Next →"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- method editor ---------------- */

function MethodCard({
  m,
  app,
  cli,
  removable,
  onChange,
  onRemove,
}: {
  m: Method;
  app: string;
  cli: boolean;
  removable: boolean;
  onChange: (fn: (m: Method) => void) => void;
  onRemove: () => void;
}) {
  const set = (fn: (m: Method) => void) => onChange(fn);
  return (
    <div className={SKY ? "rounded-[12px] ring-1 ring-edge-2 ring-inset" : "rounded-[10px] border border-edge-2"}>
      <div className="flex items-center justify-between gap-3 border-b border-edge px-4 py-3">
        <span className="truncate font-mono text-[13px] text-fg">{m.name || `${app || "app"}.method`}</span>
        {removable && (
          <SmallButton danger onClick={onRemove}>
            Remove
          </SmallButton>
        )}
      </div>
      <div className="flex flex-col gap-5 p-4">
        <div className={`grid grid-cols-1 gap-4 ${cli ? "sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : "sm:grid-cols-[minmax(0,1.3fr)_96px_minmax(0,1.3fr)_minmax(0,0.9fr)]"}`}>
          <Field label="Method name" hint={`Prefixed with your namespace, e.g. ${app || "app"}.search`}>
            <input placeholder={`${app || "app"}.search`} value={m.name} onChange={(e) => set((x) => void (x.name = e.target.value.trim()))} className={`${INPUT} ${MONO}`} />
          </Field>
          {!cli && (
            <>
              <Field label="Verb">
                <select value={m.http.verb} onChange={(e) => set((x) => void (x.http.verb = e.target.value))} className={`${INPUT} ${MONO}`}>
                  {VERBS.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="Path" hint="Use {name} to place a param in the path.">
                <input placeholder="/search  or  /items/{id}" value={m.http.path} onChange={(e) => set((x) => void (x.http.path = e.target.value.trim()))} className={`${INPUT} ${MONO}`} />
              </Field>
            </>
          )}
          <Field label="Latency" hint="Fast: under 5s · Medium: up to 15s · Slow: up to 1 min.">
            <select value={m.latency} onChange={(e) => set((x) => void (x.latency = e.target.value))} className={INPUT}>
              <option value="">Select…</option>
              {LATENCY.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {cli && (
          <div className="flex flex-col gap-3">
            <label className={`flex items-start text-[13.5px] leading-[1.5] text-mute ${SKY ? "gap-3" : "gap-2.5"}`}>
              {SKY ? (
                <Toggle checked={m.cli.passthrough} onChange={(on) => set((x) => void (x.cli.passthrough = on))} />
              ) : (
                <input type="checkbox" checked={m.cli.passthrough} onChange={(e) => set((x) => void (x.cli.passthrough = e.target.checked))} className="mt-1 accent-lime" />
              )}
              <span>
                Passthrough: front the whole CLI (translate any <C>{"<cli> <args>"}</C>)
              </span>
            </label>
            {m.cli.passthrough ? (
              <p className={`text-[12.5px] leading-[1.5] ${SKY ? "text-mute" : "text-dim"}`}>
                Every subcommand is reachable; the caller supplies the argv. Call it as <C>{'{"args":["…"]}'}</C>, no baked arguments.
              </p>
            ) : (
              <>
                <Field label="Arguments" hint={<>Comma-separated argv appended to the command. Use <C>{"${param}"}</C> to insert a payload field.</>}>
                  <input placeholder="current, --lat, ${lat}" value={m.cli.args} onChange={(e) => set((x) => void (x.cli.args = e.target.value))} className={`${INPUT} ${MONO}`} />
                </Field>
                <label className={`flex items-start text-[13.5px] leading-[1.5] text-mute ${SKY ? "gap-3" : "gap-2.5"}`}>
                  {SKY ? (
                    <Toggle checked={m.cli.params_as_flags} onChange={(on) => set((x) => void (x.cli.params_as_flags = on))} />
                  ) : (
                    <input type="checkbox" checked={m.cli.params_as_flags} onChange={(e) => set((x) => void (x.cli.params_as_flags = e.target.checked))} className="mt-1 accent-lime" />
                  )}
                  <span>
                    Also append each parameter as <C>--name value</C>
                  </span>
                </label>
              </>
            )}
          </div>
        )}

        <Field label="Description" hint="Shown in the help doc agents read. Be specific about what it returns.">
          <textarea placeholder="Search the corpus; returns ranked results with url, title, score." value={m.description} onChange={(e) => set((x) => void (x.description = e.target.value))} className={AREA} />
        </Field>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-medium text-fg">Parameters</span>
            <SmallButton onClick={() => set((x) => void x.params.push(newParam()))}>+ parameter</SmallButton>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {m.params.map((p, pi) => (
              <ParamRow
                key={pi}
                p={p}
                m={m}
                cli={cli}
                onChange={(fn) => set((x) => fn(x.params[pi]))}
                onRemove={() =>
                  set((x) => {
                    x.params.splice(pi, 1);
                    if (!x.params.length) x.params.push(newParam());
                  })
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParamRow({ p, m, cli, onChange, onRemove }: { p: Param; m: Method; cli: boolean; onChange: (fn: (p: Param) => void) => void; onRemove: () => void }) {
  const where = p.in || defaultIn(m.http.verb);
  const missing = !cli && (where === "path" || where === "path_raw") && !pathHas(m.http.path, p.name);
  return (
    <div className={SKY ? "border-t border-edge pt-2.5 first:border-t-0 first:pt-0" : "rounded-md border border-edge p-2.5"}>
      <div className={`grid grid-cols-2 gap-2 ${cli ? "sm:grid-cols-[minmax(0,1fr)_96px_auto_minmax(0,2fr)_auto]" : "sm:grid-cols-[minmax(0,1fr)_96px_auto_148px_minmax(0,1.6fr)_auto]"}`}>
        <input aria-label="Parameter name" placeholder="q" value={p.name} onChange={(e) => onChange((x) => void (x.name = e.target.value.trim()))} className={`${INPUT} ${MONO}`} />
        <select aria-label="Parameter type" value={p.type} onChange={(e) => onChange((x) => void (x.type = e.target.value))} className={`${INPUT} ${MONO}`}>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        {SKY ? (
          <label className="flex h-10 items-center gap-2 px-1 text-[13px] text-mute">
            <Toggle checked={p.required} onChange={(on) => onChange((x) => void (x.required = on))} />
            Required
          </label>
        ) : (
          <label className="flex h-10 items-center gap-2 px-1 text-[12.5px] text-mute">
            <input type="checkbox" checked={p.required} onChange={(e) => onChange((x) => void (x.required = e.target.checked))} className="accent-lime" />
            required
          </label>
        )}
        {!cli && (
          <select
            aria-label="Parameter location"
            title={PARAM_IN.find(([k]) => k === where)?.[1]}
            value={p.in}
            onChange={(e) => onChange((x) => void (x.in = e.target.value))}
            className={`${INPUT} ${MONO}`}
          >
            <option value="">{defaultIn(m.http.verb)} (default)</option>
            {PARAM_IN.map(([k, t]) => (
              <option key={k} value={k} title={t}>
                {k}
              </option>
            ))}
          </select>
        )}
        <input
          aria-label="Parameter description"
          placeholder="what this parameter is"
          value={p.description}
          onChange={(e) => onChange((x) => void (x.description = e.target.value))}
          className={`${INPUT} col-span-2 sm:col-span-1`}
        />
        <div className="col-span-2 flex justify-end sm:col-span-1">
          <SmallButton danger label="Remove parameter" onClick={onRemove}>
            <XIcon className="size-3" />
          </SmallButton>
        </div>
      </div>
      {missing && (
        <p className={`mt-2 text-[12.5px] ${SKY ? "text-mute" : "text-dim"}`}>
          Add <C>{`{${p.name || "name"}}`}</C> to the path to place this param there.
        </p>
      )}
    </div>
  );
}

/* ---------------- preview + review ---------------- */

function PreviewPanel({ app, preview }: { app: string; preview: Preview | null }) {
  if (SKY) {
    // Sky: a code well inside the form card (paper by day, deeper charcoal at night) with the sky code colours.
    return (
      <div className="overflow-hidden rounded-[12px] bg-bg ring-1 ring-edge ring-inset">
        <p className="flex items-center justify-between gap-3 border-b border-edge px-4 py-3 text-[12.5px] text-mute">
          <span className="min-w-0 truncate">
            <span className="font-mono text-[12px] text-fg">{app || "app"}.help</span> · what agents discover
          </span>
          <span className="shrink-0">{preview?.live ? "From the publish API" : "Preview"}</span>
        </p>
        <div className="no-scrollbar overflow-x-auto px-4 py-3 font-mono text-[12.5px] leading-[1.7] whitespace-pre">
          {preview?.help.length ? (
            preview.help.map((h) => (
              <div key={h.method}>
                <span className="text-(--sky-accent)">{h.method}</span> <span className="text-mute">[{h.duration}]</span> <span className="text-soft">{h.summary}</span>
              </div>
            ))
          ) : (
            <span className="font-sans text-[13px] text-mute">Add a method to see it here.</span>
          )}
        </div>
        <p className="border-y border-edge px-4 py-3 text-[12.5px] text-mute">
          <span className="font-mono text-[12px] text-fg">pilotctl</span> commands
        </p>
        <div className="no-scrollbar overflow-x-auto px-4 py-3 font-mono text-[12.5px] leading-[1.7] whitespace-pre text-fg">
          {preview?.commands.map((c) => (
            <div key={c}>
              <span className="text-(--sky-accent) select-none">$ </span>
              {c}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="pp-island">
      <p className="flex items-center justify-between gap-3 border-b border-edge px-4 py-2.5 font-mono text-[11.5px] text-dim">
        <span>
          <span className="text-soft">{app || "app"}.help</span> · what agents discover
        </span>
        <span>{preview?.live ? "from the publish API" : "preview"}</span>
      </p>
      <div className="no-scrollbar overflow-x-auto px-4 py-3 font-mono text-[12px] leading-[1.7] whitespace-pre">
        {preview?.help.length ? (
          preview.help.map((h) => (
            <div key={h.method}>
              <span className="text-lime-ink">{h.method}</span> <span className="text-dim">[{h.duration}]</span> <span className="text-soft">{h.summary}</span>
            </div>
          ))
        ) : (
          <span className="text-faint">add a method…</span>
        )}
      </div>
      <p className="border-y border-edge px-4 py-2.5 font-mono text-[11.5px] text-dim">pilotctl commands</p>
      <div className="no-scrollbar overflow-x-auto px-4 py-3 font-mono text-[12px] leading-[1.7] whitespace-pre text-soft">
        {preview?.commands.map((c) => <div key={c}>{c}</div>)}
      </div>
    </div>
  );
}

function Review({
  draft,
  errors,
  preview,
  result,
  update,
}: {
  draft: Draft;
  errors: Errors;
  preview: Preview | null;
  result: Result;
  update: (fn: (d: Draft) => void) => void;
}) {
  const p = payload(draft);
  const cli = draft.app_type === "cli";
  const route = (m: Record<string, unknown>) => {
    if (cli) {
      const c = m.cli as { args: string[]; passthrough: boolean; params_as_flags: boolean };
      return c.passthrough ? "passthrough" : (c.args.join(" ") || "flags") + (c.params_as_flags ? " +flags" : "");
    }
    const h = m.http as { verb: string; path: string };
    return `${h.verb} ${h.path}`;
  };
  const rows: [string, ReactNode][] = [
    ["App ID", p.id],
    ["Version", p.version],
    ["Description", p.description],
    ["App type", cli ? "CLI" : "HTTP API"],
    cli ? ["Command", (p.backend as { command: string[] }).command.join(" ")] : ["Backend", (p.backend as { base_url: string }).base_url],
    [
      "Methods",
      p.methods.map((m) => (
        <span key={m.name as string} className="block">
          {m.name as string} <span className="text-dim">({route(m)}, {m.latency as string})</span>
        </span>
      )),
    ],
    ["Display name", p.listing.display_name],
    ["License", p.listing.license],
    ["Categories", p.listing.categories.join(", ")],
    ["Vendor", [p.vendor.name, p.vendor.url].filter(Boolean).join(" · ")],
    ["Email", p.email],
  ];

  if (result.state === "ok") {
    return (
      <div className={SKY ? "rounded-[12px] bg-(--sky-tint) p-5" : "rounded-[16px] border border-lime-ink/50 bg-lime/[0.06] p-5"}>
        <p className="flex items-center gap-2 text-[16px] font-medium text-fg">
          {SKY ? (
            <span className="grid size-6 place-items-center rounded-full bg-(--sky-fill) text-white">
              <CheckIcon className="size-3.5" />
            </span>
          ) : (
            <CheckIcon className="size-4 text-lime-ink" />
          )}{" "}
          Submitted
        </p>
        <p className="mt-2 text-[14.5px] leading-[1.55] text-mute">
          Case <C>{result.caseId}</C> is now pending review. The server built, signed, and verified your adapter. We’ll email you
          when it’s approved or needs changes.
        </p>
      </div>
    );
  }

  return (
    <>
      {result.state === "bad" && (
        <div className="rounded-[16px] border border-[#b3372a]/30 bg-[#ff9b8f]/[0.08] p-4 dark:border-[#ff9b8f]/40" role="alert">
          <p className="text-[14px] font-medium text-fg">Fix these:</p>
          <ul className="mt-2 list-disc pl-5 text-[13.5px] leading-[1.55] text-mute">
            {result.errors?.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}
      <dl className="border-t border-edge">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-1 gap-1 border-b border-edge py-2.5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4">
            <dt className={SKY ? "text-[13px] text-mute" : "font-mono text-[12px] text-dim"}>{k}</dt>
            <dd className="min-w-0 text-[14px] break-words text-soft">{v || <span className="text-faint">—</span>}</dd>
          </div>
        ))}
      </dl>
      <PreviewPanel app={appName(draft)} preview={preview} />
      <div className={SKY ? "rounded-[12px] p-5 ring-1 ring-edge-2 ring-inset" : "rounded-[16px] border border-edge-2 p-5"}>
        <h4 className="text-[16px] font-medium text-fg">Release agreement</h4>
        <p className="mt-2 text-[13.5px] leading-[1.6] text-mute">
          Before your app can be listed, you sign the{" "}
          <a href="/publisher-agreement" target="_blank" rel="noopener" className="text-fg underline decoration-fg/30 underline-offset-2 hover:decoration-fg">
            Publisher Release Agreement
          </a>
          . In short: you confirm you have the right to publish this app, you grant Pilot Protocol a license to use your name
          and the app’s name to list and promote it in the app store and on our website, and you release us from claims arising
          from that authorized use. Please read the full agreement before signing.
        </p>
        <div className="mt-5 flex flex-col gap-4">
          <Field
            label="Full legal name (your signature)"
            hint="Typing your name and submitting signs the agreement electronically, with the same legal effect as a handwritten signature."
            error={errors.signer}
          >
            <input autoComplete="name" placeholder="Jane Doe" value={draft.release.signer_name} onChange={(e) => update((d) => void (d.release.signer_name = e.target.value))} className={INPUT} />
          </Field>
          <label className="flex items-start gap-2.5 text-[13.5px] leading-[1.55] text-mute">
            <input
              type="checkbox"
              checked={draft.release.agreed}
              onChange={(e) => update((d) => void (d.release.agreed = e.target.checked))}
              className={SKY ? "mt-[3px] size-4 shrink-0 accent-(--sky-fill)" : "mt-1 accent-lime"}
            />
            <span>
              I have read and agree to the{" "}
              <a href="/publisher-agreement" target="_blank" rel="noopener" className="text-fg underline decoration-fg/30 underline-offset-2">
                Publisher Release Agreement
              </a>
              , and I confirm I am authorized to publish this app and to grant the rights it describes.
            </span>
          </label>
          {errors.agree && (
            <span className="text-[12.5px] text-[#b3372a] dark:text-[#ff9b8f]" role="alert">
              {errors.agree}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
