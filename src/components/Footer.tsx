import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-8 border-t bg-white mt-auto" style={{ borderColor: "#E2E8F0" }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm" style={{ color: "#4A5568" }}>
        <p>&copy; {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:underline">Privacy Policy</Link>
          <Link href="#" className="hover:underline">Terms of Service</Link>
          <Link href="#" className="hover:underline">Contact Support</Link>
        </div>
      </div>
    </footer>
  );
}