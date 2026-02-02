"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

// Nav link with underline hover effect
function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-mono uppercase text-neutral-800 relative group py-1"
    >
      {children}
      <span className="absolute left-0 bottom-0 w-0 h-px bg-neutral-800 transition-all duration-300 ease-out group-hover:w-full" />
    </Link>
  );
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-mono text-neutral-900 relative group"
        >
          <span className="relative">
            <span className="absolute -inset-2 bg-neutral-900 rounded-sm opacity-0 group-hover:opacity-5 transition-opacity"></span>
            <span className="relative tracking-tight">P.</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="#about">About</NavLink>
          <NavLink href="#works">Works</NavLink>
          <Link
            href="#contact"
            className="text-sm uppercase font-mono bg-neutral-900 text-white px-6 py-2.5 rounded-sm hover:bg-neutral-800 transition-colors"
          >
            Contact us
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-neutral-900 hover:text-neutral-600 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-neutral-200 md:hidden">
            <div className="flex flex-col px-6 py-4 gap-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm text-neutral-800 hover:text-neutral-600 transition-colors py-2"
              >
                Home
              </Link>
              <Link
                href="#about"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm text-neutral-800 hover:text-neutral-600 transition-colors py-2"
              >
                About
              </Link>
              <Link
                href="#works"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm text-neutral-800 hover:text-neutral-600 transition-colors py-2"
              >
                Works
              </Link>
              <Link
                href="#contact"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm bg-neutral-900 text-white px-6 py-2.5 rounded-sm hover:bg-neutral-800 transition-colors text-center"
              >
                Contact us
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
