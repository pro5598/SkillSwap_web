import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-[#E2E8F0] bg-[#FFFFFF] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-bold text-[#0D1236] tracking-tight">
            Skill<span className="text-[#F4A261]">Swap</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#4A5568]">
          <Link href="#how-it-works" className="hover:text-[#0D1236] transition">How It Works</Link>
          <Link href="#categories" className="hover:text-[#0D1236] transition">Explore Skills</Link>
          <Link href="#faq" className="hover:text-[#0D1236] transition">FAQs</Link>
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#4A5568] hover:text-[#0D1236] transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-[#F4A261] text-[#FFFFFF] px-5 py-2 rounded-lg hover:bg-[#e28f4f] transition shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}