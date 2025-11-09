import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, Keyword } from '../types';

// Fix: Per Gemini API guidelines, API key must be sourced from process.env.API_KEY
// and the SDK should be initialized directly with it. This also resolves the
// TypeScript error on `import.meta.env`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisResultSchema = {
    type: Type.OBJECT,
    properties: {
        structured_summary: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                authors: { type: Type.ARRAY, items: { type: Type.STRING } },
                year: { type: Type.INTEGER },
                objective: { type: Type.STRING },
                method: { type: Type.STRING },
                key_findings: { type: Type.ARRAY, items: { type: Type.STRING } },
                implications: { type: Type.STRING },
                limitations: { type: Type.STRING },
                quality_check_metrics: {
                    type: Type.OBJECT,
                    properties: {
                        clarity_of_research_question: { type: Type.INTEGER, description: "Rating from 1 to 5" },
                        rigor_of_methodology: { type: Type.INTEGER, description: "Rating from 1 to 5" },
                        evidence_strength: { type: Type.INTEGER, description: "Rating from 1 to 5" },
                        interpretation: { type: Type.STRING, description: "A one-line interpretation of the metrics." }
                    },
                    required: ["clarity_of_research_question", "rigor_of_methodology", "evidence_strength", "interpretation"],
                },
            },
            required: ["title", "authors", "year", "objective", "method", "key_findings", "implications", "limitations", "quality_check_metrics"],
        },
        evaluation_of_findings: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    research_question: { type: Type.STRING },
                    related_findings_or_evidence: { type: Type.STRING },
                    relevance: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                    brief_evaluation: { type: Type.STRING },
                },
                required: ["research_question", "related_findings_or_evidence", "relevance", "brief_evaluation"],
            }
        },
        overall_relevance_summary: { type: Type.STRING },
        extracted_keywords: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    keyword: { type: Type.STRING },
                    importance: { type: Type.INTEGER, description: "Importance rating from 1 to 10" },
                },
                required: ["keyword", "importance"]
            }
        },
    },
    required: ["structured_summary", "evaluation_of_findings", "overall_relevance_summary", "extracted_keywords"],
};

export const analyzeArticle = async (
    articleFilePart: { inlineData: { data: string; mimeType: string } }, 
    researchQuestions: string
): Promise<AnalysisResult> => {
    const prompt = `
        You are an expert academic research assistant. Analyze the following research article (provided as a PDF file) and the user's research questions.
        Extract all necessary text and metadata from the PDF to perform the analysis.
        Provide a complete, structured analysis in JSON format.

        **User's Research Questions:**
        ---
        ${researchQuestions}
        ---

        **Instructions:**
        1.  **Extract Metadata and Summarize:** From the attached PDF, create a structured summary including title, authors, year, objective, method, key findings, implications, and limitations.
        2.  **Quality Check:** Provide quality check metrics (1-5 scale) for research question clarity, methodology rigor, and evidence strength, with a one-line interpretation.
        3.  **Evaluate Against Questions:** For each user research question, provide related findings from the text, a relevance score (High, Medium, or Low), and a brief evaluation (2-3 lines).
        4.  **Synthesize Relevance:** Write a concise "Overall Relevance Summary" paragraph.
        5.  **Extract Keywords:** Identify and extract the 10-15 most important keywords and themes, ranked by importance (1-10).
    `;
    
    const textPart = {
        text: prompt
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [textPart, articleFilePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisResultSchema,
            thinkingConfig: { thinkingBudget: 32768 }
        },
    });
    
    const jsonText = response.text;
    return JSON.parse(jsonText);
};

export const generateWordCloudImage = async (keywords: Keyword[]): Promise<string> => {
    const keywordList = keywords.map(k => `${k.keyword} (importance: ${k.importance})`).join(', ');
    const prompt = `Generate a clean, professional-style word cloud using the following keywords, with larger font for higher frequency or importance: ${keywordList}. Use a white background and a neutral blue-grey color palette. The image should be visually appealing and suitable for a research report.`;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

export const analyzeImageWithPrompt = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType,
        },
    };

    const textPart = {
        text: prompt,
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });

    return response.text;
};