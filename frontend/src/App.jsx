import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard';
import Pantry from '../pages/Pantry';
import RecipeGenerator from '../pages/RecipeGenerator';
import MyRecipes from '../pages/MyRecipes';
import RecipeDetail from '../pages/RecipeDetail';
import MealPlanner from '../pages/MealPlanner';
import ShoppingList from '../pages/ShoppingList';
import Settings from '../pages/Settings';
import HomePage from '../pages/HomePage';

// Components
import ProtectedRoute from '../components/ProtectedRoute';

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path='/' element={<HomePage />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<SignUp />} />

            {/* Protected Routes */}
            <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path='/pantry' element={<ProtectedRoute><Pantry /></ProtectedRoute>} />
            <Route path='/generate' element={<ProtectedRoute><RecipeGenerator /></ProtectedRoute>} />
            <Route path='/recipes' element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
            <Route path='/recipes/:id' element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
            <Route path='/meal-plan' element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
            <Route path='/shopping-list' element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />
            <Route path='/settings' element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </>
  );
}

export default App;