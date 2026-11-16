import chatgpt from "./assets/logos/chatgpt.svg";
import claude from "./assets/logos/claude.svg";
import cursor from "./assets/logos/cursor.svg";
import gemini from "./assets/logos/gemini.svg";
import grok from "./assets/logos/grok.png";
import lechat from "./assets/logos/lechat.png";
import muse from "./assets/logos/muse.png";
import perplexity from "./assets/logos/perplexity.svg";
import vscode from "./assets/logos/vscode.svg";
import type { Brand } from "@/components/v4/logos";
import bezel from "./assets/iphone-16-pro.png";
import code from "./assets/shots/code.webp";
import connect from "./assets/shots/connect.webp";
import friends from "./assets/shots/friends.webp";
import inbox from "./assets/shots/inbox.webp";
import mac from "./assets/shots/mac.webp";
import say from "./assets/shots/say.webp";

/* Logos and screenshots from pilotprotocol.network/cloud, bundled with the page. */

type Img = { src: string };
const src = (i: Img) => i.src;

/**
 * `mark`: on the sky site, the single-colour marks (ChatGPT, Cursor) come from public/logos as masks, so they take
 * the text colour in both themes instead of being inverted.
 */
export type Client = { name: string; logo: string; invert?: boolean; mark?: Brand };

/** "Works with", in the order the source lists them. ChatGPT and Cursor ship as near-black marks. */
export const CLIENTS: Client[] = [
  { name: "Muse", logo: src(muse) },
  { name: "ChatGPT", logo: src(chatgpt), invert: true, mark: "openai" },
  { name: "Claude", logo: src(claude) },
  { name: "Grok", logo: src(grok) },
  { name: "Gemini", logo: src(gemini) },
  { name: "Le Chat", logo: src(lechat) },
  { name: "Perplexity", logo: src(perplexity) },
  { name: "Cursor", logo: src(cursor), invert: true, mark: "cursor" },
  { name: "VS Code", logo: src(vscode) },
];

export const logo = (name: string) => CLIENTS.find((c) => c.name === name)!;

export const SHOTS = {
  bezel: src(bezel),
  connect: src(connect),
  say: src(say),
  friends: src(friends),
  inbox: src(inbox),
  code: src(code),
  mac: src(mac),
};
