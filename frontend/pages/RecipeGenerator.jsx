import { useState, useEffect } from 'react';
import { ChefHat, Sparkles, Plus, X, Clock, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const CUISINES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const COOKING_TIMES = [
    { value: 'quick', label: 'Quick (<30 min)' },
    { value: 'medium', label: 'Medium (30-60 min)' },
    { value: 'long', label: 'Long (>60 min)' }
];

const RecipeGenerator = () => {

    const [ingredients, setIngredients] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [usePantry, setUsePantry] = useState(false);
    const [cuisineType, setCuisineType] = useState('Any');
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [servings, setServings] = useState(4);
    const [cookingTime, setCookingTime] = useState('medium');
    const [generating, setGenerating] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState(null);
    const [saving, setSaving] = useState(false);
    const [ preferencesLoaded, setPreferencesLoaded] = useState(false)

    useEffect(() => {

        const fetchUserPreferences = async() =>{

            try {

                const response = await api.get("/users/wants");
                const preferences = response.data.data.preferences;

                if(preferences.dietaryRestrictions && preferences.dietaryRestrictions.length>0){
                    setDietaryRestrictions(preferences.dietaryRestrictions);
                }

                if(preferences.preferredCuisines && preferences.preferredCuisines.length>0){
                    setCuisineType(preferences.preferredCuisines);
                }

                if(preferences.defaultServings){
                    setServings(preferences.defaultServings);
                }

                setPreferencesLoaded(true)
                
            } catch (error) {
                toast.error("failed to load user preferences")
                console.log("failed to load user preferences")
                setPreferencesLoaded(true)
            }

        }
        fetchUserPreferences();

    }, [])

    const addIngredient = () => {
        if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
            setIngredients([...ingredients, inputValue.trim()]);
            setInputValue('');
        }
    };

    const removeIngredient = (ingredient) => {
        setIngredients(ingredients.filter(i => i !== ingredient));
    };

    const toggleDietary = (option) => {
        if (dietaryRestrictions.includes(option)) {
            setDietaryRestrictions(dietaryRestrictions.filter(d => d !== option));
        } else {
            setDietaryRestrictions([...dietaryRestrictions, option]);
        }
    };

    const handleGenerate = async() => {

        if(!usePantry && ingredients.length === 0){
            return toast.error("please add atleast one ingredient or pantry item")
        }

        setGenerating(true);
        setGeneratedRecipe(null);

        try {
            
            const response = await api.post("/recipes/create", {
                ingredients,
                usePantryIngredients,
                dietaryRestrictions,
                cuisineType : cuisineType === 'Any' ? 'any' : cuisineType,
                servings,
                cookingTime,
            })

            setGeneratedRecipe(response.data.data);
            toast.success('Recipe generated successfully')

        } catch (error) {
            toast.error("")
        }finally{
            setGenerating(false)
        }

    }

    const handleSavedRecipe = async() => {
        if(!generatedRecipe) return ;

        setSaving(true);
        try {

            api.post('/recipes/recipe', {
                name: generatedRecipe.name,
                description : generatedRecipe.description,
                cuisine_type : generatedRecipe.cuisineType,
                difficulty : generatedRecipe.difficulty,
                prep_time : generatedRecipe.prep_time,
                cook_time: generatedRecipe.cookTime,
                servings: generatedRecipe.servings,
                instructions = generatedRecipe.instructions,
                dietary_tags = generatedRecipe.dietaryTags || [],
                ingredients = generatedRecipe.ingredient,
                nutrition = generatedRecipe.nutrition,
            })

            toast.success("recipe successfully saved to your collection")
            
        } catch (error) {
            toast.error("failed to save recipe")
        }finally{
            setSaving(false)
        }
    }   

    const NutritionBadge = ({ label, value, unit }) => (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-lg font-bold text-gray-900">{value}{unit}</div>
        <div className="text-xs text-gray-600">{label}</div>
    </div>
    );

    return (<>
         <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Recipe Generator</h1>
                    <p className="text-gray-600 mt-2">Let AI create delicious recipes based on your ingredients</p>
        </div>

        <div className="flex items-center gap-3 mb-4 p-3 bg-emerald-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="use-pantry"
                                    checked={usePantry}
                                    onChange={(e) => setUsePantry(e.target.checked)}
                                    className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                                />
                                <label htmlFor="use-pantry" className="text-sm font-medium text-emerald-900">
                                    Use ingredients from my pantry
                                </label>
        </div>


    </>)

}