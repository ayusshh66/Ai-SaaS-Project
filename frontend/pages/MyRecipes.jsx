import React from 'react'
import { useState, useEffect } from 'react';
import { Search, Clock, ChefHat, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

function MyRecipes() {
    const cuisines = ['All', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
    const difficulties = ['All', 'easy', 'medium', 'hard'];

    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFilteredRecipes = async() => {
        setLoading(true);

        try {

            let url = "/recipes?";
            if(searchQuery) url += `search=${searchQuery}&`;
            if(selectedCuisine !== "All") url += `cuisine=${selectedCuisine}&`;
            if(selectedDifficulty !== "All") url += `difficulty=${selectedDifficulty}`;

            const response = await api.get(url);

            setRecipes(response.data.data);

            toast.success("Recipes has been fetched")
            
        } catch (error) {
            console.log("error in fetching recipe", error)
            toast.error("Failed in fetching recipes")
        }finally{
            setLoading(false)
        }
    }
    },[searchQuery, recipes, selectedCuisine, selectedDifficulty])

    const handleDelete = (id) => {
        if(!confirm("Are you sure you want to delete the recipe?")) return ;

        try {
            await api.delete(`/recipes/delete/${id}`)
            setRecipes(recipes.filter(recipe => recipe.id !== id));
            toast.success("Recipe has been deleted")
        } catch (error) {
            toast.error("failed to delete recipe")
        }
    }


  return (
    <>

    </>
  )
}

export default MyRecipes