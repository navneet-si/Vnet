import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from './components/Login'
import Scroller from './components/Scroller'
import NavBar from './components/NavBar'
//import Profile from './components/Dashboard'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <div className="bg-[#0A0A0A] w-screen h-screen text-[#E5E7EB]">
        
        <NavBar isVisible={true} />

        <Routes>
          <Route path="/" element={<Scroller />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Login" element={<Login />} />
        </Routes>

      </div>
    </BrowserRouter>
  )
}

export default App
