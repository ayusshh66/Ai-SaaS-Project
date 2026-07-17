import React from 'react'
import Login from '../pages/Login'
import { AuthProvider } from '../context/AuthContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignUp from '../pages/SignUp'
import Dashboard from '../pages/Dashboard'
import Pantry from '../pages/Pantry'
import RecipeGenerator from '../pages/RecipeGenerator'

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
          <Route path='/recipeGenerate' element = {<RecipeGenerator/>}/>
        </Routes>
    </BrowserRouter>
    </AuthProvider>
    </>
  )
}

export default App