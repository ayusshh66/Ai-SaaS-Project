import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
    console.error('WARNING: GEMINI_API_KEY is not set. AI features will not work.');
}

//Generates a structured recipe based on user input metrics.
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

const prompt = `Generate a detailed recipe with the following requirements:
    "cuisineType": "${cuisineType}",
    "difficulty": "easy|medium|hard",
    "prepTime": number (in minutes),
    "cookTime": number (in minutes),
    "servings": ${servings},
    "ingredients": [
        {"name": "ingredient name", "quantity": number, "unit": "unit of measurement"}
    ],
    "instructions": [
        "Step 1 description",
        "Step 2 description"
    ],
    "dietaryTags": ["vegetarian", "gluten-free", "etc."],
    "nutrition": {
        "calories": number,
        "protein": number (grams),
        "carbs": number (grams),
        "fats": number (grams),
        "fiber": number (grams)
    },
    "cookingTips": ["Tip 1", "Tip 2"]
    }
    Make sure the recipe is creative, delicious, and uses the provided ingredients effectively.`;

