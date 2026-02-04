"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import { RoughNotation } from "react-rough-notation";
import { RoughHighlight } from "./ui/RoughHighlight";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className="text-sm font-mono uppercase text-neutral-800 relative group py-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RoughNotation
        type="underline"
        show={isHovered}
        color="#171717" // neutral-900
        strokeWidth={1}
        animationDuration={300}
        padding={3}
      >
        {children}
      </RoughNotation>
    </Link>
  );
}

function ContactLink() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="#contact"
      className="text-sm font-mono uppercase px-4 py-2 relative text-neutral-900 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative z-10">CONTACT US</span>

      {/* Custom RoughJS Fill Background */}
      <RoughHighlight
        show={isHovered}
        color="#ea580c"
        fillStyle="zigzag" // Drawing effect
        fillWeight={1}
        hachureGap={3}
        animationDuration={600}
      />

      {/* RoughNotation Box Outline */}
      <div className="absolute inset-0 z-0">
        <RoughNotation
          type="box"
          show={true}
          color={isHovered ? "#ea580c" : "#171717"}
          strokeWidth={1}
          padding={0}
          animationDuration={300}
          iterations={2}
        >
          <span className="block w-full h-full" />
        </RoughNotation>
      </div>
    </Link>
  );
}

function Logo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="/"
      className="text-2xl font-mono text-neutral-900 relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RoughNotation
        type="circle"
        show={isHovered}
        color="#171717"
        strokeWidth={1}
        padding={8}
        animationDuration={300}
      >
        <span className="relative tracking-tight">P.</span>
      </RoughNotation>
    </Link>
  );
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
        <Logo />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="#about">About</NavLink>
          <NavLink href="#works">Works</NavLink>
          <ContactLink />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer"
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
