export default function FeedPost({ mediaType, mediaSrc }) {
  return (
    <div className='w-full h-full relative flex items-center justify-center bg-black overflow-hidden'>
      {/* LAYER 1: Blurred Background (Fills the screen) */}
      <div className="absolute inset-0 z-0">
        {mediaType === 'image' ? (
          <img 
            src={mediaSrc} 
            alt="" 
            className="w-full h-full object-cover blur-3xl opacity-50 scale-110" 
          />
        ) : (
          <video 
            src={mediaSrc} 
            muted 
            loop
            autoPlay
            playsInline
            className="w-full h-full object-cover blur-3xl opacity-50 scale-110" 
          />
        )}
      </div>

      {/* LAYER 2: Main Content - 80% height, full width with outward shadows */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {/* Top shadow - projects ABOVE the image */}
        <div className="absolute top-[10%] left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-0 pointer-events-none -translate-y-full"></div>
        
        {/* Bottom shadow - projects BELOW the image */}
        <div className="absolute bottom-[10%] left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-0 pointer-events-none translate-y-full"></div>
        
        {/* Media content - elevated above shadows */}
        <div className="relative w-full h-[80%] z-10">
          {mediaType === 'image' ? (
            <img 
              src={mediaSrc} 
              alt="Post content" 
              className="w-full h-full object-cover shadow-[0_-40px_80px_rgba(0,0,0,0.8),0_40px_80px_rgba(0,0,0,0.8)]" 
            />
          ) : (
            <video 
              src={mediaSrc} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover shadow-[0_-40px_80px_rgba(0,0,0,0.8),0_40px_80px_rgba(0,0,0,0.8)]"
            />
          )}
        </div>
      </div>
    </div>
  );
}