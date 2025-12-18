import { useOutletContext } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import FeedPost from '../components/FeedPost';

const posts = [
  {
    id: 1,
    user: "Sarah Jenkins",
    role: "UX Designer",
    location: "San Francisco, CA",
    content: "Testing out the new immersive feed layout!",
    stats: { views: "1.2k", likes: "1.2k", shares: 45 },
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    user: "David Ross",
    role: "Motion Artist",
    location: "Austin, TX",
    content: "Big Buck Bunny video test.",
    stats: { views: "8.5k", likes: "850", shares: 320 },
    mediaType: "video",
    mediaSrc: "https://www.w3schools.com/html/mov_bbb.mp4" 
  },
  {
    id: 3,
    user: "Alex Chen",
    role: "Photographer",
    location: "Tokyo, Japan",
    content: "Vertical photography test.",
    stats: { views: "3.4k", likes: "3.4k", shares: 12 },
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1000&auto=format&fit=crop" 
  }
];

export default function FeedPage() {
    const { setActivePost } = useOutletContext();
    const observer = useRef(null);

    useEffect(() => {
        setActivePost(posts[0]);

        observer.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = Number(entry.target.dataset.id);
                    const currentPost = posts.find(p => p.id === id);
                    if (currentPost) {
                        setActivePost(currentPost);
                    }
                }
            });
        }, { threshold: 0.6 });

        const postElements = document.querySelectorAll('.post-wrapper');
        postElements.forEach((el) => observer.current.observe(el));

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [setActivePost]);

    return (
        <div className="snap-y snap-mandatory h-full w-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {posts.map(post => (
                <div 
                    key={post.id} 
                    data-id={post.id} 
                    className="post-wrapper h-full w-full snap-start relative border-b border-white/5 bg-black"
                >
                    <FeedPost 
                        mediaType={post.mediaType}
                        mediaSrc={post.mediaSrc}
                    />
                    
                    {/* BOTTOM ACTION BAR (Profile Removed) */}
                    <div className="absolute bottom-6 left-0 w-full z-20 flex items-center justify-center gap-16 px-4 pb-4 bg-linear-to-t from-black/80 to-transparent pt-12">
                        
                        {/* Like Button */}
                        <div className="flex flex-col items-center gap-1 group">
                            <button className="bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all duration-200 active:scale-90 group-hover:border-red-500/50">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white group-hover:text-red-500 transition-colors">
                                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.691 2.25 5.353 4.814 3.25 8.05 3.25c1.1 0 2.485.64 3.95 2.383 1.464-1.743 2.85-2.383 3.95-2.383 3.236 0 5.8 2.103 5.8 5.441 0 3.483-2.438 6.669-4.742 8.82a25.181 25.181 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                </svg>
                            </button>
                            <span className="text-[10px] font-semibold text-white/80">{post.stats.likes}</span>
                        </div>

                        {/* Comment Button */}
                        <div className="flex flex-col items-center gap-1 group">
                            <button className="bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all duration-200 active:scale-90 group-hover:border-blue-500/50">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors">
                                  <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <span className="text-[10px] font-semibold text-white/80">240</span>
                        </div>

                    </div>
                </div>
            ))}
        </div>
    );
}