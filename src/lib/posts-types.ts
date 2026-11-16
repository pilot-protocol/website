export type Section = "blog" | "learn" | "news";

export type PostSummary = {
  kind: Section;
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  minutes: number;
};
