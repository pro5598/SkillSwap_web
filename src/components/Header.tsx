import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-lg transition-transform group-hover:scale-105" style={{ backgroundColor: "#2A367E" }}>
            S
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: "#0D1236" }}>
            Skill<span style={{ color: "#F4A261" }}>Swap</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-4 py-2 text-sm font-semibold rounded-lg transition duration-200 hover:opacity-80" style={{ color: "#0D1236" }}>
            Sign In
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition duration-200 shadow-sm hover:brightness-110" style={{ backgroundColor: "#F4A261" }}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}