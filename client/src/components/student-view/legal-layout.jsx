import { Link, useLocation } from "react-router-dom";
import { MoveLeft, Shield, FileText, Scale, List } from "lucide-react";
import BackgroundDecorations from "@/components/background-decorations";

const LegalLayout = ({ children, title, lastUpdated, content }) => {
  const location = useLocation();

  // Extract sections from markdown content (## Heading)
  const sections = content
    ? content
        .split("\n")
        .filter((line) => line.startsWith("## "))
        .map((line) => {
          const name = line.replace("## ", "").trim();
          const id = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
          return { name, id };
        })
    : [];

  const navItems = [
    { name: "Privacy Policy", path: "/privacy-policy", icon: Shield },
    { name: "Terms of Service", path: "/terms-of-service", icon: FileText },
    { name: "Help Center", path: "/help-center", icon: Scale },
  ];

  return (
    <div className="bg-[#fcf8f1] relative flex flex-col pt-8 pb-12">
      <BackgroundDecorations />
      
      <div className="max-w-6xl mx-auto w-full px-6 py-4 lg:py-6 flex flex-col lg:flex-row gap-12 relative z-10">
        {/* Sticky Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0 flex flex-col gap-8">
          <Link 
            to="/" 
            className="group flex items-center gap-2 text-emerald-900/60 hover:text-emerald-900 font-headline font-bold text-sm transition-colors"
          >
            <MoveLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <nav className="flex flex-col gap-2 p-4 bg-white/40 rounded-3xl border border-emerald-900/5 backdrop-blur-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all font-headline font-medium text-sm ${
                    location.pathname === item.path 
                      ? "bg-emerald-900 text-white shadow-lg shadow-emerald-950/10 scale-[1.02]" 
                      : "text-emerald-700/60 hover:bg-emerald-900/5 hover:text-emerald-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Table of Contents for Current Document */}
          {sections.length > 0 && (
            <div className="flex flex-col gap-4 p-6 bg-emerald-900/5 rounded-3xl border border-emerald-900/10">
              <h4 className="flex items-center gap-2 font-headline font-black text-xs uppercase tracking-widest text-emerald-950">
                <List className="h-3 w-3" />
                On this page
              </h4>
              <ul className="space-y-3">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => {
                        const el = document.getElementById(section.id);
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-left text-xs font-headline font-bold text-emerald-900/60 hover:text-[#ff7e5f] transition-colors leading-snug"
                    >
                      {section.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </aside>

        {/* Main Content Area */}
        <main className="lg:w-[760px] bg-white rounded-[3rem] p-6 lg:p-10 shadow-2xl shadow-emerald-900/5 border border-emerald-900/5 overflow-hidden self-start">
          <header className="mb-4 border-b border-emerald-900/5 pb-6">
            <h1 className="text-3xl lg:text-5xl font-headline font-black bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#ff7e5f] bg-clip-text text-transparent mb-4 tracking-tight py-2">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-emerald-900/40 font-headline font-bold text-xs uppercase tracking-widest">
                Last Updated: {lastUpdated}
              </p>
            )}
          </header>

          <article className="prose prose-emerald lg:prose-xl max-w-none prose-headings:font-headline prose-headings:font-black prose-headings:tracking-tighter prose-p:text-emerald-900/70 prose-p:leading-relaxed prose-li:text-emerald-900/70">
            {children}
          </article>
        </main>
      </div>
    </div>
  );
};

export default LegalLayout;
