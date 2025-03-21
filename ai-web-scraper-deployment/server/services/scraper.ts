import axios from 'axios';
import * as cheerio from 'cheerio';
import { analyzeWebContent } from './localAnalyzer';
import { ScrapeOptions } from '@shared/schema';

export async function scrapeWebsite(url: string, options: ScrapeOptions) {
  try {
    // Fetch HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);
    
    // Initialize result object
    const result: any = {
      url,
      scrapeDate: new Date().toISOString(),
      metadata: {},
      content: {},
      links: [],
      images: []
    };

    // Extract metadata if option is enabled
    if (options.parseMetadata) {
      result.metadata = {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content') || '',
        canonical: $('link[rel="canonical"]').attr('href') || url,
        language: $('html').attr('lang') || '',
        favicon: $('link[rel="icon"]').attr('href') || '/favicon.ico',
        openGraph: {
          title: $('meta[property="og:title"]').attr('content') || '',
          description: $('meta[property="og:description"]').attr('content') || '',
          image: $('meta[property="og:image"]').attr('content') || null,
          url: $('meta[property="og:url"]').attr('content') || '',
          type: $('meta[property="og:type"]').attr('content') || '',
        },
        twitter: {
          card: $('meta[name="twitter:card"]').attr('content') || '',
          site: $('meta[name="twitter:site"]').attr('content') || null,
          creator: $('meta[name="twitter:creator"]').attr('content') || null,
        },
        other: {}
      };

      // Extract other meta tags
      $('meta').each((i, el) => {
        const name = $(el).attr('name') || $(el).attr('property');
        const content = $(el).attr('content');
        if (name && content && !name.startsWith('og:') && !name.startsWith('twitter:')) {
          result.metadata.other[name] = content;
        }
      });
    }

    // Extract text content if option is enabled
    if (options.parseText) {
      // Extract headings
      const headings: Array<{ type: string; text: string; level: number }> = [];
      $('h1, h2, h3, h4, h5, h6').each((i, el) => {
        const type = el.name;
        const text = $(el).text().trim();
        const level = parseInt(type.substring(1));
        headings.push({ type, text, level });
      });

      // Extract paragraphs
      const paragraphs: string[] = [];
      $('p').each((i, el) => {
        const text = $(el).text().trim();
        if (text) paragraphs.push(text);
      });

      // Calculate basic stats
      const allText = $('body').text();
      const wordCount = allText.split(/\s+/).filter(Boolean).length;
      const readingTimeMinutes = wordCount / 200; // Average reading speed

      result.content = {
        headings,
        paragraphs,
        stats: {
          wordCount,
          paragraphCount: paragraphs.length,
          readingTimeMinutes,
          headingCount: headings.length,
        },
      };
    }

    // Extract links if option is enabled
    if (options.parseLinks) {
      $('a').each((i, el) => {
        const url = $(el).attr('href') || '';
        const text = $(el).text().trim();
        const rel = $(el).attr('rel') || null;
        const target = $(el).attr('target') || null;
        
        // Skip empty URLs
        if (!url) return;
        
        // Determine if internal or external
        const type = url.startsWith('http') && !url.includes(result.url) 
          ? 'external' 
          : 'internal';
        
        result.links.push({
          url,
          text,
          type,
          attributes: { rel, target },
        });
      });
    }

    // Extract images if option is enabled
    if (options.parseImages) {
      $('img').each((i, el) => {
        const src = $(el).attr('src') || '';
        const alt = $(el).attr('alt') || '';
        const width = parseInt($(el).attr('width') || '0');
        const height = parseInt($(el).attr('height') || '0');
        
        // Skip empty sources
        if (!src) return;
        
        // Determine image type from extension
        const extension = src.split('.').pop()?.toLowerCase() || '';
        let type = '';
        if (['jpg', 'jpeg'].includes(extension)) type = 'JPG';
        else if (extension === 'png') type = 'PNG';
        else if (extension === 'svg') type = 'SVG';
        else if (extension === 'gif') type = 'GIF';
        else if (extension === 'webp') type = 'WEBP';
        else type = 'Unknown';
        
        result.images.push({
          src,
          alt,
          width: width || null,
          height: height || null,
          type,
          // We can't determine actual file size from HTML alone
          size: null
        });
      });
    }

    // Add the raw HTML
    result.rawHtml = html;

    // Use our local analyzer to enhance the extracted content
    try {
      const aiEnhancements = await analyzeWebContent(url, html, options);
      
      // Merge enhanced data
      if (aiEnhancements.metadata && options.parseMetadata) {
        result.metadata = { ...result.metadata, ...aiEnhancements.metadata };
      }
      
      if (aiEnhancements.content && options.parseText) {
        result.content = { ...result.content, ...aiEnhancements.content };
      }
      
      if (aiEnhancements.links && options.parseLinks) {
        // Enhance existing links with analysis
        const linkMap = new Map();
        result.links.forEach((link: any) => linkMap.set(link.url, link));
        
        aiEnhancements.links.forEach((link: any) => {
          if (linkMap.has(link.url)) {
            const existingLink = linkMap.get(link.url);
            linkMap.set(link.url, { ...existingLink, ...link });
          }
        });
        
        result.links = Array.from(linkMap.values());
      }
      
      if (aiEnhancements.images && options.parseImages) {
        // Enhance existing images with analysis
        const imageMap = new Map();
        result.images.forEach((img: any) => imageMap.set(img.src, img));
        
        aiEnhancements.images.forEach((img: any) => {
          if (imageMap.has(img.src)) {
            const existingImg = imageMap.get(img.src);
            imageMap.set(img.src, { ...existingImg, ...img });
          }
        });
        
        result.images = Array.from(imageMap.values());
      }
    } catch (error) {
      console.error('Content analysis failed, using basic extracted data:', error);
    }

    return result;
  } catch (error: any) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape website: ${error.message}`);
  }
}
