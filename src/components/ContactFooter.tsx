"use client";

import { useState, FormEvent } from 'react';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';

export function ContactFooter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16 text-neutral-900 flex flex-col justify-center min-h-[80vh]">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20">
        <div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-4">
            LET'S RUN<br />
            THE SYSTEM<br />
            TOGETHER.
          </h2>
          <p className="text-neutral-500 font-mono text-sm tracking-widest uppercase">
            STATUS: WAITING FOR USER INPUT...
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="w-full bg-neutral-100 p-8 border-2 border-neutral-900 shadow-[8px_8px_0_0_#000000]">
            <label className="block text-xs font-bold tracking-widest uppercase text-neutral-500 mb-6">
              PING: /VAR/MAIL/PATRYK
            </label>
            <div className="flex items-center border-b-2 border-neutral-900 pb-2 bg-white">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER_YOUR_EMAIL"
                className="flex-1 bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-mono text-sm uppercase p-2"
                required
              />
              <button
                type="submit"
                className="ml-4 hover:bg-neutral-900 hover:text-white border-2 border-transparent hover:border-neutral-900 transition-colors cursor-pointer p-2"
                aria-label="Execute Send"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-8 flex gap-4">
              <a href="https://github.com/plowigus" target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-bold uppercase hover:underline">
                [GITHUB]
              </a>
              <a href="https://linkedin.com/in/patryk-lowigus" target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-bold uppercase hover:underline">
                [LINKEDIN]
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}