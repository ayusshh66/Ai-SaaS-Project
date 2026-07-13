import React from 'react'
import Login from '../pages/Login'
import { AuthProvider } from '../context/AuthContext'
import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <>
    <AuthProvider>
      <BrowserRouter>
    <Login/>  
    </BrowserRouter>
    </AuthProvider>
    </>
  )
}

export default App