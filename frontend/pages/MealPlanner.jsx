import React from 'react'
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, X, ChefHat } from 'lucide-react';
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
    }, [weekStart])

    const fetchMealPlan = async() => {
        setLoading(true);

        try {

        const response = await api.get(`/meal-plans/weekly?weekStartDate=${selectedStartDate}`);
        
        const meals = response.data.data; 

        const organized = {};
        meals.forEach(meal => {
            const dateKey = meal.mealDate;
            if (!organized[dateKey]) {  
                organized[dateKey] = {};
            }
            organized[dateKey][meal.mealType] = meal;
        });

        setMealPlan(organized);
            
        } catch (error) {
            console.log("error infetching meal plan");
            toast.error("failed to load meal plan")
        }finally{
            setLoading(false)
        }
    }

    const fetchRecipes = async() => {
        try {

            const response = await api.get("/recipes/all-recipe")
            setRecipes(response.data.data)
            
        } catch (error) {
            console.log("error in fetching recipes", error);
        }
    }    

    const handleRemoveMeal = async(mealId) => {
        if(!confirm("Are you sure you want to remove the meal?")) return;

        try {

            await api.delete(`/meal-plan/delete/${mealId}`);
            await fetchMealPlan();
            toast.success("Meal plan has been deleted");

            
        } catch (error) {
            console.log("error in handling remove meal");
            toast.error("failed to remove meal")
        }
    }

    const getDayMeals = (dayIndex) => {
        const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
        return mealPlan[date] || {};
    };

    const handleAddMeal = (date, mealType) => {
        setSelectedSlot({ date, mealType });
        setShowAddModal(true);
    };

  return (
    <>
        return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                //header
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
                        <p className="text-gray-600 mt-1">Plan your weekly meals</p>
                    </div>

                   //week navigatinffg
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setWeekStart(addDays(weekStart, -7))}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Previous Week
                        </button>
                        <button
                            onClick={() => setWeekStart(startOfWeek(new Date()))}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setWeekStart(addDays(weekStart, 7))}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Next Week
                        </button>
                    </div>
                </div>

               //weekly display
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Week of</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
                        </p>
                    </div>
                </div>

            // calneder grid
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                   //header row
                    <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                        <div className="p-4 font-semibold text-gray-700 border-r border-gray-200">
                            Meal
                        </div>
                        {DAYS_OF_WEEK.map((day, index) => (
                            <div key={day} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                                <div className="font-semibold text-gray-900">{day}</div>
                                <div className="text-sm text-gray-500">
                                    {format(addDays(weekStart, index), 'MMM d')}
                                </div>
                            </div>
                        ))}
                    </div>

                        //Meal rows
                    {MEAL_TYPES.map(mealType => (
                        <div key={mealType} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                            <div className="p-4 font-medium text-gray-700 capitalize border-r border-gray-200 bg-gray-50">
                                {mealType}
                            </div>
                            {DAYS_OF_WEEK.map((_, dayIndex) => {
                                const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
                                const dayMeals = getDayMeals(dayIndex);
                                const meal = dayMeals[mealType];

                                return (
                                    <div
                                        key={dayIndex}
                                        className="p-3 border-r border-gray-200 last:border-r-0 min-h-[100px] hover:bg-gray-50 transition-colors"
                                    >
                                        {meal ? (
                                            <div className="relative group">
                                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                                    <p className="text-sm font-medium text-emerald-900 line-clamp-2">
                                                        {meal.recipe_name}
                                                    </p>
                                                    <button
                                                        onClick={() => handleRemoveMeal(meal.id)}
                                                        className="absolute top-1 right-1 p-1 bg-white rounded hover:bg-red-50 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAddMeal(date, mealType)}
                                                className="w-full h-full flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors group"
                                            >
                                                <Plus className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                    //stats
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">Meals Planned</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {Object.values(mealPlan).reduce((acc, day) => acc + Object.keys(day).length, 0)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">Total Recipes</p>
                        <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">This Week</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
                        </p>
                    </div>
                </div>
            </div>

            // meal modal
            {showAddModal && selectedSlot && (
                <AddMealModal
                    date={selectedSlot.date}
                    mealType={selectedSlot.mealType}
                    recipes={recipes}
                    onClose={() => {
                        setShowAddModal(false);
                        setSelectedSlot(null);
                    }}
                    onSuccess={(newMeal) => {
                        // Add to local state
                        const updatedPlan = { ...mealPlan };
                        const date = selectedSlot.date;
                        if (!updatedPlan[date]) {
                            updatedPlan[date] = {};
                        }
                        updatedPlan[date][selectedSlot.mealType] = newMeal;
                        setMealPlan(updatedPlan);
                        setShowAddModal(false);
                        setSelectedSlot(null);
                    }}
                />
            )}
        </div>
    );
    </>
  )

  
}

const AddMealModal = ({ date, mealType, recipes, onClose, onSuccess }) => {
    const [selectedRecipe, setSelectedRecipe] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async(e) => {
        e.preventDefault();
        if(!selectedRecipe){
            toast.error('please select a recipe')
        }

        setLoading(true);

        try {

            const response = await api.post("/meal-plans/create", {
                recipeId : selectedRecipe,
                mealDate : date,
                mealType : mealType,
            })

            toast.success("Meal added  to plan");
            onSuccess();
            
        } catch (error) {
            console.log("error in creating meal plan");
            toast.error("failed to add meal")
        }finally{
            setLoading(false)
        }

    }

}



export default MealPlanner