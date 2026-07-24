import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#F8F9FE]">
      {/* Left Column: Brand Column using Accent Navy variations */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D1236] p-12 text-[#FFFFFF] flex-col justify-between relative">
        <div className="absolute inset-0 bg-linear-to-b from-[#2A367E]/30 to-transparent pointer-events-none" />
        <Link
          href="/"
          className="flex items-center gap-2.5 inline-block z-10"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F4A261] to-[#e28f4f] flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 16L3 12L7 8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 8L21 12L17 16" stroke="#0D1236" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 4L10 20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#FFFFFF]">
            Skill<span className="text-[#F4A261]">Swap</span>
          </span>
        </Link>
        <div className="space-y-4 max-w-md z-10">
          <blockquote className="text-3xl font-medium leading-tight">
            &ldquo;The best way to learn a new skill is to barter your knowledge
            with someone else.&rdquo;
          </blockquote>
          <p className="text-[#E2E8F0] font-light">
            Join a modern collaborative network trading expertise globally with
            zero currency.
          </p>
        </div>
        <div className="text-xs text-[#E2E8F0]/50 z-10">
          Professional Education Hub
        </div>
      </div>

      {/* Right Column: Clean White Form Wrap */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
