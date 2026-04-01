import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Rocket, User, BookOpen, CreditCard, GraduationCap, Settings, ArrowRight, LifeBuoy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BackgroundDecorations from "@/components/background-decorations";

const iconMap = {
  Rocket,
  User,
  BookOpen,
  CreditCard,
  GraduationCap,
  Settings,
};

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/support/categories`);
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/help-center/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f1] relative flex flex-col pt-20">
      <BackgroundDecorations />
      
      {/* Search Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/5 text-emerald-900 border border-emerald-900/10 mb-8 font-headline font-black text-xs uppercase tracking-widest">
            <LifeBuoy className="h-4 w-4" />
            Support Hub
          </div>
          <h1 className="text-5xl lg:text-7xl font-headline font-black text-emerald-950 mb-6 tracking-tighter leading-tight italic">
            How can we <span className="text-[#ff7e5f]">help you</span> today?
          </h1>
          <p className="text-emerald-900/40 text-lg lg:text-xl font-headline font-bold mb-12 max-w-2xl mx-auto">
            Explore guides, documentation, and troubleshooting tips curated by our expert team.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-emerald-900/20 group-focus-within:text-[#ff7e5f] transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Search for articles, guides..."
              className="w-full h-20 pl-16 pr-8 rounded-[2.5rem] border-emerald-900/10 bg-white shadow-2xl shadow-emerald-900/5 text-lg font-headline font-bold placeholder:text-emerald-900/20 focus-visible:ring-emerald-900 focus-visible:border-emerald-900 transition-all border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit"
              className="absolute right-4 top-4 h-12 bg-emerald-900 hover:bg-emerald-950 text-white rounded-full px-8 font-headline font-black text-sm border-none shadow-xl shadow-emerald-900/20"
            >
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl lg:text-4xl font-headline font-black text-emerald-950 tracking-tighter mb-4">
              Explore by Category
            </h2>
            <p className="text-emerald-900/40 font-headline font-bold text-sm">
              Deep dive into specialized topics to master the SkillNest platform.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 rounded-[3rem] bg-white animate-pulse border border-emerald-900/5 shadow-xl shadow-emerald-900/5" />
            ))
          ) : (
            categories.map((category) => {
              const Icon = iconMap[category.icon] || BookOpen;
              return (
                <Link
                  key={category._id}
                  to={`/help-center/${category.slug}`}
                  className="group bg-white rounded-[3rem] p-10 border border-emerald-900/5 shadow-2xl shadow-emerald-900/5 hover:shadow-emerald-900/10 hover:-translate-y-2 transition-all"
                >
                  <div className="w-16 h-16 rounded-3xl bg-[#fcf8f1] flex items-center justify-center text-emerald-900 mb-8 transition-colors group-hover:bg-emerald-900 group-hover:text-white group-hover:rotate-[15deg]">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-headline font-black text-emerald-950 mb-3 tracking-tight">
                    {category.name}
                  </h3>
                  <p className="text-emerald-900/40 text-sm font-headline font-bold leading-relaxed mb-6">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    View Articles
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="bg-emerald-900 py-24 px-6 mt-20 relative overflow-hidden">
        <BackgroundDecorations />
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="text-center lg:text-left max-w-xl">
            <h2 className="text-4xl lg:text-6xl font-headline font-black text-white tracking-tighter mb-6 italic">
              Got a question? <span className="text-[#ff7e5f]">Ask the Creator.</span>
            </h2>
            <p className="text-emerald-100/60 text-lg font-headline font-bold mb-10">
              Need specific help not found in our guides? Write directly to our support team and get a personal response.
            </p>
            <div className="hidden lg:block space-y-6">
              {[
                { label: "Email Support", value: "creator@skillnest.com" },
                { label: "Average Response", value: "< 24 Hours" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1 border-l-2 border-[#ff7e5f] pl-6 transition-transform hover:translate-x-2">
                  <span className="text-emerald-100/40 text-[10px] font-headline font-black uppercase tracking-widest">{item.label}</span>
                  <span className="text-white text-lg font-headline font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-10 lg:p-14 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-2xl">
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  email: formData.get('email'),
                  message: formData.get('message')
                };

                try {
                  const response = await fetch(`${import.meta.env.VITE_API_URL}/support/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  const result = await response.json();
                  if (result.success) {
                    alert("Message sent successfully! We'll get back to you soon.");
                    e.target.reset();
                  } else {
                    alert(result.message || "Failed to send message.");
                  }
                } catch {
                  alert("Something went wrong. Please try again.");
                }
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-white font-headline font-black text-xs uppercase tracking-widest ml-1">Your Email Address</label>
                <Input 
                  name="email"
                  type="email" 
                  required
                  placeholder="name@example.com"
                  className="h-16 px-6 rounded-2xl border-white/10 bg-white/5 text-white font-headline font-bold placeholder:text-white/20 focus:scale-[1.02] transition-transform border-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-white font-headline font-black text-xs uppercase tracking-widest ml-1">Your Message</label>
                <textarea 
                  name="message"
                  required
                  rows={4}
                  placeholder="How can we help you achieve your goals?"
                  className="w-full p-6 rounded-2xl border-white/10 bg-white/5 text-white font-headline font-bold placeholder:text-white/20 focus:scale-[1.02] transition-transform border-none outline-none resize-none ring-0"
                />
              </div>
              <Button 
                type="submit"
                className="w-full h-16 bg-[#ff7e5f] hover:bg-[#ff6b4a] text-white rounded-2xl font-headline font-black text-sm border-none shadow-xl shadow-orange-900/20 transform hover:scale-[1.02] transition-all"
              >
                Send Message to Creator
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenterPage;
