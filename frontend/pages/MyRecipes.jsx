import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ChefHat, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const MyRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [loading, setLoading] = useState(true);

    const cuisines = ['All', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
    const difficulties = ['All', 'easy', 'medium', 'hard'];

    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            try {
                let url = "/recipes?";
                if (searchQuery) url += `search=${searchQuery}&`;
                if (selectedCuisine !== "All") url += `cuisine=${selectedCuisine}&`;
                if (selectedDifficulty !== "All") url += `difficulty=${selectedDifficulty}`;

                const response = await api.get(url);
                setRecipes(response.data.data);
            } catch (error) {
                console.error("Error fetching recipes", error);
                toast.error("Failed to fetch recipes");
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [searchQuery, selectedCuisine, selectedDifficulty]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this recipe?")) return;

        try {
            await api.delete(`/recipes/delete/${id}`);
            setRecipes(recipes.filter(recipe => recipe.id !== id));
            toast.success("Recipe has been deleted");
        } catch (error) {
            toast.error("Failed to delete recipe");
        }
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Recipes</h1>
                    <p className="text-gray-600 mt-1">Your collection of saved recipes</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search recipes..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                            />
                        </div>
                        <select
                            value={selectedCuisine}
                            onChange={(e) => setSelectedCuisine(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        >
                            {cuisines.map(cuisine => (
                                <option key={cuisine} value={cuisine}>{cuisine === 'All' ? 'All Cuisines' : cuisine}</option>
                            ))}
                        </select>
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        >
                            {difficulties.map(diff => (
                                <option key={diff} value={diff}>{diff === 'All' ? 'All Difficulties' : diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {recipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recipes.map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No recipes found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const RecipeCard = ({ recipe, onDelete }) => {
    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
            <div className="h-48 bg-linear-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <ChefHat className="w-16 h-16 text-orange-600" />
            </div>
            <div className="p-5">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">{recipe.name}</h3>
                <div className="flex gap-2 mb-4">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">{recipe.cuisine_type}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> <span>{totalTime} mins</span></div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Link to={`/recipes/${recipe.id}`} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-center py-2 rounded-lg font-medium text-sm">View</Link>
                    <button onClick={() => onDelete(recipe.id)} className="px-3 py-2 border border-gray-300 text-gray-700 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};

export default MyRecipes;