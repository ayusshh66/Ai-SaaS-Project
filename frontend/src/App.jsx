import React from 'react'
import Login from '../pages/Login'
import { AuthProvider } from '../context/AuthContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignUp from '../pages/SignUp'

function App() {
  return (
    <>
    <AuthProvider>
      <BrowserRouter>
        <Routes>  
          <Route path='/login' element={<Login/>}/>
          <Route path='/signup' element={<SignUp/>}/>
        </Routes>
    </BrowserRouter>
    </AuthProvider>
    </>
  )
}

export default App