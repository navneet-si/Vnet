// 2. LEFT BAR COMPONENT (Top-Down Style)
const LeftBar = () => (
  <div className="flex flex-col h-full bg-linear-to-b from-[#0a0a0a] to-[#161616] p-6 gap-6 overflow-y-auto">
    <div className="bg-linear-to-br from-[#1a1a1c] to-[#0f0f10] border border-white/10 rounded-2xl p-5 text-center shrink-0 shadow-2xl backdrop-blur-sm">
      <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-3xl text-white font-bold mb-4 shadow-lg ring-4 ring-blue-500/20">
        JS
      </div>
      <h3 className="font-bold text-xl text-white mb-1">John Smith</h3>
      <p className="text-gray-400 text-sm mb-5">Full Stack Developer</p>
      <div className="text-left border-t border-white/10 pt-4 text-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Profile Views</span>
          <span className="text-white font-bold text-lg">142</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Posts Shared</span>
          <span className="text-white font-bold text-lg">24</span>
        </div>
      </div>
    </div>
    
    <div className='text-white'>
      <h2 className="font-bold text-gray-500 mb-5 uppercase tracking-widest text-[10px] px-2">Navigation</h2>
      <ul className="space-y-2">
        <li className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl cursor-pointer font-semibold shadow-lg">
          For You
        </li>
        <li className="text-gray-400 hover:text-white px-4 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 font-medium">
          Messages
        </li>
        <li className="text-gray-400 hover:text-white px-4 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 font-medium">
          Create Post
        </li>
        <li className="text-gray-400 hover:text-white px-4 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 font-medium">
          Notifications
        </li>
        <li className="text-gray-400 hover:text-white px-4 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 font-medium">
          Bookmarks
        </li>
      </ul>
    </div>
    
    <div className="mt-auto bg-linear-to-br from-[#1a1a1c] to-[#0f0f10] border border-white/10 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
        <span className="text-sm text-gray-300 font-medium">Online</span>
      </div>
      <p className="text-xs text-gray-500">Active since 2 hours ago</p>
    </div>
  </div>
);