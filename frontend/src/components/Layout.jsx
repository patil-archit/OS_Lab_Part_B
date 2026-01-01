import React from 'react';
import { NavLink } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative bg-canvas text-ink font-sans selection:bg-ink selection:text-white">
      {/* Floating Header */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <header className="bg-white/80 backdrop-blur-md border border-white/20 shadow-sm rounded-full px-6 py-3 flex items-center gap-8 pointer-events-auto transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-2">
            <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-3 h-3 rounded-full bg-ink"></div>
              <span className="font-bold tracking-tight text-sm">OS Manual</span>
            </NavLink>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium opacity-60">
            <NavLink
              to="/primitives"
              className={({ isActive }) => isActive ? "text-ink opacity-100 font-bold" : "hover:opacity-100 transition-opacity"}
            >
              Primitives
            </NavLink>
            <NavLink
              to="/dangers"
              className={({ isActive }) => isActive ? "text-ink opacity-100 font-bold" : "hover:opacity-100 transition-opacity"}
            >
              Dangers
            </NavLink>
            <NavLink
              to="/scheduling"
              className={({ isActive }) => isActive ? "text-ink opacity-100 font-bold" : "hover:opacity-100 transition-opacity"}
            >
              Scheduling
            </NavLink>
            <NavLink
              to="/problems"
              className={({ isActive }) => isActive ? "text-ink opacity-100 font-bold" : "hover:opacity-100 transition-opacity"}
            >
              Problems
            </NavLink>
          </nav>

          <button className="bg-ink text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-black transition-colors">
            Menu
          </button>
        </header>
      </div>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1400px] mx-auto pt-32 px-4 md:px-8 pb-20">
        {children}
      </main>

      {/* Clean Footer */}
      <footer className="py-12 text-center text-sm opacity-40">
      </footer>
    </div>
  );
};

export default Layout;
