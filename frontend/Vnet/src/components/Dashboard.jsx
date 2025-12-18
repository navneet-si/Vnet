import React, { useState } from 'react';

// Simple Icon Components (SVG) to keep this copy-pasteable without installing 'lucide-react'
const Icon = ({ path }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

const Icons = {
  Home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  Briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  Bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  Download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  Image: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  File: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
};

const Dashboard = () => {
  // Reusable Post Component
  const Post = ({ name, role, time, content, file, image }) => (
    <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex gap-3 mb-3">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-[#E5E7EB]">{name}</h4>
          <p className="text-sm text-[#9CA3AF]">{role} • {time}</p>
        </div>
      </div>

      {/* Content */}
      <div className="text-[#E5E7EB] mb-4 leading-relaxed">
        {content}
      </div>

      {/* File Attachment (if exists) */}
      {file && (
        <div className="bg-[#0A0A0A] border border-[#2f2f31] rounded-md p-3 flex items-center gap-3 mb-3 hover:border-blue-500 transition-colors cursor-pointer">
          <div className="text-blue-500">
            <Icon path={Icons.File} />
          </div>
          <div className="flex-grow">
            <div className="font-medium text-[#E5E7EB]">{file.name}</div>
            <div className="text-xs text-[#9CA3AF]">{file.type} • {file.size}</div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2">
            <Icon path={Icons.Download} />
            Download
          </button>
        </div>
      )}

      {/* Image Attachment (if exists) */}
      {image && (
        <div className="bg-[#0A0A0A] h-64 rounded-md flex items-center justify-center text-[#9CA3AF] mb-3 border border-[#2f2f31]">
           [Image Placeholder: {image}]
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-3 border-t border-[#2f2f31] text-[#9CA3AF] text-sm font-medium">
        <button className="flex items-center gap-2 hover:bg-[#2C2C2E] px-3 py-2 rounded transition-colors hover:text-[#E5E7EB]">
          👍 Like
        </button>
        <button className="flex items-center gap-2 hover:bg-[#2C2C2E] px-3 py-2 rounded transition-colors hover:text-[#E5E7EB]">
          💬 Comment
        </button>
        <button className="flex items-center gap-2 hover:bg-[#2C2C2E] px-3 py-2 rounded transition-colors hover:text-[#E5E7EB]">
          🔁 Share
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E7EB] font-sans">
      
      {/* Navigation */}
      <nav className="bg-[#1C1C1E] border-b border-[#2f2f31] sticky top-0 z-50 px-6 py-3 flex justify-between items-center">
        <div className="text-blue-500 text-2xl font-bold tracking-tight">ConnectShare</div>
        <input 
          type="text" 
          placeholder="Search resources..." 
          className="bg-[#0A0A0A] border border-[#2f2f31] rounded px-4 py-2 w-80 text-[#E5E7EB] focus:outline-none focus:border-blue-500 transition-colors"
        />
        <div className="flex gap-6 text-[#9CA3AF]">
            <button className="hover:text-white flex flex-col items-center gap-1"><Icon path={Icons.Home} /><span className="text-xs">Home</span></button>
            <button className="hover:text-white flex flex-col items-center gap-1"><Icon path={Icons.Briefcase} /><span className="text-xs">Jobs</span></button>
            <button className="hover:text-white flex flex-col items-center gap-1"><Icon path={Icons.Bell} /><span className="text-xs">Alerts</span></button>
        </div>
      </nav>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Sidebar - Profile */}
        <aside className="hidden md:block">
          <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-lg p-4 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-2xl text-white font-bold mb-3">
              JS
            </div>
            <h3 className="font-bold text-lg">John Smith</h3>
            <p className="text-[#9CA3AF] text-sm mb-4">Full Stack Developer</p>
            <div className="text-left border-t border-[#2f2f31] pt-3 text-sm space-y-2">
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Profile Views</span>
                <span className="text-[#E5E7EB] font-medium">142</span>
              </div>
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Resources Shared</span>
                <span className="text-[#E5E7EB] font-medium">24</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center - Feed */}
        <main className="md:col-span-2">
          
          {/* Create Post Input */}
          <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-lg p-4 mb-6">
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm">JS</div>
              <input 
                type="text" 
                placeholder="Share a resource, code snippet, or update..." 
                className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-full px-5 py-2 text-[#E5E7EB] focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-between px-2">
               <button className="flex items-center gap-2 text-[#9CA3AF] hover:bg-[#2C2C2E] px-3 py-1.5 rounded text-sm"><Icon path={Icons.Image} /> Media</button>
               <button className="flex items-center gap-2 text-[#9CA3AF] hover:bg-[#2C2C2E] px-3 py-1.5 rounded text-sm"><Icon path={Icons.File} /> File</button>
               <button className="flex items-center gap-2 text-[#9CA3AF] hover:bg-[#2C2C2E] px-3 py-1.5 rounded text-sm"><Icon path={Icons.Briefcase} /> Event</button>
            </div>
          </div>

          {/* Feed Posts */}
          <Post 
            name="David Anderson"
            role="Senior Product Designer"
            time="2h ago"
            content="Here is the updated UI Kit for the new mobile dashboard. I've included the dark mode variants we discussed."
            file={{ name: "Dashboard_UI_Kit_v2.fig", type: "Figma File", size: "12.4 MB" }}
          />

          <Post 
            name="Sarah Lee"
            role="Data Scientist"
            time="5h ago"
            content="Just pushed the new Python scripts for data cleaning to the shared repo. It handles the missing values automatically now!"
            image="Python Script Snippet"
          />

        </main>

        {/* Right Sidebar - News */}
        <aside className="hidden md:block">
          <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-lg p-4">
            <h4 className="font-bold mb-4">ConnectShare News</h4>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-sm">Top Resources this week</p>
                <p className="text-xs text-[#9CA3AF]">1,093 readers</p>
              </div>
              <div>
                <p className="font-semibold text-sm">New Security Protocols</p>
                <p className="text-xs text-[#9CA3AF]">845 readers</p>
              </div>
              <div>
                <p className="font-semibold text-sm">Remote Work Tools 2025</p>
                <p className="text-xs text-[#9CA3AF]">2,301 readers</p>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default Dashboard;