import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

export default function FeedPost({ user, content, mediaType, mediaSrc }) {
  return (
    // CHANGED: w-full (fits center column), h-full (fills height), snap-center (locks in place)
    <div className="w-full h-full snap-center relative bg-black flex items-center justify-center overflow-hidden border-b border-white/10">
      
      {/* Media Layer */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
        {mediaType === 'video' ? (
          <video 
            src={mediaSrc} 
            className="w-full h-full object-contain max-h-[90%]" 
            controls={false}
            autoPlay 
            muted 
            loop
          />
        ) : (
          <>
            {/* Blurred Background for ambiance */}
            <div 
                className="absolute inset-0 bg-cover bg-center blur-md opacity-20"
                style={{ backgroundImage: `url(${mediaSrc})` }}
            ></div>
            {/* Main Image */}
            <img 
              src={mediaSrc} 
              alt="Post" 
              className="relative w-full h-full object-contain z-10 p-2"
            />
          </>
        )}
      </div>

      {/* Overlay UI (Right Side Actions) */}
      <div className="absolute right-4 bottom-20 flex flex-col gap-4 items-center z-20">
        <button className="flex flex-col items-center gap-1 group">
            <div className="p-3 bg-black/50 backdrop-blur-md rounded-full group-hover:bg-[#1C1C1E] transition border border-white/10">
                <Heart className="text-white" size={24} />
            </div>
            <span className="text-white text-[10px] font-bold">12k</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
            <div className="p-3 bg-black/50 backdrop-blur-md rounded-full group-hover:bg-[#1C1C1E] transition border border-white/10">
                <MessageCircle className="text-white" size={24} />
            </div>
            <span className="text-white text-[10px] font-bold">482</span>
        </button>
      </div>

      {/* Overlay UI (Bottom Info) */}
      <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-black via-black/60 to-transparent pt-20 pb-8 px-6 z-20">
         <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                {user.charAt(0)}
             </div>
             <h3 className="font-bold text-white text-md shadow-black drop-shadow-lg">{user}</h3>
         </div>
         <p className="text-gray-200 text-sm line-clamp-2 drop-shadow-md">
            {content}
         </p>
      </div>

    </div>
  );
}