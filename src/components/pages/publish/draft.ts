/*
 * The publish submission, ported from the form on pilotprotocol.network/publish:
 * same steps, fields, validation, payload and draft key (so a draft started on
 * the old page carries over).
 */

export const API = "https://publish-api.pilotprotocol.network";
export const DRAFT_KEY = "pilot.publish.draft.v1";
export const AGREEMENT_VERSION = "2026-07-06";

export const STEPS = ["Email", "Identity", "Backend", "Methods", "Listing", "Vendor", "Review"] as const;
export type Step = (typeof STEPS)[number];

export const VERBS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
export const TYPES = ["string", "int", "number", "bool", "object"];
export const LATENCY: [string, string][] = [
  ["fast", "Fast"],
  ["med", "Medium"],
  ["slow", "Slow"],
];
export const PARAM_IN: [string, string][] = [
  ["query", "?name=value, url-encoded. Default for GET."],
  ["path", "fills {name} in the path, url-encoded (REST)."],
  ["path_raw", "fills {name} in the path unescaped, for URL-in-path APIs."],
  ["body", "JSON body field. Default for POST/PUT/PATCH."],
  ["header", "sent as a request header."],
];

export type Param = { name: string; type: string; required: boolean; in: string; description: string };
export type Method = {
  name: string;
  http: { verb: string; path: string };
  cli: { args: string; params_as_flags: boolean; passthrough: boolean };
  latency: string;
  description: string;
  params: Param[];
};
export type Draft = {
  email: string;
  id: string;
  version: string;
  description: string;
  app_type: "api" | "cli";
  backend: { base_url: string; headers: { name: string; value: string }[]; command: string; env_passthrough: string };
  methods: Method[];
  listing: {
    display_name: string;
    tagline: string;
    app_description: string;
    license: string;
    homepage: string;
    source_url: string;
    categories: string;
    keywords: string;
    requires_binary: boolean;
    binary_url: string;
  };
  vendor: { name: string; url: string; agent_usage: string; capabilities: string };
  release: { signer_name: string; agreed: boolean };
};

export const newParam = (): Param => ({ name: "", type: "string", required: false, in: "", description: "" });
export const newMethod = (): Method => ({
  name: "",
  http: { verb: "GET", path: "" },
  cli: { args: "", params_as_flags: false, passthrough: false },
  latency: "",
  description: "",
  params: [newParam()],
});

export function emptyDraft(): Draft {
  return {
    email: "",
    id: "io.pilot.",
    version: "",
    description: "",
    app_type: "api",
    backend: { base_url: "", headers: [{ name: "", value: "" }], command: "", env_passthrough: "" },
    methods: [newMethod()],
    listing: {
      display_name: "",
      tagline: "",
      app_description: "",
      license: "",
      homepage: "",
      source_url: "",
      categories: "",
      keywords: "",
      requires_binary: false,
      binary_url: "",
    },
    vendor: { name: "", url: "", agent_usage: "", capabilities: "" },
    release: { signer_name: "", agreed: false },
  };
}

/** Fills in anything an older draft is missing. */
export function loadDraft(raw: string | null): Draft {
  const base = emptyDraft();
  if (!raw) return base;
  try {
    const d = JSON.parse(raw) as Partial<Draft>;
    return {
      ...base,
      ...d,
      app_type: d.app_type ?? "api",
      backend: { ...base.backend, ...d.backend, headers: d.backend?.headers?.length ? d.backend.headers : base.backend.headers },
      methods: (d.methods?.length ? d.methods : base.methods).map((m) => ({
        ...newMethod(),
        ...m,
        http: { ...newMethod().http, ...m.http },
        cli: { ...newMethod().cli, ...m.cli },
        params: (m.params?.length ? m.params : [newParam()]).map((p) => ({ ...newParam(), ...p, in: p.in ?? "" })),
      })),
      listing: { ...base.listing, ...d.listing },
      vendor: { ...base.vendor, ...d.vendor },
      release: { ...base.release, ...d.release },
    };
  } catch {
    return base;
  }
}

export const appName = (d: Draft) => {
  const i = d.id.lastIndexOf(".");
  return i >= 0 ? d.id.slice(i + 1) : "";
};

export const defaultIn = (verb: string) => (verb === "GET" || verb === "DELETE" ? "query" : "body");

export function pathHas(path: string, name: string) {
  return !!name && new RegExp(`\\{${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\}`).test(path || "");
}

const list = (s: string) =>
  (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/** The JSON the publish API expects, exactly as the original form built it. */
export function payload(d: Draft) {
  const cli = d.app_type === "cli";
  const backend = cli
    ? { type: "cli", command: list(d.backend.command), env_passthrough: list(d.backend.env_passthrough) }
    : { type: "http", base_url: d.backend.base_url, headers: d.backend.headers.filter((h) => h.name.trim()) };
  return {
    id: d.id,
    version: d.version,
    description: d.description,
    email: d.email,
    backend,
    methods: d.methods
      .filter((m) => m.name.trim())
      .map((m) => {
        const params = m.params
          .filter((p) => p.name.trim())
          .map((p) => {
            const out: Record<string, unknown> = { name: p.name, type: p.type, required: !!p.required, description: p.description };
            if (!cli) out.in = p.in || defaultIn(m.http.verb);
            return out;
          });
        const base: Record<string, unknown> = { name: m.name, description: m.description, latency: m.latency, params };
        if (cli) base.cli = { args: m.cli.passthrough ? [] : list(m.cli.args), params_as_flags: !!m.cli.params_as_flags, passthrough: !!m.cli.passthrough };
        else base.http = { verb: m.http.verb, path: m.http.path };
        return base;
      }),
    listing: { ...d.listing, categories: list(d.listing.categories), keywords: list(d.listing.keywords) },
    vendor: { ...d.vendor, contact: d.email },
    release: { agreement_version: AGREEMENT_VERSION, signer_name: d.release.signer_name, agreed: !!d.release.agreed },
  };
}

export type Errors = Partial<Record<string, string>>;

/** Same checks, same wording, as the original form. */
export function validate(step: Step, d: Draft): Errors {
  const e: Errors = {};
  const name = appName(d);
  if (step === "Email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email || "")) e.email = "Enter a valid email";
  if (step === "Identity") {
    if (!/^io\.pilot\.[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(d.id)) e.id = "Must be io.pilot.<name> (lowercase, digits, hyphens)";
    if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?$/.test(d.version)) e.version = "Semver, e.g. 0.1.0";
    if (!d.description.trim()) e.description = "Required";
  }
  if (step === "Backend") {
    if (d.app_type === "cli") {
      if (!d.backend.command.trim()) e.command = "Enter the command to run, e.g. gh";
    } else if (!/^https?:\/\/[^\s/]+/.test(d.backend.base_url)) e.base_url = "Absolute http(s) URL";
  }
  if (step === "Methods") {
    const ms = d.methods.filter((m) => m.name.trim());
    if (!ms.length) e.methods = "Add at least one method";
    else if (d.app_type === "cli") {
      if (ms.some((m) => !m.latency || !m.description.trim() || !m.name.startsWith(`${name}.`) || (!m.cli.passthrough && !m.cli.args.trim() && !m.cli.params_as_flags)))
        e.methods = `Each CLI method needs a ${name}.-prefixed name, a latency, a description, and either arguments, params-as-flags, or passthrough`;
    } else if (ms.some((m) => !m.latency || !m.description.trim() || !/^\//.test(m.http.path) || !m.name.startsWith(`${name}.`))) {
      e.methods = `Each method needs a ${name}.-prefixed name, path starting with /, a latency, and a description`;
    } else {
      for (const m of ms)
        for (const p of m.params.filter((x) => x.name.trim())) {
          const where = p.in || defaultIn(m.http.verb);
          if ((where === "path" || where === "path_raw") && !pathHas(m.http.path, p.name) && !e.methods)
            e.methods = `Param "${p.name}" is mapped to ${p.in} but {${p.name}} is not in ${m.name}’s path. Add {${p.name}} to the path, or change its In.`;
        }
    }
  }
  if (step === "Review") {
    if (!d.release.signer_name.trim()) e.signer = "Type your full legal name to sign the release agreement";
    else if (!d.release.agreed) e.agree = "You must agree to the Publisher Release Agreement to submit";
  }
  return e;
}

/** What agents will see, computed here; the publish API's own preview replaces it when reachable. */
export function localPreview(d: Draft) {
  const ms = d.methods.filter((m) => m.name.trim());
  const help = ms.map((m) => ({ method: m.name, duration: m.latency || "?", summary: m.description.split(". ")[0] ?? "" }));
  const sample = (m: Method) => {
    if (d.app_type === "cli" && m.cli.passthrough) return '{"args":["…"]}';
    const ps = m.params.filter((p) => p.name.trim());
    return JSON.stringify(Object.fromEntries(ps.map((p) => [p.name, p.type === "string" ? "…" : p.type === "bool" ? true : p.type === "object" ? {} : 1])));
  };
  const commands = [
    `pilotctl appstore install ${d.id}`,
    ...ms.map((m) => `pilotctl appstore call ${d.id} ${m.name} '${sample(m)}'`),
  ];
  return { help, commands };
}
