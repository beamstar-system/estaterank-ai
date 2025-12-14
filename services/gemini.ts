import { GoogleGenAI } from "@google/genai";
import { Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findLeads = async (
  location: string, 
  niche: string
): Promise<{ leads: Lead[]; rawText: string; sources: any[] }> => {
  
  const prompt = `
    Find 5-7 real estate businesses (agents, agencies, property managers) in "${location}" related to "${niche}" that might need SEO services. 
    Use Google Maps to verify they exist and Google Search to analyze their digital presence.

    Look for businesses that:
    1. Have low ratings or few reviews on Maps.
    2. Do not have a website listed, or have a website that appears outdated or hard to find.
    3. Are not ranking at the top of search results for their main keywords.

    Strictly format your response as a list of text blocks. 
    Do NOT use JSON markdown.
    Use exactly this format for each lead found:

    ### LEAD
    Name: [Business Name]
    URL: [Website URL or "None"]
    Rating: [Google Maps Rating/Review Count or "N/A"]
    Issue: [One sentence explaining the SEO weakness]
    Action: [One specific service to pitch, e.g., "Website Redesign", "Local SEO", "Reputation Management"]
    Description: [A brief 1-2 sentence overview of the business status found via search]

    If you cannot find specific details, write "N/A".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
      },
    });

    const text = response.text || "";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
      if (chunk.web) {
        return { title: chunk.web.title, url: chunk.web.uri };
      }
      return null;
    }).filter(Boolean) || [];

    const leads = parseLeadsFromText(text);

    return {
      leads,
      rawText: text,
      sources,
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let errorMessage = "Failed to generate leads. Please try again.";

    // Check for standard Error object message or raw API error structure
    const errorStr = error.message || JSON.stringify(error);
    
    if (
        errorStr.includes("429") || 
        errorStr.includes("quota") || 
        errorStr.includes("RESOURCE_EXHAUSTED") ||
        error?.error?.code === 429 ||
        error?.status === 429
    ) {
        errorMessage = "⚠️ API Rate Limit Exceeded. The system is currently receiving too many requests. Please wait a moment and try again.";
    } else {
        errorMessage = error.message || "An unexpected error occurred while connecting to Google Gemini.";
    }

    throw new Error(errorMessage);
  }
};

const parseLeadsFromText = (text: string): Lead[] => {
  const leads: Lead[] = [];
  const blocks = text.split("### LEAD");

  blocks.forEach((block, index) => {
    if (!block.trim()) return;

    const nameMatch = block.match(/Name:\s*(.+)/);
    const urlMatch = block.match(/URL:\s*(.+)/);
    const ratingMatch = block.match(/Rating:\s*(.+)/);
    const issueMatch = block.match(/Issue:\s*(.+)/);
    const actionMatch = block.match(/Action:\s*(.+)/);
    const descMatch = block.match(/Description:\s*(.+)/);

    if (nameMatch) {
      leads.push({
        id: `lead-${index}`,
        name: nameMatch[1].trim(),
        url: urlMatch ? urlMatch[1].trim() : "N/A",
        rating: ratingMatch ? ratingMatch[1].trim() : "N/A",
        issue: issueMatch ? issueMatch[1].trim() : "Unknown Issue",
        action: actionMatch ? actionMatch[1].trim() : "General SEO",
        description: descMatch ? descMatch[1].trim() : "No description available.",
      });
    }
  });

  return leads;
};