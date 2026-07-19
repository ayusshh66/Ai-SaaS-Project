import React from 'react'
import Login from '../pages/Login'
import { AuthProvider } from '../context/AuthContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignUp from '../pages/SignUp'
import Dashboard from '../pages/Dashboard'
import Pantry from '../pages/Pantry'
import RecipeGenerator from '../pages/RecipeGenerator'
import { Toaster } from 'react-hot-toast';
import MyRecipes from '../pages/MyRecipes'
import RecipeDetail from '../pages/RecipeDetail'
import MealPlanner from '../pages/MealPlanner'
import ShoppingList from '../pages/ShoppingList'

function App() {
  return (
    <>
    <AuthProvider>
      <BrowserRouter>
        <Routes>  
          <Route path='/login' element={<Login/>}/>
          <Route path='/signup' element={<SignUp/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path='/pantry' element={<Pantry/>}/>
          <Route path='/generate' element = {<RecipeGenerator/>}/>
          <Route path='/recipes' element = {<MyRecipes/>}/>
          <Route path='/recipes/:id' element = {<RecipeDetail/>}/>
          <Route path='/meal-plan' element = {<MealPlanner/>}/>
          <Route path='/shopping-list' element={<ShoppingList/>}/>
        </Routes>
    </BrowserRouter>
    <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
    </>
  )
}

export default App