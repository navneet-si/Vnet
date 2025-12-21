import { Outlet, useLocation } from 'react-router-dom';
import LeftBar from '../components/LeftBar';
import RightBar from '../components/RightBar';
import NavBar from '../components/NavBar';
import { useState, useRef } from 'react';

const defaultPostData = {
  id: 0, user: "SocialApp", role: "System", location: "Global",
  content: "Welcome to the network.", stats: { views: "-", likes: "-", shares: "-" },
  mediaType: "none"
};

export default function MainLayout() {
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);
  const [activePost, setActivePost] = useState(defaultPostData);
  
  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setShowNavbar(false);
    } else if (currentScrollY < lastScrollY.current) {
      setShowNavbar(true);
    }
    lastScrollY.current = currentScrollY;
  };

  return (
    // 🔴 FIX 1: Use flex-col to manage height properly
    <div className='flex flex-col h-screen w-full bg-[#161616] overflow-hidden text-white'>
      
      {/* NavBar is fixed height (usually 60px) */}
      <div className="flex-none z-50">
        <NavBar isVisible={showNavbar}/>
      </div>

      {/* 🔴 FIX 2: Content area fills remaining space (flex-1) and handles overflow */}
      {/* min-h-0 is crucial for nested scrolling to work in Flexbox */}
      <div className='flex-1 grid w-full grid-cols-[1fr_2fr_1fr] min-h-0 pt-[60px]'>
        
        {/* Left Column - Wrapper needs overflow-hidden so child handles scroll */}
        <div className='bg-gradient-to-b from-[#0a0a0a] to-[#161616] h-full border-r border-white/5 hidden md:block overflow-hidden'>
          <LeftBar />
        </div>

        {/* Middle Column - Wrapper needs overflow-hidden */}
        <div className='h-full bg-black border-x border-white/5 relative z-10 overflow-hidden'>
          <Outlet context={{ setActivePost, handleScroll }} />
        </div>

        {/* Right Column - Wrapper needs overflow-hidden */}
        <div className='bg-gradient-to-b from-[#0a0a0a] to-[#161616] h-full border-l border-white/5 hidden md:block overflow-hidden'>
          <RightBar activePost={activePost} />
        </div>
        
      </div>
    </div>
  );
}