export default function RightBar({ activePost }) {
  // Guard Clause: If data isn't loaded yet
  if (!activePost) {
    return <div className="p-6 text-gray-500">Loading details...</div>;
  }

  // Handle both old and new post structures
  const userName = activePost.userId?.username || activePost.user || "User";
  const userRole = activePost.userId?.role || activePost.role || "Member";
  const postContent = activePost.content || "";
  const location = activePost.location || "";
  const likesCount = activePost.likesCount || activePost.stats?.likes || 0;
  const commentsCount = activePost.commentsCount || activePost.stats?.comments || 0;
  const views = activePost.stats?.views || "0";

  return (
    <div className="h-full px-6 pb-6 overflow-y-auto [&::-webkit-scrollbar]:hidden pt-4">
      
      {/* 1. USER & CAPTION */}
      <div className="mb-8 mt-2">
        <h2 className="font-bold text-gray-400 mb-4 uppercase tracking-wider text-xs">About Post</h2>
        
        <div className="flex items-center gap-3 mb-4 bg-[#1C1C1E] p-3 rounded-xl border border-[#2f2f31]">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
                <h3 className="font-bold text-sm text-white truncate">{userName}</h3>
                <p className="text-blue-400 text-xs truncate">{userRole}</p>
            </div>
        </div>

        <div className="text-gray-300 text-sm leading-relaxed space-y-2">
            <p>{postContent}</p>
            {location && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                     Location: {location}
                </p>
            )}
        </div>
      </div>

      <hr className="border-white/5 mb-8" />

      {/* 2. ANALYTICS */}
      <div className="mb-8 absolute right-12 bottom-0">
        <h2 className="font-bold text-gray-400 mb-4 uppercase tracking-wider flex justify-center text-xs">Analytics</h2>
        <div className="grid grid-cols-3 gap-2 text-center bg-[#1C1C1E] border border-[#2f2f31] rounded-xl p-4">
            <div>
                <div className="text-lg font-bold text-white">{views}</div>
                <div className="text-[10px] text-gray-500 uppercase">Views</div>
            </div>
            <div>
                <div className="text-lg font-bold text-white">{likesCount}</div>
                <div className="text-[10px] text-gray-500 uppercase">Likes</div>
            </div>
            <div>
                <div className="text-lg font-bold text-white">{commentsCount}</div>
                <div className="text-[10px] text-gray-500 uppercase">Comments</div>
            </div>
        </div>
      </div>
    </div>
  );
}