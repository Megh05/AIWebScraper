// Types for the scraping functionality

export interface ScrapeOptions {
  parseImages: boolean;
  parseLinks: boolean;
  parseMetadata: boolean;
  parseText: boolean;
}

export interface ScrapeFormData extends ScrapeOptions {
  url: string;
}

export interface MetaTag {
  name: string;
  content: string;
}

export interface OpenGraph {
  title: string;
  description: string;
  image: string | null;
  url: string;
  type: string;
}

export interface TwitterCard {
  card: string;
  site: string | null;
  creator: string | null;
}

export interface Metadata {
  title: string;
  description: string;
  canonical: string;
  language: string;
  favicon: string;
  openGraph: OpenGraph;
  twitter: TwitterCard;
  other: Record<string, string>;
}

export interface Heading {
  type: string;
  text: string;
  level: number;
}

export interface ContentStats {
  wordCount: number;
  paragraphCount: number;
  readingTimeMinutes: number;
  headingCount: number;
}

export interface Content {
  headings: Heading[];
  paragraphs: string[];
  stats: ContentStats;
}

export interface LinkAttributes {
  rel: string | null;
  target: string | null;
}

export interface Link {
  url: string;
  text: string;
  type: 'internal' | 'external';
  attributes: LinkAttributes;
}

export interface Image {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  size: number | null;
  type: string;
}

export interface ScrapeResult {
  id: number;
  url: string;
  scrapeDate: string;
  metadata: Metadata;
  content: Content;
  links: Link[];
  images: Image[];
  options: ScrapeOptions;
}
