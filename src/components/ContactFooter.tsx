"use client";

import { useState, FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';

export function ContactFooter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 mb-16">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl mb-2">
              Let's create<br />
              something great<br />
              together
            </h2>
          </div>

          <div className="flex items-end">
            <form onSubmit={handleSubmit} className="w-full">
              <label className="block text-xs tracking-widest uppercase text-neutral-400 mb-4">
                → Send me an email
              </label>
              <div className="flex items-center border-b border-neutral-700 pb-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 bg-transparent text-white placeholder:text-neutral-600 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="ml-4 hover:text-neutral-400 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-neutral-800 text-xs text-neutral-500">
          <div className="flex items-center gap-8">
            <a href="#" className="text-white hover:text-neutral-400 transition-colors">
              P
            </a>
            <a href="#" className="hover:text-neutral-400 transition-colors">
              Home
            </a>
            <a href="#about" className="hover:text-neutral-400 transition-colors">
              About
            </a>
            <a href="#works" className="hover:text-neutral-400 transition-colors">
              Works
            </a>
          </div>

          <p>© 2025</p>
        </div>
      </div>
    </footer>
  );
}