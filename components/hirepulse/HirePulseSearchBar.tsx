"use client";

import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";

interface HirePulseSearchBarProps {
  initialKeyword?: string;
  initialLocation?: string;
  onSearch: (keyword: string, location: string) => void;
}

export function HirePulseSearchBar({ initialKeyword = "", initialLocation = "", onSearch }: HirePulseSearchBarProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword, location);
  };

  const handleClear = () => {
    setKeyword("");
    setLocation("");
    onSearch("", "");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto rounded-2xl border border-gray-800 bg-black/80 backdrop-blur-md p-2.5 shadow-2xl flex flex-col sm:flex-row items-center gap-2"
    >
      {/* Keyword input */}
      <div className="relative flex-1 w-full flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Job title, keywords, or company (e.g. Engineer, Java, Python)..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-950/70 border border-gray-800 rounded-xl text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all"
        />
        {keyword && (
          <button
            type="button"
            onClick={() => setKeyword("")}
            className="absolute right-3 p-1 text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Location input */}
      <div className="relative w-full sm:w-60 flex items-center">
        <MapPin className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, India, or Remote..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-950/70 border border-gray-800 rounded-xl text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all"
        />
        {location && (
          <button
            type="button"
            onClick={() => setLocation("")}
            className="absolute right-3 p-1 text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-b from-white via-white/95 to-white/60 text-black font-medium text-xs sm:text-sm rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
      >
        Search Jobs
      </button>

      {(keyword || location) && (
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 underline transition-colors cursor-pointer"
        >
          Reset
        </button>
      )}
    </form>
  );
}
