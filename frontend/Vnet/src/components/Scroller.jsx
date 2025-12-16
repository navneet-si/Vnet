import NavBar from './NavBar'
import FeedPost from './FeedPost';
import { useState, useRef } from 'react';

// DUMMY DATA
const posts = [
  {
    id: 1,
    user: "Sarah Jenkins",
    content: "Testing out the new immersive feed layout! The dark mode really makes the colors pop on this dashboard.",
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    user: "David Ross",
    content: "Big Buck Bunny is a classic for testing video loops.",
    mediaType: "video",
    mediaSrc: "https://www.w3schools.com/html/mov_bbb.mp4" 
  },
  {
    id: 3,
    user: "Alex Chen",
    content: "Vertical photography test. Even though this image is tall, it fits perfectly.",
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1000&auto=format&fit=crop" 
  }
];

export default function Scroller(){
     const [showNavbar, setShowNavbar] = useState(true);
     const lastScrollY = useRef(0);
    
     const handleScroll = (e) => {
        const currentScrollY = e.target.scrollTop;
        if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
          setShowNavbar(false);
        } else {
          setShowNavbar(true);
        }
        lastScrollY.current = currentScrollY;
      };

    return(
        <div className='relative h-screen w-full bg-[#161616] overflow-hidden'>
            
            {/* Navbar Global */}
            <NavBar isVisible={showNavbar}/>

            <div className='h-full grid w-full grid-cols-[1fr_2fr_1fr]'>
                
                {/* LEFT SIDEBAR */}
                <div className='bg-[#161616] pt-24 h-full text-white border-r border-white/5 hidden md:block p-6'>
                    <h2 className="font-bold text-gray-400 mb-4 uppercase text-xs tracking-wider">Menu</h2>
                    <ul className="space-y-4 text-sm font-medium">
                        <li className="text-white cursor-pointer">For You</li>
                        <li className="text-gray-500 hover:text-white cursor-pointer transition">Following</li>
                        <li className="text-gray-500 hover:text-white cursor-pointer transition">Live</li>
                    </ul>
                </div>
                
                {/* CENTER FEED (The Immersive Part) */}
                <div 
                    onScroll={handleScroll} 
                    className='h-full bg-black border-x border-white/5 relative z-10 overflow-y-auto no-scrollbar snap-y snap-mandatory'
                >
                    {/* Note: We removed pt-24 here because in an immersive feed, 
                       the video usually goes BEHIND the navbar. 
                       If you want it to start below, add 'pt-20' here. 
                    */}
                    
                    {posts.map(post => (
                        <FeedPost 
                            key={post.id}
                            user={post.user}
                            content={post.content}
                            mediaType={post.mediaType}
                            mediaSrc={post.mediaSrc}
                        />
                    ))}
                </div>
                
                {/* RIGHT SIDEBAR */}
                <div className='bg-[#161616] pt-24 h-full text-white border-l border-white/5 hidden md:block p-6'>
                    <h2 className="font-bold text-gray-400 mb-4 uppercase text-xs tracking-wider">Suggested</h2>
                    {/* Dummy suggested user */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-purple-600"></div>
                        <div>
                            <p className="text-sm font-bold">DesignDaily</p>
                            <p className="text-xs text-gray-500">New Account</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}