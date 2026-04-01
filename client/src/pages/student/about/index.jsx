import { Star, Target, Users, Award, BookOpen, Rocket, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import BackgroundDecorations from "@/components/background-decorations";

const AboutPage = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Active Students", value: "10,000+", icon: <Users className="w-5 h-5" /> },
    { label: "Expert Mentors", value: "500+", icon: <Star className="w-5 h-5" /> },
    { label: "Premium Courses", value: "1,200+", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Success Stories", value: "4.8k", icon: <Award className="w-5 h-5" /> },
  ];

  const values = [
    {
      title: "Excellence",
      desc: "We never settle for 'good enough.' We strive for mastery in every piece of content we curate.",
      icon: <Target className="w-8 h-8 text-[#ff7e5f]" />,
      color: "bg-orange-50",
    },
    {
      title: "Community",
      desc: "Learning is a collaborative journey. We foster a sanctuary where curiosity is celebrated.",
      icon: <Users className="w-8 h-8 text-[#0d694f]" />,
      color: "bg-[#0d694f] text-white",
      active: true,
    },
    {
      title: "Innovation",
      desc: "The digital landscape never stands still. Neither do we. We provide the latest tools for modern creators.",
      icon: <Rocket className="w-8 h-8 text-blue-500" />,
      color: "bg-blue-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcf8f1] relative overflow-hidden">
      <BackgroundDecorations />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-6 sm:px-8 lg:px-24 max-w-7xl mx-auto z-10 text-center lg:text-left">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-[0.3em]">
              <span className="w-8 h-px bg-[#ff7e5f]/30"></span>
              Our Vision
              <span className="w-8 h-px bg-[#ff7e5f]/30"></span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-headline font-black text-[#0d694f] leading-[1.05] tracking-tight">
              A Sanitarium of <br />
              <span className="text-[#ff7e5f] relative inline-block">
                Digital
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-[#ff7e5f]/20 -z-10 rounded-full"></span>
              </span>{" "}
              Wisdom
            </h1>
            <p className="text-[#0d694f]/70 font-medium text-lg leading-relaxed max-w-xl">
              SkillNest was born from a simple yet powerful idea: that knowledge should be as accessible as it is transformative. We aren't just an LMS—we are a forge for the next generation of digital pioneers.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
               <Button 
                 onClick={() => navigate("/home?tab=browse")}
                 className="bg-[#0d694f] hover:bg-[#0b5c45] text-white rounded-xl px-10 py-7 font-headline font-black text-lg shadow-2xl shadow-[#0d694f]/20 transition-all border-none"
               >
                 Explore Courses
               </Button>
               <button className="flex items-center gap-3 font-headline font-bold text-base text-[#0d694f] hover:text-[#ff7e5f] transition-all group">
                 <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#ff7e5f] group-hover:scale-110 transition-transform">
                   <PlayCircle className="h-6 w-6 fill-current" />
                 </div>
                 Watch our story
               </button>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
             <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#ff7e5f]/5 rounded-full blur-[100px]"></div>
             <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_64px_rgba(13,105,79,0.12)] border-8 border-white bg-white group rotate-2 hover:rotate-0 transition-all duration-700">
               <img 
                 src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                 alt="SkillNest Team" 
                 className="w-full h-auto"
               />
               <div className="absolute inset-0 bg-primary/10 mix-blend-multiply opacity-0 group-hover:opacity-40 transition-opacity"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-12 bg-white relative z-20 border-y border-[#0d694f]/5">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-2 p-6 hover:bg-[#fcf8f1] rounded-3xl transition-colors group">
                 <div className="w-12 h-12 bg-[#0d694f]/5 rounded-full flex items-center justify-center text-[#0d694f] group-hover:scale-110 transition-transform">
                   {stat.icon}
                 </div>
                 <div className="text-3xl font-headline font-black text-[#0d694f]">{stat.value}</div>
                 <div className="text-xs font-black text-[#0d694f]/50 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
         </div>
      </section>

      {/* Mission & Story Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-24 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-[0.3em] mb-4">
            <span className="w-8 h-px bg-[#ff7e5f]/30"></span>
            Why SkillNest?
            <span className="w-8 h-px bg-[#ff7e5f]/30"></span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-headline font-black text-[#0d694f] tracking-tight">Our Values Define Our Future</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((val, i) => (
            <div key={i} className={`p-10 rounded-[2.5rem] ${val.color} border border-[#0d694f]/5 hover:shadow-2xl hover:scale-[1.03] transition-all duration-500 group relative overflow-hidden`}>
               <div className={`w-16 h-16 rounded-2xl ${val.active ? 'bg-white/10' : 'bg-white'} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                 {val.icon}
               </div>
               <h3 className="text-2xl font-headline font-black mb-4">{val.title}</h3>
               <p className={`font-medium leading-relaxed ${val.active ? 'text-white/80' : 'text-[#0d694f]/70'}`}>
                 {val.desc}
               </p>
               <div className={`absolute bottom-0 right-0 w-32 h-32 opacity-10 -mr-10 -mb-10 transition-transform group-hover:scale-110`}>
                 {val.icon}
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Statement */}
      <section className="pb-24 px-6 sm:px-8 lg:px-24 max-w-5xl mx-auto text-center relative z-10">
         <div className="p-12 sm:p-20 bg-[#0d694f] rounded-[4rem] text-white shadow-3xl shadow-[#0d694f]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-black mb-8 leading-tight">"Education is not the learning of facts, but the training of the mind to think."</h2>
            <div className="flex items-center justify-center gap-4">
               <div className="w-12 h-px bg-white/30"></div>
               <span className="font-headline font-bold text-white/50 tracking-widest uppercase text-sm">Alber Einstein & SkillNest Philosophy</span>
               <div className="w-12 h-px bg-white/30"></div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default AboutPage;
