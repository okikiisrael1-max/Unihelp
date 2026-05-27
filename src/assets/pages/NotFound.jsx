// src/pages/NotFound.jsx

import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound(dark) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white flex items-center justify-center px-6">
      
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[140px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 blur-[140px] rounded-full"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl text-center">
        
        {/* Logo */}
        <div className="mb-6 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-400/20 bg-white/5 backdrop-blur-md">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-cyan-300 font-semibold tracking-wider">
            UNIHELP
          </span>
        </div>

        {/* 404 Text */}
        <h1 className="text-[120px] md:text-[180px] font-black leading-none bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]">
          404
        </h1>

        {/* Heading */}
        <h2 className="mt-4 text-3xl md:text-5xl font-bold">
          Lost in the Digital Space
        </h2>

        {/* Description */}
        <p className="mt-5 text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
          The page you’re searching for doesn’t exist, was moved,
          or vanished into the UNIHELP universe.
        </p>

        {/* Search Bar */}
        <div className="mt-8 flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl max-w-xl mx-auto shadow-2xl">
          <div className="px-4 text-cyan-400">
            <Search size={20} />
          </div>

          <input
            type="text"
            placeholder="Search UNIHELP..."
            className="flex-1 bg-transparent py-4 text-white placeholder:text-gray-500 outline-none"
          />

          <button className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition font-medium">
            Search
          </button>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          
          <Link
            to="/"
            className="group inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all duration-300 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
          >
            <Home size={20} />
            Back Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-2 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        {/* Footer Text */}
        <p className="mt-12 text-sm text-gray-500">
          © {new Date().getFullYear()} UNIHELP — Smart Student Assistance Platform
        </p>
      </div>
    </div>
  );
}