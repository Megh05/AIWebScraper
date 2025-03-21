import { ScrapeResult } from "../types/scraper";

/**
 * Convert JSON data to a downloadable blob
 */
export function downloadJson(data: ScrapeResult): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  downloadBlob(blob, `scrape-${formatDateForFilename(data.scrapeDate)}.json`);
}

/**
 * Convert data to CSV format and download
 */
export function downloadCsv(data: ScrapeResult): void {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add basic info as CSV header
  csvContent += "URL,Scrape Date,Title,Description\n";
  csvContent += `${data.url},${data.scrapeDate},${csvEscape(data.metadata.title)},${csvEscape(data.metadata.description)}\n\n`;
  
  // Add Links section if available
  if (data.links && data.links.length > 0) {
    csvContent += "\nLINKS\n";
    csvContent += "URL,Text,Type\n";
    
    data.links.forEach(link => {
      csvContent += `${csvEscape(link.url)},${csvEscape(link.text)},${link.type}\n`;
    });
  }
  
  // Add Images section if available
  if (data.images && data.images.length > 0) {
    csvContent += "\nIMAGES\n";
    csvContent += "Source,Alt Text,Width,Height,Type\n";
    
    data.images.forEach(image => {
      csvContent += `${csvEscape(image.src)},${csvEscape(image.alt)},${image.width || ''},${image.height || ''},${image.type}\n`;
    });
  }
  
  // Add Content section if available
  if (data.content && data.content.paragraphs) {
    csvContent += "\nCONTENT\n";
    csvContent += "Paragraphs\n";
    
    data.content.paragraphs.forEach(paragraph => {
      csvContent += `${csvEscape(paragraph)}\n`;
    });
  }
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `scrape-${formatDateForFilename(data.scrapeDate)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper to download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for filename
 */
function formatDateForFilename(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().replace(/[:.]/g, "-").substring(0, 19);
}

/**
 * Escape special characters for CSV
 */
function csvEscape(text: string): string {
  if (!text) return '';
  // If text contains commas, quotes, or newlines, wrap in quotes and escape any existing quotes
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Copy text to clipboard
 */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
