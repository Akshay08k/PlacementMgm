import './App.css'
import SignInPage from './components/Login'

import { BrowserRouter, Route, Routes } from "react-router-dom"
import Homepage from './components/Homepage'
import Navbar from './components/Navbar'
import AuthProvider from './contexts/AuthContent'
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route Component={Homepage} path='/'></Route>
          <Route Component={SignInPage} path='/signin'></Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
