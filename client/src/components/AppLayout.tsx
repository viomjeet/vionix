import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { RightSidebar } from './RightSidebar.js';
import { MobileNav } from './MobileNav.js';
import { Navbar } from './Navbar.js';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors flex justify-center">
      <div className="w-full flex min-h-screen justify-center">
        {/* Desktop Sidebar (Left) */}
        <div className="hidden md:block shrink-0 w-60 xl:w-68">
          <Sidebar />
        </div>

        {/* Center Main Content Area: exact feed width, no dead gap */}
        <div className="w-full max-w-[640px] xl:max-w-[700px] shrink-0 flex flex-col min-w-0 border-r border-slate-200 dark:border-slate-800/80 pb-16 md:pb-0">
          <Navbar />
          <main className="flex-1 w-full p-4 sm:p-5">
            <Outlet />
          </main>
        </div>

        {/* Desktop Right Sidebar */}
        <div className="hidden lg:block shrink-0 w-80 xl:w-88">
          <RightSidebar />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};
