"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import { RoughNotation } from "react-rough-notation";
import { RoughHighlight } from "./ui/RoughHighlight";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className="text-sm uppercase font-medium text-neutral-800 relative group py-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RoughNotation
        type="underline"
        show={isHovered}
        color="#171717"
        strokeWidth={1.5}
        animationDuration={300}
        padding={4}
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
      className="relative px-6 py-3  group inline-block "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* TEKST */}
      <span className="relative z-20 text-sm font-medium uppercase text-neutral-800 ">
        CONTACT US
      </span>

      {/* ANIMOWANE WYPEŁNIENIE */}
      <div className="absolute inset-0 z-0">
        <RoughHighlight
          show={isHovered}
          color="#fb923c" // Orange
          fillStyle="hachure" // Zigzag rysuje się super płynnie jako jedna linia
          hachureGap={3}
          fillWeight={1}
          animationDuration={1000}
          roughness={3}
          bowing={1}
        />
      </div>

      {/* RAMKA (Statyczna czy też rysowana? Tutaj wersja statyczna, zawsze widoczna) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <RoughNotation
          type="box"
          show={true}
          animate={true} // Ramka jest od razu, tylko środek się animuje
          color="#171717"
          strokeWidth={1}
          padding={0}
          iterations={6}
        >
          <div className="w-full h-full" />
        </RoughNotation>
      </div>
    </Link>
  );
}
function Logo() {
  return (
    <Link
      href="/"
      className="text-2xl font-bold text-neutral-900 tracking-tighter hover:opacity-70 transition-opacity"
    >
      P.
    </Link>
  );
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100/50">
      <nav className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        <Logo />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="#about">About</NavLink>
          <NavLink href="#works">Works</NavLink>
          <ContactLink />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 -mr-2 text-neutral-900"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 p-6 md:hidden flex flex-col gap-4 shadow-xl">
            <Link href="/" className="text-lg" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="#about" className="text-lg" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link href="#works" className="text-lg" onClick={() => setIsMenuOpen(false)}>Works</Link>
            <Link href="#contact" className="text-lg font-bold text-orange-600" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
          </div>
        )}
      </nav>
    </header>
  );
}