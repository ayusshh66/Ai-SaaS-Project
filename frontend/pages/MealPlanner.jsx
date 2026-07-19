import React, { useState, useEffect } from 'react';
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
            toast.error("failed to load meal plan");
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
        if (!confirm("Are you sure you want to remove the meal?")) return;
        try {
            await api.delete(`/meal-plans/delete/${mealId}`);
            await fetchMealPlan();
            toast.success("Meal plan has been deleted");
        } catch (error) {
            console.error("error in removing meal", error);
            toast.error("failed to remove meal");
        }
    };

    const getDayMeals = (dayIndex) => {
        const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
        return mealPlan[date] || {};
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
                        <p className="text-gray-600 mt-1">Plan your weekly meals</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>
                        <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">This Week</button>
                        <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                        <div className="p-4 font-semibold text-gray-700 border-r">Meal</div>
                        {DAYS_OF_WEEK.map((day, i) => (
                            <div key={day} className="p-4 text-center border-r">{day}<div className="text-xs text-gray-500">{format(addDays(weekStart, i), 'MMM d')}</div></div>
                        ))}
                    </div>
                    {MEAL_TYPES.map(mealType => (
                        <div key={mealType} className="grid grid-cols-8 border-b">
                            <div className="p-4 font-medium capitalize border-r bg-gray-50">{mealType}</div>
                            {DAYS_OF_WEEK.map((_, dayIndex) => {
                                const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
                                const meal = getDayMeals(dayIndex)[mealType];
                                return (
                                    <div key={dayIndex} className="p-3 border-r min-h-[100px] hover:bg-gray-50">
                                        {meal ? (
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 relative group">
                                                <p className="text-sm font-medium text-orange-900">{meal.recipeName}</p>
                                                <button onClick={() => handleRemoveMeal(meal.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-orange-600"><X className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setSelectedSlot({ date, mealType }); setShowAddModal(true); }} className="w-full h-full flex items-center justify-center text-gray-300 hover:text-orange-500"><Plus /></button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {showAddModal && (
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


export default MealPlanner;