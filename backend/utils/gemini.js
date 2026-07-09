import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
    console.error('WARNING: GEMINI_API_KEY is not set. AI features will not work.');
}

//* Generates a structured recipe based on user input metrics.
export const generateRecipe = async ({ ingredients, dietaryRestrictions = [], cuisineType = 'any', servings = 4, cookingTime = 'medium' }) => {
    const dietaryInfo = dietaryRestrictions.length > 0 
        ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}`
        : 'No dietary restrictions';
    
    const timeGuide = {
        quick: 'under 30 minutes',
        medium: '30-60 minutes',
        long: 'over 60 minutes'
    };
};

