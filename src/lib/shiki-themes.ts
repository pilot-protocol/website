import type { ThemeRegistration } from "shiki";

/*
 * Code highlighting in the site's palette: the text in ink or paper, strings in lime,
 * comments a quiet grey, and very little else coloured. One theme per site theme;
 * the block background comes from docs.css.
 */

type Palette = {
  fg: string;
  soft: string;
  mute: string;
  comment: string;
  string: string;
  number: string;
  keyword: string;
};

function pilotTheme(name: string, type: "light" | "dark", p: Palette): ThemeRegistration {
  return {
    name,
    type,
    colors: { "editor.background": "#00000000", "editor.foreground": p.soft },
    tokenColors: [
      { settings: { foreground: p.soft } },
      { scope: ["comment", "punctuation.definition.comment", "string.comment"], settings: { foreground: p.comment, fontStyle: "italic" } },
      {
        scope: ["string", "string.quoted", "string.template", "punctuation.definition.string", "markup.inline.raw"],
        settings: { foreground: p.string },
      },
      { scope: ["constant.numeric", "constant.language", "constant.character", "support.constant"], settings: { foreground: p.number } },
      {
        scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.control", "keyword.operator.new", "keyword.operator.expression"],
        settings: { foreground: p.keyword },
      },
      {
        scope: [
          "entity.name.function",
          "support.function",
          "entity.name.command",
          "support.function.builtin",
          "meta.function-call entity.name",
          "variable.function",
        ],
        settings: { foreground: p.fg },
      },
      { scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"], settings: { foreground: p.fg } },
      {
        scope: ["constant.other.option", "variable.parameter", "meta.parameter", "punctuation.definition.variable", "variable.other.normal"],
        settings: { foreground: p.mute },
      },
      { scope: ["keyword.operator", "punctuation", "meta.brace", "punctuation.separator"], settings: { foreground: p.mute } },
      { scope: ["support.type.property-name", "meta.object-literal.key", "entity.name.tag"], settings: { foreground: p.fg } },
      { scope: ["variable", "variable.other"], settings: { foreground: p.soft } },
      { scope: ["markup.heading", "markup.bold"], settings: { foreground: p.fg, fontStyle: "bold" } },
      { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
      { scope: ["markup.deleted"], settings: { foreground: "#e5484d" } },
      { scope: ["markup.inserted"], settings: { foreground: p.string } },
    ],
  };
}

// The sky site (NEXT_PUBLIC_SITE_VARIANT=sky) highlights in sky blue instead of lime.
const sky = process.env.NEXT_PUBLIC_SITE_VARIANT === "sky";

export const pilotLight = pilotTheme("pilot-light", "light", {
  fg: "#141413",
  soft: "#2f2f2c",
  // Flags and comments stay quiet but readable: 4.5:1 or better on the code block's paper.
  mute: "#66665f",
  comment: "#6b6b65",
  string: sky ? "#0b2ca0" : "#4f7300",
  number: sky ? "#1f5bff" : "#5f8a00",
  keyword: "#141413",
});

export const pilotDark = pilotTheme("pilot-dark", "dark", {
  fg: "#f2f2ec",
  soft: "#d6d6cf",
  mute: "#93938b",
  comment: "#8a8a83",
  string: sky ? "#8ec1ff" : "#c6f24e",
  number: sky ? "#a9d0ff" : "#d4f76e",
  keyword: "#f2f2ec",
});
