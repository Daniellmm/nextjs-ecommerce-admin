'use client';
import Nav from "@/components/Nav";
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";

export default function Layout({ children }) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Block non-admins
  if (!session || session?.user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center w-full max-w-md">
          <button
            onClick={() => signIn('google')}
            className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors w-full sm:w-auto">
            Login with Google
          </button>
          <p className="mt-4 text-sm text-red-500">
            Only admin accounts can log in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - Hidden on mobile, shown as overlay when menu is open */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        
      `}>
        <Nav onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top bar */}
        <div className="sticky top-0 bg-black/85 backdrop-blur-sm z-30 flex items-center justify-between p-3 text-white">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-md transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* User info */}
          <div className="flex items-center gap-x-3 ml-auto">
            <div className="text-right hidden sm:block">
              <span className="text-sm">Hello, </span>
              <span className="font-semibold">{session?.user?.name}</span>
            </div>
            <img 
              className="h-8 w-8 rounded-full border-2 border-white/20" 
              src={session?.user?.image} 
              alt={`${session?.user?.name}'s profile`}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-white/5 m-3 mt-0 rounded-lg p-3 sm:p-5 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}