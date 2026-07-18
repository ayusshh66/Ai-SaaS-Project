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

  return (
    <div>MealPlanner</div>
  )
}

export default MealPlanner