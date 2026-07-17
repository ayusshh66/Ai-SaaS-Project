import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
    console.error('WARNING: GEMINI_API_KEY is not set. AI features will not work.');
}


// Generates a structured recipe based on user input metrics and prioritizes expiring ingredients.
export const generateRecipe = async ({ 
    ingredients = [], 
    priorityIngredients = [],
    dietaryRestrictions = [], 
    cuisineType = 'any', 
    servings = 4, 
    cookingTime = 'medium' 
}) => {
    
    const dietaryInfo = dietaryRestrictions.length > 0 
        ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}`
        : 'No dietary restrictions';
    
    const priorityText = priorityIngredients.length > 0
        ? `CRITICAL ZERO-WASTE PRIORITIES: You MUST design the recipe primarily around these expiring or low-stock ingredients: [${priorityIngredients.join(', ')}]. Make these the star of the dish so they don't get wasted.`
        : '';

    const timeGuide = {
        quick: 'under 30 minutes',
        medium: '30-60 minutes',
        long: 'over 60 minutes'
    };

    const targetTime = timeGuide[cookingTime] || '30-60 minutes';

    const prompt = `You are an expert, zero-waste chef AI. Generate a creative, detailed recipe based on the following metrics:
    - Available Ingredients: ${ingredients.join(', ')}
    ${priorityText}
    - ${dietaryInfo}
    - Cuisine Type Target: ${cuisineType}
    - Total Preparation + Cooking Time Target: ${targetTime}
    - Servings: ${servings}

    You must return a valid JSON object matching this exact schema:
    {
        "name": "Recipe Title (Reference if zero-waste ingredients were utilized effectively)",
        "description": "Short catchy description",
        "cuisineType": "${cuisineType}",
        "difficulty": "easy|medium|hard",
        "prepTime": number (in minutes as an integer),
        "cookTime": number (in minutes as an integer),
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
    }`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const recipe = JSON.parse(response.text.trim());
        return recipe;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate recipe. Please try again.');
    }
};

//Suggests quick meal ideas using available and expiring ingredients
export const generatePantrySuggestions = async (pantryItems, expiringItems = []) => {
    const ingredients = pantryItems.map(item => item.name).join(', ');
    const expiringText = expiringItems.length > 0
        ? `\nPriority ingredients (expiring soon): ${expiringItems.join(', ')}`
        : '';

    const prompt = `Based on these available ingredients: ${ingredients}${expiringText}
    Suggest 3 creative recipe ideas that use these ingredients. 
    Each suggestion should be a brief, appetizing description (1-2 sentences).
    
    Return a JSON array of strings matching this exact structure:
    ["Recipe idea 1", "Recipe idea 2", "Recipe idea 3"]`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const suggestions = JSON.parse(response.text.trim());
        return suggestions;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate suggestions');
    }
};

//Generates specific, helpful cooking culinary tips tailored for a recipe
export const generateCookingTips = async (recipe) => {
    const ingredientList = recipe.ingredients?.map(i => i.name).join(', ') || 'N/A';

    const prompt = `For this recipe: "${recipe.name}"
    Ingredients: ${ingredientList}

    Provide 3-5 helpful cooking tips to make this recipe better.
    Return a JSON array of strings matching this exact structure:
    ["Tip 1", "Tip 2", "Tip 3"]`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const tips = JSON.parse(response.text.trim());
        return tips;
    } catch (error) {
        console.error('Gemini API error:', error);
        return ['Cook with love and patience!'];
    }
};

export default {
    generateRecipe,
    generatePantrySuggestions,
    generateCookingTips
};