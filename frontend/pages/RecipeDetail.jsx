import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, ChefHat, ArrowLeft, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

function RecipeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [servings, setServings] = useState(4);
    const [checkedIngredients, setCheckedIngredients] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipe = async () => {
            setLoading(true);
            console.log("Fetching recipe with ID:", id); 
            try {
                const url = `/recipes/info/${id}`;
                const response = await api.get(url);
                const recipeData = response.data.data;

                setRecipe(recipeData);
                setServings(recipeData.servings || 4);
            } catch (error) {
                console.log("error in fetching info of recipe", error);
                toast.error("Failed to load recipes");
                navigate("/recipes");
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete the recipe?")) return;
        try {
            await api.delete(`/recipes/delete/${id}`);
            toast.success("Recipe has been deleted");
            navigate("/recipes");
        } catch (error) {
            console.log("error in deleting recipe", error);
            toast.error("failed to delete recipe");
        }
    };

    const toggleIngredient = (index) => {
        const newChecked = new Set(checkedIngredients);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedIngredients(newChecked);
    };

    const adjustQuantity = (originalQty, originalServings) => {
        return ((originalQty * servings) / originalServings).toFixed(2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!recipe) return null;

    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
    const originalServings = recipe.servings || 4;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link to="/recipes" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Recipes
                </Link>

                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
                            {recipe.description && <p className="text-gray-600 text-lg">{recipe.description}</p>}
                        </div>
                        <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">{recipe.cuisine_type}</span>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' : recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {recipe.difficulty}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-6 text-gray-600">
                        <div className="flex items-center gap-2"><Clock className="w-5 h-5" /> <span className="font-medium">{totalTime} minutes</span></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h2>
                            <div className="flex items-center gap-3 mb-6">
                                <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg">-</button>
                                <span className="text-lg font-semibold w-12 text-center">{servings}</span>
                                <button onClick={() => setServings(servings + 1)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg">+</button>
                            </div>
                            <div className="space-y-3">
                                {recipe.ingredients?.map((ing, index) => (
                                    <label key={index} className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" checked={checkedIngredients.has(index)} onChange={() => toggleIngredient(index)} className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                                        <span className={checkedIngredients.has(index) ? 'line-through text-gray-400' : 'text-gray-700'}>
                                            <span className="font-medium">{adjustQuantity(ing.quantity, originalServings)}</span> {ing.unit} {ing.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
                            <ol className="space-y-4">
                                {recipe.instructions?.map((step, index) => (
                                    <li key={index} className="flex gap-4">
                                        <span className="shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">{index + 1}</span>
                                        <p className="text-gray-700 pt-1">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipeDetail;