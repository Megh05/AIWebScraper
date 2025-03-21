import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scrapeWebsite } from "./services/scraper";
import { urlInputSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { analyzeWebContent as analyzeWithOpenAI } from "./services/openai";
import { analyzeWebContent as analyzeWithLocalAI } from "./services/localAnalyzer";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for scraping a website
  app.post("/api/scrape", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = urlInputSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const { url, parseImages, parseLinks, parseMetadata, parseText, useOpenAI, openAIKey } = result.data;

      // Check if we already have a recent scrape for this URL
      const existingScrape = await storage.getScrapeByUrl(url);
      if (existingScrape) {
        // If it was scraped in the last hour, return the cached result
        const scrapeDate = existingScrape.scrapeDate instanceof Date 
          ? existingScrape.scrapeDate 
          : new Date(existingScrape.scrapeDate);
        
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        
        if (scrapeDate > oneHourAgo) {
          return res.json(existingScrape);
        }
      }

      // Perform the scrape with the specified options
      const scrapeOptions = { parseImages, parseLinks, parseMetadata, parseText, useOpenAI, openAIKey };
      
      // First get the basic scraped data
      let scrapedData = await scrapeWebsite(url, scrapeOptions);
      
      // Then apply AI analysis if requested
      if (scrapedData.rawHtml) {
        let aiAnalysis;
        if (useOpenAI && openAIKey) {
          try {
            // Use OpenAI for analysis with the provided key
            aiAnalysis = await analyzeWithOpenAI(url, scrapedData.rawHtml, { 
              ...scrapeOptions, 
              openAIKey 
            });
            
            // Enhance the scraped data with AI insights
            scrapedData = {
              ...scrapedData,
              metadata: { ...scrapedData.metadata, aiInsights: aiAnalysis.metadata || {} },
              content: { ...scrapedData.content, aiInsights: aiAnalysis.content || {} },
              links: aiAnalysis.links || scrapedData.links,
              images: aiAnalysis.images || scrapedData.images
            };
          } catch (error) {
            console.error("OpenAI analysis error:", error);
            // Fall back to local analysis if OpenAI fails
            aiAnalysis = await analyzeWithLocalAI(url, scrapedData.rawHtml, scrapeOptions);
            scrapedData = {
              ...scrapedData,
              metadata: { ...scrapedData.metadata, aiInsights: aiAnalysis.metadata || {}, error: "OpenAI analysis failed, using local analysis instead" },
              content: { ...scrapedData.content, aiInsights: aiAnalysis.content || {} },
              links: aiAnalysis.links || scrapedData.links,
              images: aiAnalysis.images || scrapedData.images
            };
          }
        } else {
          // Use local analysis
          aiAnalysis = await analyzeWithLocalAI(url, scrapedData.rawHtml, scrapeOptions);
          scrapedData = {
            ...scrapedData,
            metadata: { ...scrapedData.metadata, aiInsights: aiAnalysis.metadata || {} },
            content: { ...scrapedData.content, aiInsights: aiAnalysis.content || {} },
            links: aiAnalysis.links || scrapedData.links,
            images: aiAnalysis.images || scrapedData.images
          };
        }
      }

      // Store the result
      const savedScrape = await storage.createScrape({
        url,
        metadata: scrapedData.metadata,
        content: scrapedData.content,
        links: scrapedData.links,
        images: scrapedData.images,
        rawHtml: scrapedData.rawHtml,
        options: scrapeOptions,
      });

      res.json(savedScrape);
    } catch (error: any) {
      console.error("Scrape error:", error);
      res.status(500).json({ message: error.message || "Failed to scrape the website" });
    }
  });

  // API route to get recent scrapes
  app.get("/api/scrapes/recent", async (_req: Request, res: Response) => {
    try {
      const recentScrapes = await storage.getRecentScrapes(10);
      
      // Remove rawHtml from the response to reduce payload size
      const scrapesWithoutHtml = recentScrapes.map(scrape => {
        const { rawHtml, ...rest } = scrape;
        return rest;
      });
      
      res.json(scrapesWithoutHtml);
    } catch (error: any) {
      console.error("Error fetching recent scrapes:", error);
      res.status(500).json({ message: error.message || "Failed to fetch recent scrapes" });
    }
  });

  // API route to get a specific scrape by ID
  app.get("/api/scrapes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const scrape = await storage.getScrape(id);
      if (!scrape) {
        return res.status(404).json({ message: "Scrape not found" });
      }

      // Remove rawHtml from the response unless specifically requested
      if (req.query.includeHtml !== 'true') {
        const { rawHtml, ...rest } = scrape;
        return res.json(rest);
      }

      res.json(scrape);
    } catch (error: any) {
      console.error("Error fetching scrape:", error);
      res.status(500).json({ message: error.message || "Failed to fetch scrape" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
