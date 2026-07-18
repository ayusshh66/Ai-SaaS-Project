import React from 'react'
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, ChefHat, ArrowLeft, Trash2, Calendar } from 'lucide-react';
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

        const fetchRecipe = async() =>{

            setLoading(true)
        try {

            const url = `/recipes/info/${id}`
            const response = await api.get(url);
            const recipeData = response.data.data;

            setRecipe(recipeData);
            setServings(recipeData.servings || 4);

            
        } catch (error) {
            console.log("error in fetching info of recipe", error);
            toast.error("Failed to load recipes");
            navigate("/recipes")
        }finally{
            setLoading(false)
        }

        }
        fetchRecipe();

    },[id])

    const handleDelete = async() => {
        if(!confirm("Are you sure you want to delete the recipe")) return ;

        try {

            await api.delete(`/recipes/${id}`);
            toast.success("Recipe has been deleted")
            navigate("/recipes")
            
        } catch (error) {
            console.log("error in deleting recipe", error);
            toast.error("failed to delete recipe")   
        }

    }

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

    if (!recipe) {
        return null;
    }

    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const originalServings = recipe.servings || 4;

  return (
    <div>RecipeDetail</div>
  )
}

export default RecipeDetail