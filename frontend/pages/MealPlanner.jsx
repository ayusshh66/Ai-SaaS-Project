import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, X, ChevronLeft, ChevronRight, Utensils } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { format, startOfWeek, addDays } from 'date-fns';
import api from '../services/api';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function MealPlanner() {
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
    const [mealPlan, setMealPlan] = useState({});
    const [recipes, setRecipes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMealPlan();
        fetchRecipes();
    }, [weekStart]);

    const fetchMealPlan = async () => {
        setLoading(true);
        try {
            const startDate = format(weekStart, 'yyyy-MM-dd');
            const response = await api.get(`/meal-plans/weekly?weekStartDate=${startDate}`);
            
            const meals = response.data.data;
            const organized = {};
            meals.forEach(meal => {
                const dateKey = meal.mealDate;
                if (!organized[dateKey]) organized[dateKey] = {};
                organized[dateKey][meal.mealType] = meal;
            });
            setMealPlan(organized);
        } catch (error) {
            console.error("error in fetching meal plan", error);
            toast.error("Failed to load meal plan");
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipes = async () => {
        try {
            const response = await api.get("/recipes/all-recipe");
            setRecipes(response.data.data);
        } catch (error) {
            console.error("error in fetching recipes", error);
        }
    };

    const handleRemoveMeal = async (mealId) => {
        if (!confirm("Are you sure you want to remove this meal?")) return;
        try {
            
            await api.delete(`/meal-plans/delete/${mealId}`);
            
            await fetchMealPlan();
            toast.success("Meal plan has been deleted");
        } catch (error) {
            console.error("error in removing meal", error);
            toast.error("Failed to remove meal");
        }
    };

    const getDayMeals = (dayIndex) => {
        const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
        return mealPlan[date] || {};
    };

    const weekEnd = addDays(weekStart, 6);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Meal Planner</h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-orange-500" />
                            <span>{format(weekStart, 'MMM d, yyyy')} - {format(weekEnd, 'MMM d, yyyy')}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
                        <button 
                            onClick={() => setWeekStart(addDays(weekStart, -7))} 
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <button 
                            onClick={() => setWeekStart(startOfWeek(new Date()))} 
                            className="px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-medium text-sm transition-colors"
                        >
                            This Week
                        </button>
                        <button 
                            onClick={() => setWeekStart(addDays(weekStart, 7))} 
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid Container */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="p-4 border-r border-gray-200 flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-orange-500" /> Meal
                        </div>
                        {DAYS_OF_WEEK.map((day, i) => {
                            const currentDayDate = addDays(weekStart, i);
                            const isToday = format(new Date(), 'yyyy-MM-dd') === format(currentDayDate, 'yyyy-MM-dd');
                            return (
                                <div key={day} className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${isToday ? 'bg-orange-50/50 text-orange-600 font-bold' : ''}`}>
                                    <div>{day}</div>
                                    <div className={`text-sm mt-0.5 ${isToday ? 'text-orange-600 bg-orange-100 inline-block px-2 py-0.5 rounded-full' : 'text-gray-400 font-normal'}`}>
                                        {format(currentDayDate, 'MMM d')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {MEAL_TYPES.map(mealType => (
                        <div key={mealType} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                            <div className="p-4 font-semibold text-gray-700 capitalize border-r border-gray-200 bg-gray-50/30 flex items-center">
                                {mealType}
                            </div>
                            {DAYS_OF_WEEK.map((_, dayIndex) => {
                                const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
                                const meal = getDayMeals(dayIndex)[mealType];
                                return (
                                    <div key={dayIndex} className="p-2.5 border-r border-gray-200 last:border-r-0 min-h-[120px] bg-white hover:bg-gray-50/50 transition-colors relative flex flex-col justify-center">
                                        {meal ? (
                                            <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-3 relative group shadow-sm hover:shadow transition-all h-full flex flex-col justify-between">
                                                <p className="text-xs font-semibold text-orange-900 line-clamp-3 leading-snug">{meal.recipeName}</p>
                                                <button 
                                                    onClick={() => handleRemoveMeal(meal.id)} 
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 bg-white/80 p-1 rounded-md shadow-sm transition-all"
                                                    title="Remove meal"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider mt-2">Planned</span>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => { setSelectedSlot({ date, mealType }); setShowAddModal(true); }} 
                                                className="w-full h-full min-h-[90px] border-2 border-dashed border-gray-100 hover:border-orange-300 rounded-xl flex items-center justify-center text-gray-300 hover:text-orange-500 hover:bg-orange-50/30 transition-all group"
                                            >
                                                <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {showAddModal && selectedSlot && (
                <AddMealModal 
                    date={selectedSlot.date} 
                    mealType={selectedSlot.mealType} 
                    recipes={recipes} 
                    onClose={() => setShowAddModal(false)} 
                    onSuccess={() => { fetchMealPlan(); setShowAddModal(false); }} 
                />
            )}
        </div>
    );
}

const AddMealModal = ({ date, mealType, recipes, onClose, onSuccess }) => {
    const [selectedRecipe, setSelectedRecipe] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecipes = recipes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRecipe) return toast.error('Please select a recipe');
        setLoading(true);
        try {
            await api.post("/meal-plans/create", { recipeId: selectedRecipe, mealDate: date, mealType });
            toast.success("Meal added successfully");
            onSuccess();
        } catch (error) {
            toast.error("Failed to add meal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 capitalize">Add {mealType}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <input 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50/50" 
                    placeholder="Search recipes..." 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                        {filteredRecipes.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-6">No recipes found.</p>
                        ) : (
                            filteredRecipes.map(r => (
                                <label key={r.id} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${selectedRecipe == r.id ? 'bg-orange-50/80 border-orange-500 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 mr-3" name="recipe" value={r.id} onChange={(e) => setSelectedRecipe(e.target.value)} />
                                    <span className="text-sm font-medium text-gray-800">{r.name}</span>
                                </label>
                            ))
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-sm shadow-sm shadow-orange-500/30 transition-all disabled:opacity-50">
                            {loading ? 'Adding...' : 'Add Meal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MealPlanner;