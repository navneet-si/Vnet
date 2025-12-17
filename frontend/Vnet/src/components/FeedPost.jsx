export default function FeedPost({ mediaType, mediaSrc }) {
  return (
    <div className='w-full h-full relative flex items-center justify-center bg-black overflow-hidden'>
        
        {/* LAYER 1: Blurred Background (Fills the screen) */}
        <div className="absolute inset-0 z-0">
             {mediaType === 'image' ? (
                <img src={mediaSrc} alt="" className="w-full h-full object-cover blur-3xl opacity-50 scale-110" />
            ) : (
                <video src={mediaSrc} muted className="w-full h-full object-cover blur-3xl opacity-50 scale-110" />
            )}
        </div>

        {/* LAYER 2: Main Content (No Box, Just Content) */}
        {/* Removed: borders, rounded corners, and padding that created the 'box' look */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
             {mediaType === 'image' ? (
                <img src={mediaSrc} alt="Post content" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
            ) : (
                <video src={mediaSrc} autoPlay loop muted playsInline className="max-w-full max-h-full object-contain drop-shadow-2xl" />
            )}
        </div>
    </div>
  );
}