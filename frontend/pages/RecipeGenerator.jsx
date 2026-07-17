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

        <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                                    placeholder="Add ingredient (e.g., tomatoes)"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                                <button
                                    onClick={addIngredient}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
        </div>

        {ingredients.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {ingredients.map((ingredient, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                                        >
                                            {ingredient}
                                            <button
                                                onClick={() => removeIngredient(ingredient)}
                                                className="hover:text-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

        <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
                                <select
                                    value={cuisineType}
                                    onChange={(e) => setCuisineType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                >
                                    {CUISINES.map(cuisine => (
                                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                                    ))}
                                </select>
                            </div>
            
        <div className="flex flex-wrap gap-2">
                                    {DIETARY_OPTIONS.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => toggleDietary(option)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${dietaryRestrictions.includes(option)
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>

                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    value={servings}
                                    onChange={(e) => setServings(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1</span>
                                    <span>12</span>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {COOKING_TIMES.map(time => (
                                        <button
                                            key={time.value}
                                            onClick={() => setCookingTime(time.value)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${cookingTime === time.value
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {time.label}
                                        </button>
                                    ))}
                                </div>

                                 <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {generating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating Recipe...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Recipe
                                </>
                            )}
                        </button>

                       <div>
                        {generatedRecipe ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                                {/* Recipe Header */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{generatedRecipe.name}</h2>
                                    <p className="text-gray-600">{generatedRecipe.description}</p>

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                            {generatedRecipe.cuisineType}
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                                            {generatedRecipe.difficulty}
                                        </span>
                                        {generatedRecipe.dietaryTags?.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{generatedRecipe.prepTime + generatedRecipe.cookTime} mins</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>{generatedRecipe.servings} servings</span>
                                        </div>
                                    </div>
                                </div>




    </>)

}