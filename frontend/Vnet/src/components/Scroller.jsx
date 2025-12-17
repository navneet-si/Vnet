import { useState, useEffect, useRef } from 'react';
import NavBar from './NavBar'; // Assuming you have this
import FeedPost from './FeedPost'; // Assuming you have this

// 1. DATA MOVED TO TOP LEVEL SO IT CAN BE SHARED
const posts = [
  {
    id: 1,
    user: "Sarah Jenkins",
    role: "UX Designer",
    location: "San Francisco, CA",
    content: "Testing out the new immersive feed layout! The dark mode really makes the colors pop.",
    stats: { views: "1.2k", likes: 240, shares: 45 },
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    user: "David Ross",
    role: "Motion Artist",
    location: "Austin, TX",
    content: "Big Buck Bunny is a classic for testing video loops. Smooth playback here.",
    stats: { views: "8.5k", likes: 1200, shares: 320 },
    mediaType: "video",
    mediaSrc: "https://www.w3schools.com/html/mov_bbb.mp4" 
  },
  {
    id: 3,
    user: "Alex Chen",
    role: "Photographer",
    location: "Tokyo, Japan",
    content: "Vertical photography test. Even though this image is tall, it fits perfectly.",
    stats: { views: "3.4k", likes: 890, shares: 12 },
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1000&auto=format&fit=crop" 
  }
];

// 2. LEFT BAR COMPONENT (Top-Down Style)
const LeftBar = () => (
  <div className="flex flex-col h-full bg-[#161616] border-r border-white/5 p-6 gap-6">
    <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-lg p-4 text-center shrink-0">
      <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-2xl text-white font-bold mb-3">
        JS
      </div>
      <h3 className="font-bold text-lg text-white">John Smith</h3>
      <p className="text-[#9CA3AF] text-sm mb-4">Full Stack Developer</p>
      <div className="text-left border-t border-[#2f2f31] pt-3 text-sm space-y-2">
        <div className="flex justify-between text-[#9CA3AF]">
          <span>Views</span><span className="text-[#E5E7EB] font-medium">142</span>
        </div>
        <div className="flex justify-between text-[#9CA3AF]">
          <span>Shared</span><span className="text-[#E5E7EB] font-medium">24</span>
        </div>
      </div>
    </div>
    <div className='text-white text-center'>
      <h2 className="font-bold text-gray-400 mb-4 uppercase tracking-wider text-xs">Menu</h2>
      <ul className="space-y-4 text-sm font-medium">
        <li className="text-white cursor-pointer">For you</li>
        <li className="text-gray-500 hover:text-white cursor-pointer transition">Messages</li>
        <li className="text-gray-500 hover:text-white cursor-pointer transition">Post</li>
      </ul>
    </div>
  </div>
);

// 3. RIGHT BAR COMPONENT (Dynamic Content)
const RightBar = ({ activePost }) => {
  if (!activePost) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="h-full bg-[#161616] border-l border-white/5 p-6 text-white">
      <h2 className="font-bold text-gray-400 mb-6 uppercase tracking-wider text-xs">Post Details</h2>
      
      <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-xl p-5 mb-6">
        <h3 className="text-xl font-bold mb-1">{activePost.user}</h3>
        <p className="text-blue-400 text-xs mb-4">{activePost.role}</p>
        
        <div className="flex items-center text-gray-400 text-sm mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {activePost.location}
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-[#2f2f31] pt-4 text-center">
            <div>
                <div className="text-lg font-bold">{activePost.stats.views}</div>
                <div className="text-[10px] text-gray-500 uppercase">Views</div>
            </div>
            <div>
                <div className="text-lg font-bold">{activePost.stats.likes}</div>
                <div className="text-[10px] text-gray-500 uppercase">Likes</div>
            </div>
            <div>
                <div className="text-lg font-bold">{activePost.stats.shares}</div>
                <div className="text-[10px] text-gray-500 uppercase">Shares</div>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-300">About this media</h4>
        <div className="text-xs text-gray-500 bg-[#1C1C1E] p-3 rounded-lg border border-[#2f2f31]">
            ID: <span className="text-gray-300 font-mono">#{activePost.id}</span><br/>
            Type: <span className="text-gray-300 capitalize">{activePost.mediaType}</span><br/>
            Source: <span className="text-gray-300">External</span>
        </div>
      </div>
    </div>
  );
};

// 4. MAIN LAYOUT (COMBINED)
export default function MainLayout() {
    const [activePostId, setActivePostId] = useState(posts[0].id);
    const [showNavbar, setShowNavbar] = useState(true);
    const lastScrollY = useRef(0);
    const observer = useRef(null);

    // Get the full object of the currently active post
    const activePost = posts.find(p => p.id === activePostId);

    // Intersection Observer to detect which post is in view
    useEffect(() => {
        observer.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // When a post enters the viewport (threshold 0.6 means 60% visible)
                    setActivePostId(Number(entry.target.dataset.id));
                }
            });
        }, { threshold: 0.6 });

        // Observe all post elements
        const postElements = document.querySelectorAll('.post-wrapper');
        postElements.forEach((el) => observer.current.observe(el));

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, []);

    const handleScroll = (e) => {
        const currentScrollY = e.target.scrollTop;
        if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
            setShowNavbar(false);
        } else {
            setShowNavbar(true);
        }
        lastScrollY.current = currentScrollY;
    };

    return (
        <div className="grid grid-cols-12 h-screen bg-black overflow-hidden">
            
            {/* COLUMN 1: LEFT BAR (3 cols wide) */}
            <div className="col-span-3 hidden md:block">
                <LeftBar />
            </div>

            {/* COLUMN 2: FEED (6 cols wide) */}
            <div className="col-span-12 md:col-span-6 relative border-x border-white/5 h-full">
                 <NavBar isVisible={showNavbar}/>
                 
                 <div 
                    onScroll={handleScroll} 
                    className='h-full w-full overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
                >
                    {posts.map(post => (
                        // We wrap FeedPost in a div with data-id for the observer
                        <div 
                            key={post.id} 
                            data-id={post.id} 
                            className="post-wrapper min-h-full snap-start snap-always flex items-center"
                        >
                            <FeedPost 
                                user={post.user}
                                content={post.content}
                                mediaType={post.mediaType}
                                mediaSrc={post.mediaSrc}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* COLUMN 3: RIGHT BAR (3 cols wide) */}
            <div className="col-span-3 hidden md:block">
                <RightBar activePost={activePost} />
            </div>

        </div>
    );
}