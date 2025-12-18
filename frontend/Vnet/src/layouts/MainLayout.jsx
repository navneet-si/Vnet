import { Outlet, useLocation } from 'react-router-dom';
import LeftBar from '../components/LeftBar';
import RightBar from '../components/RightBar';
import NavBar from '../components/NavBar';
import { useState } from 'react';

// Default data so it's never fully empty
const defaultPostData = {
    id: 0, user: "SocialApp", role: "System", location: "Global",
    content: "Welcome to the network.", stats: { views: "-", likes: "-", shares: "-" },
    mediaType: "none"
};

export default function MainLayout() {
    const [showNavbar] = useState(true);
    // 1. STATE LIFTED UP: Track the active post here
    const [activePost, setActivePost] = useState(defaultPostData);
    
    const location = useLocation();
    const isFeed = location.pathname === '/';

    return (
        <div className='relative h-screen w-full bg-[#161616] overflow-hidden text-white'>
            <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <NavBar isVisible={showNavbar}/>
                </div>
            </div>

            <div className='h-full grid w-full grid-cols-[1fr_2fr_1fr]'>
                <div className='bg-[#161616] pt-20 h-full border-r border-white/5 hidden md:block'>
                   <LeftBar />
                </div>
                
                <div className='h-full bg-black border-x border-white/5 relative z-10 overflow-hidden'>
                    <div className={isFeed ? 'h-full' : 'pt-20 h-full overflow-y-auto'}>
                        {/* 2. PASS SETTER DOWN: Allow FeedPage to update the state */}
                        <Outlet context={{ setActivePost }} />
                    </div>
                </div>
                
                <div className='bg-[#161616] pt-20 h-full border-l border-white/5 hidden md:block'>
                   {/* 3. PASS DATA SIDEWAYS: Send the data to RightBar */}
                   <RightBar activePost={activePost} />
                </div>
            </div>
        </div>
    );
}