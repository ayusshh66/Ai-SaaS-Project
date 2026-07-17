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
}