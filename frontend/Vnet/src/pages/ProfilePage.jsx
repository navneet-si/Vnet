import { Link } from 'react-router-dom';

export default function ProfilePage() {
  return (
    <div className="p-6 text-white min-h-full pb-24">
      
      {/* 1. Header Card */}
      <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-2xl p-8 text-center mb-8 relative overflow-hidden">
        {/* Decorative BG */}
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-blue-900/20 to-transparent"></div>
        
        <div className="relative z-10">
            <div className="w-28 h-28 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-4xl text-white font-bold mb-4 border-4 border-[#161616] shadow-xl">
              JS
            </div>
            <h1 className="text-2xl font-bold">John Smith</h1>
            <p className="text-[#9CA3AF] mb-6">Full Stack Developer • San Francisco</p>
            
            <div className="flex justify-center gap-8 mb-8 border-y border-[#2f2f31] py-4 max-w-md mx-auto">
                <div className="text-center">
                    <span className="block font-bold text-xl">142</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Views</span>
                </div>
                <div className="text-center">
                    <span className="block font-bold text-xl">24</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Posts</span>
                </div>
                <div className="text-center">
                    <span className="block font-bold text-xl">1.2k</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Followers</span>
                </div>
            </div>

            <Link to="/edit-profile" className="inline-block bg-[#2f2f31] hover:bg-white hover:text-black border border-white/10 text-white px-8 py-2.5 rounded-full font-medium transition text-sm">
                Edit Profile
            </Link>
        </div>
      </div>

      {/* 2. User's Content List */}
      <h2 className="font-bold text-gray-400 mb-4 uppercase tracking-wider text-xs">Recent Activity</h2>
      
      {/* Sample Post 1 */}
      <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-xl p-5 mb-4">
        <div className="flex gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">JS</div>
            <div>
                <h4 className="font-semibold text-white">John Smith</h4>
                <p className="text-xs text-gray-500">2h ago</p>
            </div>
        </div>
        <p className="text-gray-300 text-sm mb-3">Here is the updated UI Kit for the new mobile dashboard.</p>
        <div className="bg-[#0A0A0A] border border-[#2f2f31] rounded-lg p-3 flex items-center gap-3">
             <div className="text-blue-500">📄</div>
             <div className="text-sm">
                <div className="font-medium text-gray-200">Dashboard_UI.fig</div>
                <div className="text-xs text-gray-500">12.4 MB</div>
             </div>
        </div>
      </div>

       {/* Sample Post 2 */}
       <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-xl p-5 mb-4">
        <div className="flex gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">JS</div>
            <div>
                <h4 className="font-semibold text-white">John Smith</h4>
                <p className="text-xs text-gray-500">5h ago</p>
            </div>
        </div>
        <p className="text-gray-300 text-sm mb-3">Just pushed the new Python scripts for data cleaning.</p>
        <div className="h-40 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 text-sm border border-white/5">
            [Code Snippet Preview]
        </div>
      </div>

    </div>
  );
}