
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { BusinessLead, SearchState, CompetitorReport } from "./types";

export const scoutLeads = async (params: SearchState): Promise<BusinessLead[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Find businesses using Gemini 2.5 Flash with Maps Grounding
  const mapsResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find 5-8 ${params.industry} businesses in ${params.location} with ratings between 3.0 and 4.7. Provide their names, coordinates (lat/long), addresses, and current ratings.`,
    config: {
      tools: [{ googleMaps: {} }],
    }
  });

  // Parse/structure into a valid JSON array
  const structureResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse the following business information into a valid JSON array of objects. 
    Fields needed: name, address, rating, latitude, longitude.
    Input: ${mapsResponse.text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            address: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            latitude: { type: Type.NUMBER },
            longitude: { type: Type.NUMBER },
          },
          required: ["name", "address", "rating", "latitude", "longitude"]
        }
      }
    }
  });

  const structuredData = JSON.parse(structureResponse.text || "[]");

  // 2. For each business, perform deep digital audit
  const leadsWithAnalysis = await Promise.all(
    structuredData.map(async (biz: any): Promise<BusinessLead> => {
      const aiInside = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const analysisResponse = await aiInside.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Research the digital presence of "${biz.name}" at "${biz.address}". 
        Check specifically for: 
        1. AI Chatbot presence.
        2. Online booking availability.
        3. Overall sentiment of recent public reviews.
        4. Generic market gaps and a tactical pitch angle.
        Output JSON.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              marketGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              pitchAngle: { type: Type.STRING },
              website: { type: Type.STRING },
              hasChatbot: { type: Type.BOOLEAN },
              hasOnlineBooking: { type: Type.BOOLEAN },
              sentiment: { type: Type.STRING, description: "positive, neutral, or negative" }
            }
          }
        }
      });

      const analysis = JSON.parse(analysisResponse.text || "{}");

      return {
        id: Math.random().toString(36).substr(2, 9),
        name: biz.name,
        address: biz.address,
        rating: biz.rating,
        latitude: biz.latitude,
        longitude: biz.longitude,
        industry: params.industry,
        marketGaps: analysis.marketGaps || ["No online presence verified"],
        pitchAngle: analysis.pitchAngle || "Focus on digital modernization.",
        website: analysis.website || "",
        hasChatbot: analysis.hasChatbot ?? false,
        hasOnlineBooking: analysis.hasOnlineBooking ?? false,
        sentiment: (analysis.sentiment?.toLowerCase() as any) || 'neutral',
      };
    })
  );

  return leadsWithAnalysis;
};

export const analyzeCompetitor = async (lead: BusinessLead, competitorUrl: string): Promise<CompetitorReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Compare the target business "${lead.name}" (${lead.website || 'No website'}) with the competitor website: ${competitorUrl}.
    Analyze digital marketing issues for the competitor (SEO, speed, mobile, etc.).
    Provide a comparison report.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          competitorUrl: { type: Type.STRING },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } },
          comparisonSummary: { type: Type.STRING },
          advantageLead: { type: Type.STRING, description: "One specific advantage the lead has or could have over this competitor." }
        },
        required: ["competitorUrl", "issues", "comparisonSummary", "advantageLead"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const chatWithGenius = async (history: {role: string, content: string}[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are the LeadGenius AI assistant, part of a high-tech Tactical Command Center. You help users understand market opportunities, explain business gaps, and refine sales strategies for local lead generation.",
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
