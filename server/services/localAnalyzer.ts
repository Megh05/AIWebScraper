import * as cheerio from 'cheerio';
import { ScrapeOptions } from '@shared/schema';

/**
 * Local content analyzer that extracts insights without requiring external AI APIs
 */
export async function analyzeWebContent(url: string, html: string, options: ScrapeOptions) {
  const $ = cheerio.load(html);
  const result: any = {};

  // Extract and enhance metadata
  if (options.parseMetadata) {
    result.metadata = {
      mainTopic: extractMainTopic($),
      contentType: detectContentType($),
      estimatedAge: estimateContentAge($),
      keyTerms: extractKeyTerms($),
      sentiment: analyzeSentiment($),
      estimatedReadability: estimateReadability($)
    };
  }

  // Analyze text content
  if (options.parseText) {
    result.content = {
      summary: generateSummary($),
      mainThemes: identifyThemes($),
      topKeywords: extractTopKeywords($, 10),
      keyPhrases: extractKeyPhrases($),
      estimatedQuality: estimateContentQuality($)
    };
  }

  // Analyze links
  if (options.parseLinks) {
    result.links = categorizeLinks($, url);
  }

  // Analyze images
  if (options.parseImages) {
    result.images = analyzeImages($);
  }

  return result;
}

/**
 * Extract what seems to be the main topic of the page
 */
function extractMainTopic($: cheerio.CheerioAPI): string {
  // Check for h1 first
  const h1Text = $('h1').first().text().trim();
  if (h1Text && h1Text.length > 5) {
    return h1Text;
  }

  // Check the title
  const title = $('title').text().trim();
  if (title) {
    // Remove common patterns like "- Company Name" or "| Website"
    return title.replace(/[-|]\s*[^-|]*$/, '').trim();
  }

  // Check meta description
  const metaDesc = $('meta[name="description"]').attr('content');
  if (metaDesc) {
    // Get first sentence or clause
    const firstSentence = metaDesc.split(/[.,:;]/).filter(s => s.trim().length > 10)[0];
    if (firstSentence) {
      return firstSentence.trim();
    }
  }

  return "Unknown Topic";
}

/**
 * Detect the type of content on the page
 */
function detectContentType($: cheerio.CheerioAPI): string {
  // Check for product indicators
  if (
    $('.product').length > 0 ||
    $('#product').length > 0 ||
    $('[itemtype*="Product"]').length > 0 ||
    $('body').text().toLowerCase().includes('add to cart') ||
    $('button:contains("Buy")').length > 0
  ) {
    return 'Product Page';
  }

  // Check for blog/article indicators
  if (
    $('article').length > 0 ||
    $('.post').length > 0 ||
    $('.blog').length > 0 ||
    $('[itemtype*="Article"]').length > 0 ||
    ($('time').length > 0 && $('p').length > 5)
  ) {
    return 'Article/Blog';
  }

  // Check for contact page
  if (
    $('form').length > 0 && 
    ($('input[type="email"]').length > 0 || $('input[name*="email"]').length > 0) &&
    ($('textarea').length > 0 || $('input[name*="message"]').length > 0)
  ) {
    return 'Contact Page';
  }

  // Check for homepage
  if (
    $('body').attr('id')?.includes('home') ||
    $('body').attr('class')?.includes('home') ||
    $('nav').length > 0 && $('section').length > 2
  ) {
    return 'Homepage';
  }

  // Check for about page
  if (
    $('h1:contains("About")').length > 0 ||
    $('title:contains("About")').length > 0 ||
    $('.about').length > 0 ||
    $('#about').length > 0
  ) {
    return 'About Page';
  }

  return 'General Web Page';
}

/**
 * Estimate how old the content might be based on dates in the page
 */
function estimateContentAge($: cheerio.CheerioAPI): string {
  // Look for published dates
  const publishedTime = $('meta[property="article:published_time"]').attr('content');
  if (publishedTime) {
    try {
      const date = new Date(publishedTime);
      return `Published on ${date.toLocaleDateString()}`;
    } catch (e) {
      // Invalid date format
    }
  }

  // Look for dates in time elements
  const timeElement = $('time[datetime]').first().attr('datetime');
  if (timeElement) {
    try {
      const date = new Date(timeElement);
      return `Last updated ${date.toLocaleDateString()}`;
    } catch (e) {
      // Invalid date format
    }
  }

  // Look for copyright years
  const copyrightText = $('footer').text();
  const yearMatch = copyrightText.match(/(?:©|copyright|copy;)\s*(?:\d{4}[-–—])?(\d{4})/i);
  if (yearMatch && yearMatch[1]) {
    const year = parseInt(yearMatch[1]);
    const currentYear = new Date().getFullYear();
    if (year === currentYear) {
      return `Updated this year (${year})`;
    } else {
      return `Last copyright year: ${year}`;
    }
  }

  return "Age unknown";
}

/**
 * Extract important terms from the document
 */
function extractKeyTerms($: cheerio.CheerioAPI): string[] {
  const text = $('body').text();
  
  // Remove common words and get word frequencies
  const commonWords = new Set([
    'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
    'by', 'as', 'is', 'are', 'was', 'were', 'be', 'this', 'that', 'it', 
    'or', 'not', 'but', 'what', 'which', 'who', 'whom', 'whose', 'when',
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
    'most', 'some', 'such', 'than', 'too', 'very', 'can', 'will', 'just',
    'should', 'now'
  ]);
  
  // Extract words and count frequencies
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Convert to array of [word, frequency] pairs and sort
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
  
  return sortedWords;
}

/**
 * Simple sentiment analysis based on keyword matching
 */
function analyzeSentiment($: cheerio.CheerioAPI): string {
  const text = $('body').text().toLowerCase();
  
  const positiveWords = [
    'good', 'great', 'best', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'love', 'happy', 'positive', 'beautiful', 'outstanding', 'perfect', 'easy',
    'helpful', 'useful', 'recommend', 'awesome', 'incredible', 'enjoy', 'benefit'
  ];
  
  const negativeWords = [
    'bad', 'worst', 'terrible', 'awful', 'horrible', 'poor', 'negative', 
    'difficult', 'hard', 'complaint', 'issue', 'problem', 'hate', 'dislike',
    'disappointing', 'expensive', 'failed', 'broken', 'avoid', 'waste', 'unfortunately'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  // Calculate sentiment score normalized to -1 to 1 range
  const total = positiveCount + negativeCount;
  if (total === 0) return "Neutral";
  
  const score = (positiveCount - negativeCount) / total;
  
  if (score > 0.25) return "Positive";
  if (score < -0.25) return "Negative";
  return "Neutral";
}

/**
 * Estimate readability based on sentence and word length
 */
function estimateReadability($: cheerio.CheerioAPI): string {
  const paragraphs = $('p');
  if (paragraphs.length === 0) return "Unknown readability";
  
  let totalWords = 0;
  let totalSentences = 0;
  let complexWords = 0; // Words with 3+ syllables
  
  paragraphs.each((_, el) => {
    const text = $(el).text().trim();
    if (!text) return;
    
    // Count sentences (roughly)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    totalSentences += sentences.length;
    
    // Count words
    const words = text.split(/\s+/).filter(w => w.match(/[a-z0-9]/i));
    totalWords += words.length;
    
    // Roughly estimate complex words (3+ syllables) by character length
    words.forEach(word => {
      if (word.length > 9) complexWords++;
    });
  });
  
  if (totalSentences === 0 || totalWords === 0) return "Unknown readability";
  
  // Average words per sentence
  const avgWordPerSentence = totalWords / totalSentences;
  
  // Percentage of complex words
  const percentComplex = (complexWords / totalWords) * 100;
  
  // Simple classification
  if (avgWordPerSentence > 20 || percentComplex > 15) {
    return "Academic/Advanced";
  } else if (avgWordPerSentence > 14 || percentComplex > 10) {
    return "Intermediate";
  } else {
    return "Easy to read";
  }
}

/**
 * Generate a simple summary of the content
 */
function generateSummary($: cheerio.CheerioAPI): string {
  // Try to get the first paragraph that has a reasonable length
  const firstParagraph = $('p')
    .filter((_, el) => {
      const text = $(el).text().trim();
      return text.length > 50 && text.length < 300;
    })
    .first()
    .text()
    .trim();
  
  if (firstParagraph) return firstParagraph;
  
  // If no good paragraph, combine title and meta description
  const title = $('title').text().trim();
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  
  if (title && metaDesc) {
    return `${title} - ${metaDesc}`;
  }
  
  // Last resort: get first 250 characters of text
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  return bodyText.length > 250 ? bodyText.substring(0, 250) + '...' : bodyText;
}

/**
 * Identify main themes in the content
 */
function identifyThemes($: cheerio.CheerioAPI): string[] {
  const themes = new Set<string>();
  
  // Extract from headings
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 3 && text.length < 60) {
      themes.add(text);
    }
  });
  
  // Extract from strong/b elements that might indicate important topics
  $('strong, b').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 3 && text.length < 40) {
      themes.add(text);
    }
  });
  
  // Extract from list items in short lists (might be key points)
  const shortLists = $('ul, ol').filter((_, el) => {
    return $(el).children('li').length > 1 && $(el).children('li').length < 6;
  });
  
  shortLists.find('li').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 5 && text.length < 100) {
      themes.add(text.replace(/^[-*•]/, '').trim());
    }
  });
  
  return Array.from(themes).slice(0, 5);
}

/**
 * Extract top keywords by frequency
 */
function extractTopKeywords($: cheerio.CheerioAPI, count: number): string[] {
  const text = $('body').text().toLowerCase();
  
  // Remove common stopwords and count frequencies
  const stopwords = new Set([
    'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
    'by', 'as', 'is', 'are', 'was', 'were', 'be', 'this', 'that', 'it', 
    'or', 'not', 'but', 'what', 'which', 'who', 'whom', 'whose', 'when',
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
    'most', 'some', 'such', 'than', 'too', 'very', 'can', 'will', 'just',
    'should', 'now', 'from', 'about', 'would', 'could', 'their', 'they',
    'them', 'these', 'those', 'then', 'than', 'your', 'our', 'we', 'us'
  ]);
  
  // Tokenize and clean text
  const words = text.replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopwords.has(word) && isNaN(Number(word)));
  
  // Count frequencies
  const frequencies: Record<string, number> = {};
  for (const word of words) {
    frequencies[word] = (frequencies[word] || 0) + 1;
  }
  
  // Sort by frequency and return top N
  return Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

/**
 * Extract key phrases (2-3 word sequences that appear frequently)
 */
function extractKeyPhrases($: cheerio.CheerioAPI): string[] {
  const text = $('body').text();
  
  // Extract n-grams (2-3 word phrases)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  const phrases: Record<string, number> = {};
  const stopwords = new Set(['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);
  
  // Collect bigrams and trigrams
  for (let i = 0; i < words.length - 1; i++) {
    // Skip if first word is a stopword
    if (stopwords.has(words[i])) continue;
    
    // Bigrams
    const bigram = `${words[i]} ${words[i+1]}`;
    if (bigram.length > 5) {
      phrases[bigram] = (phrases[bigram] || 0) + 1;
    }
    
    // Trigrams
    if (i < words.length - 2 && !stopwords.has(words[i+1])) {
      const trigram = `${words[i]} ${words[i+1]} ${words[i+2]}`;
      if (trigram.length > 8) {
        phrases[trigram] = (phrases[trigram] || 0) + 1;
      }
    }
  }
  
  // Sort by frequency and return top phrases
  return Object.entries(phrases)
    .filter(([_, count]) => count > 1) // Only include repeated phrases
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase]) => phrase);
}

/**
 * Estimate content quality based on various factors
 */
function estimateContentQuality($: cheerio.CheerioAPI): string {
  let score = 0;
  
  // Check content length
  const bodyText = $('body').text().trim();
  const wordCount = bodyText.split(/\s+/).length;
  
  if (wordCount > 1000) score += 2;
  else if (wordCount > 500) score += 1;
  
  // Check for structured content
  if ($('h1, h2, h3').length > 3) score += 1;
  if ($('ul, ol').length > 2) score += 1;
  
  // Check for media
  if ($('img').length > 2) score += 1;
  if ($('video, iframe[src*="youtube"]').length > 0) score += 1;
  
  // Check for internal and external links
  if ($('a[href^="http"]').length > 3) score += 1;
  
  // Check for formatting
  if ($('strong, b, em, i').length > 5) score += 1;
  
  // Evaluate score
  if (score >= 7) return "Excellent";
  if (score >= 5) return "Good";
  if (score >= 3) return "Average";
  return "Basic";
}

/**
 * Categorize links by purpose
 */
function categorizeLinks($: cheerio.CheerioAPI, baseUrl: string): any[] {
  const result: any[] = [];
  const urlObj = new URL(baseUrl);
  const domain = urlObj.hostname;
  
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    
    // Skip empty links
    if (!href) return;
    
    let type: string;
    let category: string;
    
    // Determine if internal or external
    if (href.startsWith('#')) {
      type = 'internal';
      category = 'anchor';
    } else if (href.startsWith('/') || href.includes(domain)) {
      type = 'internal';
      category = 'navigation';
    } else if (href.startsWith('http')) {
      type = 'external';
      category = 'reference';
    } else if (href.startsWith('mailto:')) {
      type = 'external';
      category = 'contact';
    } else {
      type = 'unknown';
      category = 'other';
    }
    
    // Refine categories
    if (type === 'internal') {
      if (href.match(/\.(pdf|doc|docx|xls|xlsx|csv|txt|zip|rar)$/i)) {
        category = 'download';
      } else if (href.includes('contact') || href.includes('about')) {
        category = 'information';
      } else if (href.includes('product') || href.includes('shop') || href.includes('buy')) {
        category = 'product';
      } else if (href.includes('blog') || href.includes('article') || href.includes('post') || href.includes('news')) {
        category = 'content';
      }
    } else if (type === 'external') {
      if (href.includes('facebook.com') || href.includes('twitter.com') || 
          href.includes('instagram.com') || href.includes('linkedin.com')) {
        category = 'social';
      } else if (href.includes('youtube.com') || href.includes('vimeo.com')) {
        category = 'media';
      } else if (href.match(/\.(pdf|doc|docx|xls|xlsx|csv|txt|zip|rar)$/i)) {
        category = 'download';
      } else if (text.toLowerCase().includes('login') || text.toLowerCase().includes('sign in')) {
        category = 'authentication';
      }
    }
    
    // Add the categorized link
    result.push({
      url: href,
      text: text || '(No text)',
      type,
      category,
      importance: estimateLinkImportance($(el))
    });
  });
  
  return result;
}

/**
 * Estimate how important a link is based on its position, style, etc.
 */
function estimateLinkImportance($el: cheerio.Cheerio<any>): string {
  // Check if in navigation
  if ($el.parents('nav, header').length > 0) {
    return 'Primary Navigation';
  }
  
  // Check if button-like
  if ($el.hasClass('button') || $el.css('display') === 'block' || 
      $el.css('padding') || $el.css('background-color')) {
    return 'Call to Action';
  }
  
  // Check if footer link
  if ($el.parents('footer').length > 0) {
    return 'Footer Link';
  }
  
  // Check if in main content
  if ($el.parents('article, main, .content, #content').length > 0) {
    return 'Content Link';
  }
  
  // Check if has image
  if ($el.find('img').length > 0) {
    return 'Visual Link';
  }
  
  return 'Standard Link';
}

/**
 * Analyze images for context and purpose
 */
function analyzeImages($: cheerio.CheerioAPI): any[] {
  const imageAnalysis: any[] = [];
  
  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (!src) return;
    
    const alt = $(el).attr('alt') || '';
    const width = parseInt($(el).attr('width') || '0') || null;
    const height = parseInt($(el).attr('height') || '0') || null;
    
    // Determine purpose based on context and attributes
    let purpose = 'Unknown';
    let importance = 'Low';
    
    // Check if it's a product image
    if (
      $(el).parents('[itemtype*="Product"]').length > 0 ||
      $(el).parents('.product').length > 0 ||
      alt.toLowerCase().includes('product')
    ) {
      purpose = 'Product Image';
      importance = 'High';
    }
    // Check if hero/banner image
    else if (
      $(el).closest('header').length > 0 ||
      (width && width > 800) ||
      $(el).parent().hasClass('hero') ||
      $(el).hasClass('banner') ||
      $(el).parents('.banner, .hero, .jumbotron').length > 0
    ) {
      purpose = 'Hero/Banner Image';
      importance = 'High';
    }
    // Check if icon
    else if (
      (width && width < 50 && height && height < 50) ||
      src.includes('icon') ||
      alt.includes('icon') ||
      $(el).hasClass('icon')
    ) {
      purpose = 'Icon';
      importance = 'Low';
    }
    // Check if background/decorative
    else if (
      !alt ||
      alt === '' ||
      $(el).parent().css('background-image') ||
      $(el).parent().css('z-index') === '-1'
    ) {
      purpose = 'Decorative';
      importance = 'Low';
    }
    // Check if content image
    else if (
      $(el).parents('article, .content, #content, main').length > 0 ||
      $(el).parents('p, figure').length > 0
    ) {
      purpose = 'Content Image';
      importance = 'Medium';
    }
    // Check if logo
    else if (
      src.toLowerCase().includes('logo') ||
      alt.toLowerCase().includes('logo') ||
      $(el).hasClass('logo') ||
      ($(el).closest('a').length > 0 && $(el).closest('a').attr('href') === '/')
    ) {
      purpose = 'Logo';
      importance = 'High';
    }
    // Check if avatar/profile image
    else if (
      src.toLowerCase().includes('avatar') ||
      src.toLowerCase().includes('profile') ||
      alt.toLowerCase().includes('profile') ||
      alt.toLowerCase().includes('avatar') ||
      $(el).hasClass('avatar') ||
      $(el).hasClass('profile')
    ) {
      purpose = 'Avatar/Profile';
      importance = 'Medium';
    }
    
    imageAnalysis.push({
      src,
      purpose,
      importance,
      context: determineImageContext($(el))
    });
  });
  
  return imageAnalysis;
}

/**
 * Determine the context in which an image appears
 */
function determineImageContext($el: cheerio.Cheerio<any>): string {
  // Check if in a specific structural element
  if ($el.parents('header').length > 0) return 'Header';
  if ($el.parents('footer').length > 0) return 'Footer';
  if ($el.parents('aside, .sidebar').length > 0) return 'Sidebar';
  if ($el.parents('article').length > 0) return 'Article';
  if ($el.parents('nav').length > 0) return 'Navigation';
  
  // Check relation to text
  const prevText = $el.prev('p, h1, h2, h3, h4, h5, h6').text().trim();
  const nextText = $el.next('p, h1, h2, h3, h4, h5, h6').text().trim();
  const parentText = $el.parent().clone().children().remove().end().text().trim();
  
  if (prevText.length > 0 || nextText.length > 0) {
    return 'Illustration for adjacent text';
  }
  
  if ($el.parent().find('h1, h2, h3, h4, h5, h6').length > 0) {
    return 'Section visual';
  }
  
  if ($el.parent().is('a')) {
    return 'Linked image';
  }
  
  if (parentText.length > 0) {
    return 'Embedded in text';
  }
  
  return 'Standalone image';
}