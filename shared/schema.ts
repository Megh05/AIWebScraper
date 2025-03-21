import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication (keeping original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Scrape Data schema
export const scrapes = pgTable("scrapes", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  scrapeDate: timestamp("scrape_date").notNull().defaultNow(),
  metadata: json("metadata"),
  content: json("content"),
  links: json("links"),
  images: json("images"),
  rawHtml: text("raw_html"),
  options: json("options").notNull(),
});

export const insertScrapeSchema = createInsertSchema(scrapes).omit({
  id: true,
  scrapeDate: true,
});

export type InsertScrape = z.infer<typeof insertScrapeSchema>;
export type Scrape = typeof scrapes.$inferSelect;

// Scrape Options schema
export const scrapeOptionsSchema = z.object({
  parseImages: z.boolean().default(true),
  parseLinks: z.boolean().default(true),
  parseMetadata: z.boolean().default(true),
  parseText: z.boolean().default(true),
  useOpenAI: z.boolean().default(false),
  openAIKey: z.string().optional(),
});

export type ScrapeOptions = z.infer<typeof scrapeOptionsSchema>;

// URL Input schema
export const urlInputSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  parseImages: z.boolean().default(true),
  parseLinks: z.boolean().default(true),
  parseMetadata: z.boolean().default(true),
  parseText: z.boolean().default(true),
  useOpenAI: z.boolean().default(false),
  openAIKey: z.string().optional(),
});

export type UrlInput = z.infer<typeof urlInputSchema>;
