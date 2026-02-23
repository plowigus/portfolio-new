"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
// import { RoughNotation } from "react-rough-notation";
// import { RoughHighlight } from "./ui/RoughHighlight";
import { RetroTalkingAvatar } from "./ui/RetroTalkingAvatar";

// function NavLink({ href, children }: { href: string; children: ReactNode }) {
//   const [isHovered, setIsHovered] = useState(false);
//   return (
//     <Link
//       href={href}
//       className="text-sm uppercase font-medium text-neutral-800 relative group py-1 cursor-pointer"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <RoughNotation
//         type="underline"
//         show={isHovered}
//         color="#171717"
//         strokeWidth={1.5}
//         animationDuration={300}
//         padding={4}
//       >
//         {children}
//       </RoughNotation>
//     </Link>
//   );
// }

// function ContactLink() {
//   const [isHovered, setIsHovered] = useState(false);
//   return (
//     <Link
//       href="#contact"
//       className="relative px-6 py-3 group inline-block"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <span className="relative z-20 text-sm font-medium uppercase text-neutral-800">CONTACT US</span>
//       <div className="absolute inset-0 z-0">
//         <RoughHighlight show={isHovered} color="#fb923c" fillStyle="hachure" hachureGap={3} fillWeight={1} animationDuration={1000} roughness={3} bowing={1} />
//       </div>
//       <div className="absolute inset-0 z-10 pointer-events-none">
//         <RoughNotation type="box" show={true} animate={true} color="#171717" strokeWidth={1} padding={0} iterations={6}>
//           <div className="w-full h-full" />
//         </RoughNotation>
//       </div>
//     </Link>
//   );
// }
function Logo() {
  return (
    <Link
      href="/"
      className="block relative hover:opacity-90 transition-opacity"
    >
      <RetroTalkingAvatar message=" HOW U DOIN ? ;)" size={80} className="relative -left-[25px]" />
    </Link>
  );
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const container = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen]);

  useGSAP(() => {
    tl.current = gsap.timeline({ paused: true })
      .to(".avatar-container", {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.2,
        ease: "power2.out"
      })
      .to(".mobile-menu-overlay", {
        clipPath: "circle(150% at 100% 0%)",
        duration: 0.6,
        ease: "power4.inOut",
        display: "flex"
      }, "<")
      .to(".mobile-link", {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: "power3.out",
      }, "-=0.3");
  }, { scope: container });

  useEffect(() => {
    if (isMenuOpen) {
      tl.current?.play();
    } else {
      tl.current?.reverse();
    }
  }, [isMenuOpen]);

  return (
    <header ref={container} className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100/50">
      <nav className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="avatar-container relative z-50">
          <Logo />
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {/* <NavLink href="/">Home</NavLink>
          <NavLink href="#about">About</NavLink>
          <NavLink href="#works">Works</NavLink> */}
          {/* <ContactLink /> */}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`lg:hidden p-2 -mr-2 relative z-50 transition-colors ${isMenuOpen ? "text-white" : "text-neutral-900"}`}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={36} /> : <Menu size={36} />}
        </button>

        {/* Mobile Menu Overlay */}
        <div
          className="mobile-menu-overlay fixed top-0 left-0 w-full h-dvh z-40 bg-neutral-900 text-white flex-col items-center justify-center hidden lg:hidden"
          style={{ clipPath: "circle(0% at 100% 0%)" }}
        >
          <div className="flex flex-col items-center gap-8 text-2xl font-mono font-bold tracking-widest mt-20">
            <Link href="/" className="mobile-link translate-y-10 opacity-0 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>HOME</Link>
            <Link href="#about" className="mobile-link translate-y-10 opacity-0 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>ABOUT</Link>
            <Link href="#works" className="mobile-link translate-y-10 opacity-0 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>WORKS</Link>
            <Link href="#contact" className="mobile-link translate-y-10 opacity-0 text-orange-600 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>CONTACT US</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}