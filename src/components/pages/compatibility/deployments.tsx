"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { DEPLOYMENTS, MODES, SKY_LABEL } from "@/components/pages/compatibility/data";
import { ModeGlyph } from "@/components/pages/compatibility/mode-glyph";
import { CodePanel, FLAT_CARD, SKY } from "@/components/pages/security/kit";
import { SkyRule } from "@/components/sky/kit";
import type { Brand } from "@/components/v4/logos";
import { LineIcon, Tile, TintedMark } from "@/components/pages/compatibility/marks";

/** Sky site: the platform each worked example runs on, and the mark for the kind of file it shows. */
const MARK: Record<string, { brand?: Brand; icon?: "cube" }> = {
  render: { brand: "render" },
  lambda: { brand: "awslambda" },
  k8s: { brand: "kubernetes" },
  macos: { brand: "apple" },
  systemd: { brand: "linux" },
  proxy: { icon: "cube" },
};
const FILE_MARK: Record<string, Brand | undefined> = { Dockerfile: "docker", "pod.yaml": "kubernetes" };

function FileTitle({ file }: { file?: string }) {
  const b = file ? FILE_MARK[file] : undefined;
  return (
    <span className="inline-flex items-center gap-2">
      {b ? <TintedMark brand={b} className="size-[14px]" /> : <LineIcon name="terminal" className="size-[14px] text-mute" />}
      {file}
    </span>
  );
}

/**
 * Lambda, drawn: the daemon is up only while the function is warm, frozen between invocations, and gone at the
 * 15-minute hard timeout. There's no file to show, so this is the picture instead.
 */
function LambdaTimeline() {
  const warm = "relative h-9 rounded-[8px] bg-(--sky-fill)/[0.14] ring-1 ring-(--sky-fill)/30 ring-inset";
  const frozen =
    "h-9 rounded-[8px] bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--color-fg)_9%,transparent)_0_1.5px,transparent_1.5px_6px)]";
  return (
    <div className={`p-6 sm:p-8 ${FLAT_CARD}`}>
      <div className="flex items-center gap-3.5">
        <Tile brand="awslambda" size="lg" />
        <div className="min-w-0">
          <p className="text-[17px] leading-6 font-medium tracking-[-0.02em] text-fg">Wrong runtime for pilot-daemon</p>
          <p className="text-[13.5px] leading-5 text-mute">There’s no file to show.</p>
        </div>
      </div>
      <div aria-hidden className="mt-8">
        <div className="relative flex gap-1.5 pr-px">
          <span className={`${warm} w-[26%]`}>
            <span className="absolute inset-y-0 left-2.5 flex items-center gap-1.5 text-[12px] font-medium text-(--sky-accent)">
              <span className="size-1.5 rounded-full bg-(--sky-fill)" />
              Daemon up
            </span>
          </span>
          <span className={`${frozen} w-[18%]`} />
          <span className={`${warm} w-[16%]`} />
          <span className={`${frozen} w-[22%]`} />
          <span className={`${warm} w-[12%]`} />
          <span className="absolute -top-2 -right-px -bottom-2 w-[2px] rounded-full bg-fg" />
        </div>
        <div className="mt-2.5 flex text-[12px] text-mute">
          <span className="w-[26%]">Warm</span>
          <span className="w-[18%] pl-1.5">Frozen</span>
          <span className="flex-1 text-right font-medium text-fg">15 min limit</span>
        </div>
      </div>
    </div>
  );
}

/** Six worked deployments: pick one on the left, its file and what to know on the right. */
/**
 * Sky site: a split section (Figma 218:22895). The heading and the six deployments as a numbered list of tabs on the
 * paper half, the chosen one's file on the hatched half. The code half is the wider one, so the files fit.
 */
function SkyDeployments({ head }: { head?: ReactNode }) {
  const [active, setActive] = useState(DEPLOYMENTS[0].id);
  const d = DEPLOYMENTS.find((x) => x.id === active)!;
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: KeyboardEvent) {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const i = DEPLOYMENTS.findIndex((x) => x.id === active);
    const n = DEPLOYMENTS.length;
    const next = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : (i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + n) % n;
    setActive(DEPLOYMENTS[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <section aria-labelledby="deploy-title" className="py-24 sm:py-32">
      <div className="wrap">
        <SkyRule />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex min-w-0 flex-col justify-center py-14 sm:py-20 lg:py-[100px] lg:pr-14">
            {head}
            <div
              role="tablist"
              aria-label="Deployments"
              aria-orientation="vertical"
              onKeyDown={onKey}
              className="mt-10 border-t border-(--sky-card-line)"
            >
              {DEPLOYMENTS.map((x, i) => {
                const on = x.id === active;
                return (
                  <button
                    key={x.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`dep-tab-${x.id}`}
                    aria-selected={on}
                    aria-controls="dep-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => setActive(x.id)}
                    className="group grid w-full grid-cols-[36px_minmax(0,1fr)] items-center gap-x-3.5 border-b border-(--sky-card-line) py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sky-accent)"
                  >
                    <Tile
                      brand={MARK[x.id]?.brand}
                      icon={MARK[x.id]?.icon}
                      className={`transition-[box-shadow] duration-200 ${on ? "shadow-[0_0_0_1.5px_var(--sky-fill)]" : ""}`}
                    />
                    <span className="flex min-w-0 flex-col gap-1">
                      <span
                        className={`text-[16px] leading-6 font-medium tracking-[-0.03em] transition-colors duration-200 ${on ? "text-fg" : "text-mute group-hover:text-fg"}`}
                      >
                        {x.title}
                      </span>
                      <span className="flex items-center gap-2 text-[13.5px] leading-5 text-mute">
                        <ModeGlyph mode={x.mode} />
                        <span>
                          {SKY_LABEL[x.mode]} · {x.sub}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sky-hatch-bg sky-frame relative -mx-5 flex min-w-0 items-center border-t px-5 py-10 sm:-mx-6 sm:px-10 sm:py-14 lg:mx-0 lg:border-x lg:border-t-0 lg:px-10 lg:py-16">
            <div id="dep-panel" role="tabpanel" aria-labelledby={`dep-tab-${d.id}`} className="w-full min-w-0">
              <div key={d.id} className="animate-[kit-pop_350ms_var(--ease-out)_both]">
                {d.code ? (
                  <CodePanel title={<FileTitle file={d.file} />} meta={SKY_LABEL[d.mode]} lang={d.lang} code={d.code} />
                ) : (
                  <LambdaTimeline />
                )}
                <p className={`mt-3 px-5 py-4 text-[14.5px] leading-[1.6] text-pretty text-mute sm:px-6 ${FLAT_CARD}`}>{d.note}</p>
              </div>
            </div>
          </div>
        </div>
        <SkyRule />
      </div>
    </section>
  );
}

/** On the sky site this renders the whole section (a split); `head` is its heading. */
export function Deployments({ head }: { head?: ReactNode }) {
  return SKY ? <SkyDeployments head={head} /> : <GreenDeployments />;
}

function GreenDeployments() {
  const [active, setActive] = useState(DEPLOYMENTS[0].id);
  const d = DEPLOYMENTS.find((x) => x.id === active)!;
  const modeLabel = d.mode === "auto" ? "auto" : MODES.find((m) => m.mode === d.mode)!.label;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10">
      <div role="tablist" aria-label="Deployments" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-edge lg:px-0">
        {DEPLOYMENTS.map((x, i) => {
          const on = x.id === active;
          const label = x.mode === "auto" ? "auto" : MODES.find((m) => m.mode === x.mode)!.label;
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={`dep-tab-${x.id}`}
              aria-selected={on}
              aria-controls="dep-panel"
              onClick={() => setActive(x.id)}
              className={`group relative flex shrink-0 flex-col items-start gap-1 rounded-[16px] border px-4 py-3 text-left transition-colors duration-200 lg:rounded-none lg:border-0 lg:border-b lg:border-edge lg:px-0 lg:py-4 ${
                on ? "border-fg/50" : "border-edge-2"
              }`}
            >
              {on && <span aria-hidden className="absolute top-0 bottom-0 -left-px hidden w-[2px] bg-lime lg:block" />}
              <span className="flex items-center gap-2.5 lg:pl-4">
                <span className="font-mono text-[11.5px] text-dim">0{i + 1}</span>
                <span className={`text-[15.5px] font-medium whitespace-nowrap transition-colors lg:whitespace-normal ${on ? "text-fg" : "text-soft group-hover:text-fg"}`}>
                  {x.title}
                </span>
              </span>
              <span className="flex items-center gap-2 font-mono text-[11.5px] text-dim lg:pl-4">
                <ModeGlyph mode={x.mode} />
                <span className="whitespace-nowrap">
                  {label} · {x.sub}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div id="dep-panel" role="tabpanel" aria-labelledby={`dep-tab-${d.id}`} className="min-w-0">
        <div key={d.id} className="animate-[kit-pop_350ms_var(--ease-out)_both]">
          {d.code ? (
            <CodePanel title={d.file} meta={modeLabel} lang={d.lang} code={d.code} />
          ) : (
            <div className="grid min-h-[220px] place-items-center rounded-[16px] border border-dashed border-edge-3 p-8 text-center">
              <div>
                <ModeGlyph mode="wrong" className="mx-auto size-4" />
                <p className="mt-4 text-[22px] font-medium tracking-[-0.02em] text-fg">Wrong runtime for pilot-daemon.</p>
                <p className="mt-1 font-mono text-[12px] text-dim">no file to show</p>
              </div>
            </div>
          )}
          <p className="mt-5 max-w-[720px] text-[15px] leading-[1.6] text-mute">{d.note}</p>
        </div>
      </div>
    </div>
  );
}
