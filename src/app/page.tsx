import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FE]">
      {/* Reusable Navbar Component */}
      <Navbar />

      {/* 1. Hero Section */}
      <main className="grow">
        <section className="flex items-center justify-center py-20 lg:py-32 px-4 bg-linear-to-b from-[#FFFFFF] to-[#F8F9FE]">
          <div className="max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center bg-[#2A367E] rounded-full px-4 py-1.5 text-xs font-semibold text-[#FFFFFF] shadow-sm">
              Learn & Teach Without Money
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-[#0D1236] leading-tight">
              Master new skills by sharing <br />
              <span className="text-[#2A367E]">what you already know.</span>
            </h1>
            <p className="text-xl text-[#4A5568] max-w-2xl mx-auto leading-relaxed">
              SkillSwap matches you with compatible learning partners globally.
              Exchange coding lessons for languages, design for business, and
              grow together using an authorized zero-currency model.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-[#F4A261] text-[#FFFFFF] font-bold rounded-xl hover:bg-[#e28f4f] transition shadow-md text-center text-lg"
              >
                Create Free Account
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-4 bg-[#FFFFFF] border border-[#E2E8F0] text-[#643000] font-bold rounded-xl hover:bg-[#F8F9FE] transition text-center text-lg"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Platform Statistics Banner */}
        <section className="bg-[#0D1236] text-[#FFFFFF] py-12">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-[#F4A261]">
                15,000+
              </p>
              <p className="text-xs md:text-sm text-[#E2E8F0] uppercase tracking-wider mt-1">
                Active Swappers
              </p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-[#F4A261]">
                450+
              </p>
              <p className="text-xs md:text-sm text-[#E2E8F0] uppercase tracking-wider mt-1">
                Skills Listed
              </p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-[#F4A261]">
                25,000+
              </p>
              <p className="text-xs md:text-sm text-[#E2E8F0] uppercase tracking-wider mt-1">
                Successful Swaps
              </p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-[#F4A261]">
                $0
              </p>
              <p className="text-xs md:text-sm text-[#E2E8F0] uppercase tracking-wider mt-1">
                Total Money Spent
              </p>
            </div>
          </div>
        </section>

        {/* 3. How It Works Section */}
        <section
          id="how-it-works"
          className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#0D1236]">
              How SkillSwap Works
            </h2>
            <p className="text-[#4A5568] mt-2">
              Our algorithmic match engine ensures mutual educational benefits
              in 3 steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-8 rounded-2xl shadow-sm space-y-4">
              <div className="w-12 h-12 bg-[#2A367E] text-[#FFFFFF] rounded-xl flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-[#0D1236]">
                Create Your Profile
              </h3>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Sign up and list the skills you possess (e.g., Python Web Dev)
                alongside the precise skills you want to learn (e.g., UI
                Design).
              </p>
            </div>
            {/* Step 2 */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-8 rounded-2xl shadow-sm space-y-4">
              <div className="w-12 h-12 bg-[#2A367E] text-[#FFFFFF] rounded-xl flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-[#0D1236]">Get Matched</h3>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Our smart system scans compatibility graphs to instantly link
                you with peer learners looking exactly for what you teach.
              </p>
            </div>
            {/* Step 3 */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-8 rounded-2xl shadow-sm space-y-4">
              <div className="w-12 h-12 bg-[#F4A261] text-[#FFFFFF] rounded-xl flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-[#0D1236]">
                Exchange & Learn
              </h3>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Connect via integrated messaging or video calls. Teach your
                partner for an hour, swap roles, and learn your target skill
                completely for free.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Popular Skill Categories */}
        <section
          id="categories"
          className="py-20 bg-[#FFFFFF] border-y border-[#E2E8F0]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-[#0D1236]">
                Trending Exchanges
              </h2>
              <p className="text-[#4A5568] mt-2">
                Explore highly requested knowledge sets available on the
                platform right now.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Software Engineering",
                "Language & Culture",
                "UI/UX Design",
                "Business & Marketing",
                "Photography & Video",
                "Music Production",
                "Data Science",
                "Cooking & Culinary Arts",
              ].map((skill, index) => (
                <div
                  key={index}
                  className="bg-[#F8F9FE] hover:bg-[#2A367E] group hover:text-[#FFFFFF] transition-all p-5 rounded-xl border border-[#E2E8F0] flex flex-col justify-between cursor-pointer"
                >
                  <span className="font-bold text-[#0D1236] group-hover:text-[#FFFFFF] text-sm md:text-base">
                    {skill}
                  </span>
                  <span className="text-xs text-[#4A5568] group-hover:text-[#E2E8F0] mt-4 inline-block font-medium">
                    Explore Offers →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Frequently Asked Questions (FAQ) */}
        <section id="faq" className="py-20 max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0D1236]">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E2E8F0]">
              <h4 className="font-bold text-[#0D1236] mb-2">
                Is SkillSwap truly free?
              </h4>
              <p className="text-sm text-[#4A5568]">
                Yes. SkillSwap is built entirely on a direct knowledge-barter
                ethos. No tokens, no credit cards, and no micro-transactions are
                ever required.
              </p>
            </div>
            <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E2E8F0]">
              <h4 className="font-bold text-[#0D1236] mb-2">
                What if I don&apos;t think I have a teachable skill?
              </h4>
              <p className="text-sm text-[#4A5568]">
                Everyone knows something others want to learn! Teachable skills
                range from native conversational language skills, basic Excel
                workflows, or guitar playing, up to advanced programming.
              </p>
            </div>
            <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E2E8F0]">
              <h4 className="font-bold text-[#0D1236] mb-2">
                How are meetings arranged?
              </h4>
              <p className="text-sm text-[#4A5568]">
                Once matched, you can coordinate schedules via built-in system
                chats and select any remote tool (like Zoom, Google Meet, or
                Discord) to conduct your learning swaps.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Call To Action (CTA) Box */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-[#0D1236] rounded-3xl p-12 text-center text-[#FFFFFF] relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2A367E]/30 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-3xl font-bold mb-4">
              Ready to clear your learning backlog?
            </h3>
            <p className="text-[#E2E8F0] max-w-xl mx-auto mb-8 text-sm md:text-base">
              Join our global peer community today and trade knowledge without
              pulling out your credit card.
            </p>
            <Link
              href="/register"
              className="bg-[#F4A261] hover:bg-[#e28f4f] text-[#FFFFFF] font-bold px-8 py-3.5 rounded-xl transition inline-block shadow-lg"
            >
              Sign Up For Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-[#4A5568]">
          © {new Date().getFullYear()} SkillSwap. Professional Knowledge Barter
          Platform.
        </div>
      </footer>
    </div>
  );
}
