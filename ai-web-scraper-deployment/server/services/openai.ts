import OpenAI from "openai";
import { ScrapeOptions } from "@shared/schema";

/**
 * Uses AI to analyze web content and enhance the extracted data
 */
export async function analyzeWebContent(url: string, html: string, options: ScrapeOptions) {
  if (!options.openAIKey) {
    throw new Error("OpenAI API key is required for AI analysis");
  }
  
  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  const openai = new OpenAI({ apiKey: options.openAIKey });
  // Limit HTML length to avoid token limits
  const truncatedHtml = html.length > 15000 ? html.substring(0, 15000) + '...' : html;
  
  // Create a prompt based on the scraping options
  let prompt = `Analyze the following HTML from ${url} and extract structured information. `;
  
  if (options.parseMetadata) {
    prompt += `Extract the most relevant metadata about the page including title, description, main topics, and purpose. `;
  }
  
  if (options.parseText) {
    prompt += `Analyze the main content: identify the main subject, key points, and summarize the overall message. `;
  }
  
  if (options.parseLinks) {
    prompt += `Categorize the links on the page by purpose (navigation, resource, citation, etc). `;
  }
  
  if (options.parseImages) {
    prompt += `For images, infer their purpose and relevance to the content. `;
  }
  
  prompt += `Structure your analysis as JSON with these sections: 
  "metadata": general page information,
  "content": analysis of text content,
  "links": categorized links analysis,
  "images": image analysis.
  
  Only include sections that were requested in the options. The HTML content is as follows:
  
  ${truncatedHtml}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a web content analyzer that extracts structured information from HTML. Focus on providing accurate, concise analyses and categorizations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Handle null response or empty content
    const content = response.choices[0].message.content || "{}";
    
    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    // Return empty object instead of failing completely
    return {};
  }
}
