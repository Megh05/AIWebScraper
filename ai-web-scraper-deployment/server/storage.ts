import { Scrape, InsertScrape, User, InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Scrape related methods
  getScrape(id: number): Promise<Scrape | undefined>;
  getScrapeByUrl(url: string): Promise<Scrape | undefined>;
  getRecentScrapes(limit?: number): Promise<Scrape[]>;
  createScrape(scrape: InsertScrape): Promise<Scrape>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scrapes: Map<number, Scrape>;
  private userCurrentId: number;
  private scrapeCurrentId: number;

  constructor() {
    this.users = new Map();
    this.scrapes = new Map();
    this.userCurrentId = 1;
    this.scrapeCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Scrape methods
  async getScrape(id: number): Promise<Scrape | undefined> {
    return this.scrapes.get(id);
  }

  async getScrapeByUrl(url: string): Promise<Scrape | undefined> {
    return Array.from(this.scrapes.values()).find(
      (scrape) => scrape.url === url,
    );
  }

  async getRecentScrapes(limit: number = 10): Promise<Scrape[]> {
    return Array.from(this.scrapes.values())
      .sort((a, b) => {
        const dateA = a.scrapeDate instanceof Date ? a.scrapeDate : new Date(a.scrapeDate);
        const dateB = b.scrapeDate instanceof Date ? b.scrapeDate : new Date(b.scrapeDate);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  async createScrape(insertScrape: InsertScrape): Promise<Scrape> {
    const id = this.scrapeCurrentId++;
    const scrapeDate = new Date();
    
    // Create scrape with default values
    const scrape = {
      id,
      url: insertScrape.url,
      scrapeDate,
      metadata: insertScrape.metadata || {},
      content: insertScrape.content || {},
      links: insertScrape.links || [],
      images: insertScrape.images || [],
      rawHtml: insertScrape.rawHtml || null,
      options: insertScrape.options
    } as Scrape;
    
    this.scrapes.set(id, scrape);
    return scrape;
  }
}

export const storage = new MemStorage();
