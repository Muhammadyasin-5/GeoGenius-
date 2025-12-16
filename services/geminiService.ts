import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UploadedFile, PredictionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to read file as Base64 (minus the data URL prefix)
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to read text files (CSV/JSON)
const fileToTextPart = async (file: File): Promise<{ text: string }> => {
  const text = await file.text();
  return { text: `File: ${file.name}\nContent:\n${text}` };
};

export const analyzeGeologicalData = async (files: UploadedFile[]): Promise<PredictionResult> => {
  // 1. Prepare Inputs
  const parts: any[] = [];
  
  // Instructions for the model
  parts.push({
    text: `You are GeoGenius, an expert geological AI system specialized in porphyry and epithermal deposit exploration. 
    Analyze the provided multimodal data (satellite imagery, geological maps, geochemical data, geophysical surveys, and field/petrographic imagery).
    
    Your task:
    1. Identify alteration minerals (propylitic, phyllic, argillic, potassic, etc.) from visual data.
    2. **Field & Petrology Analysis**:
       - **Outcrops**: Identify structural controls (faults, folds), vein orientations, and cross-cutting relationships.
       - **Hand Specimens/Ore Blocks**: Analyze rock textures (porphyritic, equigranular, brecciated), identify specific sulfide assemblages (Bornite, Chalcopyrite, Pyrite), and visible alteration halos.
       - **Thin Sections/Photomicrographs**: Identify micro-textures, mineral paragenesis (sequence of crystallization), and alteration replacement textures (e.g., sericite replacing plagioclase cores).
    3. Correlate these with any provided geochemical anomalies, geophysical signatures (mag/gravity/IP), or map structures.
       - **Geophysical Integration**: 
         * **Magnetics**: Look for magnetic highs (indicating Potassic/Magnetite core) or magnetic lows (indicating Phyllic/Magnetite destruction).
         * **Gravity**: Highs may indicate silicification or dense intrusives; lows may indicate extensive clay alteration.
         * **IP/Chargeability**: Highs often map the pyrite halo (Phyllic/Propylitic boundary).
         * For .xyz or .grd files provided as text, analyze the numerical value distribution to identify spatial anomalies.
    4. Determine the potential for Porphyry and Epithermal systems.
    5. Identify specific X/Y coordinate zones (on a scale of 0-100 relative to the image bounds) that are high-priority targets.
    6. For each target area, provide:
       - A probability score (0-1).
       - A concise observation description.
       - DETAILED, EVIDENCE-BASED GEOLOGICAL REASONING.
         * DATA INTEGRATION: You MUST explicitly cite and connect features from multiple data layers. E.g., "The coincidence of [Feature A from Satellite] and [Feature B from Geochem] strongly supports..."
         * DEPOSIT MODEL FIT: Explain *why* these features matter. E.g., "The presence of Alunite/Kaolinite indicates an Advanced Argillic lithocap, suggesting a potential underlying porphyry system."
         * VECTORING LOGIC: Use vectoring concepts. E.g., "Increasing Cu/Zn ratios and intensity of quartz veining suggests proximity to the potassic core."
         * TERMINOLOGY: Use professional economic geology terms (e.g., "telescoping", "phreatomagmatic breccia", "structural permeability", "pathfinder anomaly").
         * Example: "Target is located at the intersection of a NW-trending regional fault and a ring fracture. SWIR data identifies a core of buddingtonite/alunite (Advanced Argillic), which coincides with a >500ppm As/Sb soil anomaly. This signature is typical of the upper lithocap of a porphyry system, indicating high potential for concealed mineralization at depth."
    
    Return the analysis strictly in JSON format.`
  });

  // Process files
  for (const uploadedFile of files) {
    if (uploadedFile.sourceType === 'url' && uploadedFile.url) {
      parts.push({
        text: `Data Source Link: ${uploadedFile.url}\nPlease consider data available at this URL for the analysis.`
      });
      continue;
    }

    if (uploadedFile.sourceType === 'file' && uploadedFile.file) {
      if (uploadedFile.file.type.startsWith('image/') || uploadedFile.file.type === 'application/pdf') {
        const part = await fileToGenerativePart(uploadedFile.file);
        parts.push(part);
      } else {
        // CSV, Text, etc.
        const part = await fileToTextPart(uploadedFile.file);
        parts.push(part);
      }
    }
  }

  // 2. Define Output Schema
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      porphyryPotential: { type: Type.STRING, enum: ["Low", "Medium", "High", "Very High"] },
      epithermalPotential: { type: Type.STRING, enum: ["Low", "Medium", "High", "Very High"] },
      confidenceScore: { type: Type.NUMBER, description: "A value between 0 and 1" },
      alterationMinerals: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of identified minerals e.g., Kaolinite, Alunite" 
      },
      zones: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: "Zone type e.g., Phyllic" },
            area: { type: Type.STRING, description: "Percentage coverage e.g. 35%" },
            color: { type: Type.STRING, description: "Hex code for visualization" }
          }
        }
      },
      targetAreas: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            x: { type: Type.NUMBER, description: "X coordinate 0-100" },
            y: { type: Type.NUMBER, description: "Y coordinate 0-100" },
            probability: { type: Type.NUMBER, description: "0-1" },
            description: { type: Type.STRING },
            reasoning: { 
                type: Type.STRING, 
                description: "Detailed geological justification linking specific observed features (alteration, geochem, structure) to the deposit model." 
            }
          }
        }
      },
      recommendedActions: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      reasoning: { type: Type.STRING, description: "Brief geological summary of findings" }
    },
    required: ["porphyryPotential", "epithermalPotential", "confidenceScore", "targetAreas", "recommendedActions"]
  };

  // 3. Call Gemini
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 1024 } // Enable thinking for complex correlation
      }
    });

    // Check if response text exists; if not, it might be a safety block
    if (!response.text) {
      throw new Error("The AI model returned no content. This is often due to safety filters blocking the response or an internal model error.");
    }

    // Sanitize and Parse
    // Remove potential markdown code blocks if the model ignores responseMimeType
    const cleanJson = response.text.replace(/```json|```/g, '').trim();

    try {
      return JSON.parse(cleanJson) as PredictionResult;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Failed to parse the geological analysis. The model output was not valid JSON.");
    }

  } catch (error: any) {
    console.error("Gemini Analysis Failed:", error);

    // Provide specific user feedback based on error types
    const msg = error.message || error.toString();

    if (msg.includes('401') || msg.includes('API key')) {
      throw new Error("Authentication failed. Please check your API key configuration.");
    }
    
    if (msg.includes('429') || msg.includes('quota')) {
      throw new Error("API quota exceeded. Please try again later or increase your project quota.");
    }

    if (msg.includes('503') || msg.includes('overloaded')) {
      throw new Error("The AI service is currently overloaded. Please wait a moment and try again.");
    }

    if (msg.includes('SAFETY') || msg.includes('blocked')) {
      throw new Error("The request was blocked by safety filters. Please ensure uploaded images do not contain sensitive content.");
    }

    // Pass through the specific error message if we created it, or a generic one
    throw new Error(msg || "An unexpected error occurred during the analysis process.");
  }
};