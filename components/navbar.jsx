"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { 
      name: "Home", 
      path: "/",
      icon: (
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2"
        >
          <path 
            d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <polyline 
            points="9 22 9 12 15 12 15 22" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      )
    },
    { name: "Chatbot", path: "/chats" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          {/* Navigation Pills - Centered */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-full p-1.5 relative">
            {navItems.map((item, index) => {
              const active = isActive(item.path);
              const hovered = hoveredItem === index;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ease-in-out"
                >
                  {/* Active/Hover Background */}
                  {(active || hovered) && (
                    <span
                      className={`absolute inset-0 rounded-full transition-all duration-300 ease-out ${
                        active
                          ? "bg-white dark:bg-gray-700 shadow-md"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                      style={{
                        transform: hovered && !active ? "scale(1.05)" : "scale(1)",
                      }}
                    />
                  )}

                  {/* Text with Icon */}
                  <span
                    className={`relative z-10 flex items-center transition-colors duration-200 ${
                      active
                        ? "text-gray-900 dark:text-white"
                        : hovered
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
