import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"

import Login from './components/Login'
import Scroller from './components/Scroller'
import NavBar from './components/NavBar'
import Dashboard from './components/Dashboard'
import Signup from "./components/Signup";

function Layout() {
  const location = useLocation();

  // Hide NavBar on Login page
  const hideNavBar = location.pathname === "/Login";

  return (
    <div className="bg-[#0A0A0A] w-screen h-screen text-[#E5E7EB]">
      
      {!hideNavBar && <NavBar isVisible={true} />}

      <Routes>
        <Route path="/" element={<Scroller />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
      </Routes>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
