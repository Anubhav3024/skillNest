import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/auth-context";
import StudentDashboard from "@/components/student-view/dashboard";
import { Button } from "@/components/ui/button";
import { StudentContext } from "@/context/student-context";
import { fetchStudentViewCourseListService } from "@/services";
import { PlayCircle, CheckCircle2, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackgroundDecorations from "@/components/background-decorations";

const StudentHomePage = () => {
  const { auth } = useContext(AuthContext);
  const { setStudentViewCoursesList } = useContext(StudentContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllCoursesOfStudent = async () => {
      try {
        const response = await fetchStudentViewCourseListService();
        if (response?.success) setStudentViewCoursesList(response?.courseList);
      } catch (error) {
        console.log("Error fetching courses", error);
      }
    };
    fetchAllCoursesOfStudent();
  }, [setStudentViewCoursesList]);

  if (auth?.authenticated) {
    return <StudentDashboard />;
  }

  const categories = [
    { title: "Technical Courses", icon: "terminal", desc: "Master coding, AI, and systems architecture with industry-leading technical curriculum.", color: "bg-slate-50" },
    { title: "Economics Courses", icon: "monitoring", desc: "Dive deep into market dynamics, macro-econometrics, and the future of global fiscal policy.", color: "bg-[#0d694f] text-white", active: true },
    { title: "Designing Courses", icon: "palette", desc: "Unleash your aesthetic vision from UI/UX fundamentals to complex brand identity systems.", color: "bg-blue-50" },
    { title: "Content Writing", icon: "edit", desc: "Master the art of storytelling and technical copy that drives engagement and converts readers.", color: "bg-pink-50" },
  ];

  return (
    <div className="min-h-screen bg-[#fcf8f1] relative overflow-hidden">
      <BackgroundDecorations />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[500px] lg:min-h-[600px]">
          {/* Left Side: Cream */}
          <div className="lg:w-[60%] flex flex-col justify-start px-6 sm:px-10 lg:px-20 xl:px-24 pt-6 sm:pt-8 lg:pt-10 pb-16 relative z-10">
            <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm mb-5 animate-in fade-in slide-in-from-left-4 duration-700">
               <Star className="h-4 w-4 text-[#ff7e5f] fill-current" />
               <span className="text-xs font-headline font-black text-foreground uppercase tracking-widest">30 Days free trial</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-headline font-extrabold text-[#0d694f] leading-[1.1] tracking-tight mb-5 sm:mb-6">
              Build Your Skills <br />
              on the{" "}
              <span className="text-[#ff7e5f] relative inline-block">
                Best
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-[#ff7e5f]/20 -z-10 rounded-full"></span>
              </span>{" "}
              Platform
            </h1>
            
            <p className="max-w-xl text-[#0d694f]/80 font-medium text-sm sm:text-base leading-relaxed mb-8">
              Find unlimited courses that match your niche to hasten the process of developing your skills.
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <Button 
                onClick={() => navigate("/home?tab=browse")}
                className="bg-[#0d694f] hover:bg-[#0b5c45] text-white rounded-xl px-7 sm:px-8 py-4 font-headline font-extrabold text-sm sm:text-base shadow-xl shadow-[#0d694f]/20 transition-all active:scale-95 border-none"
              >
                Get Started
              </Button>
              <button className="flex items-center gap-3 font-headline font-semibold text-xs sm:text-sm text-[#0d694f] hover:text-[#ff7e5f] transition-all group">
                <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#ff7e5f] group-hover:scale-110 transition-transform">
                  <PlayCircle className="h-6 w-6 fill-current" />
                </div>
                Watch demo
              </button>
            </div>
            
            {/* Social Proof */}
            <div className="mt-8 sm:mt-10 flex items-center gap-4 bg-[#0d694f] backdrop-blur-sm p-4 rounded-2xl w-fit border border-[#0d694f]/10 shadow-lg shadow-[#0d694f]/10">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-2 border-[#fcf8f1] bg-muted overflow-hidden">
                     <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
                   </div>
                 ))}
               </div>
               <div>
                  <div className="text-sm font-headline font-black text-white">10.00+ Active</div>
                  <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Student Worldwide</div>
               </div>
            </div>
          </div>
          
          {/* Right Side: Dark Green */}
          <div className="lg:w-[40%] bg-[#0d694f] relative overflow-hidden flex items-center">
            <div className="absolute inset-0 opacity-10">
               <div className="absolute top-1/4 right-1/4 w-64 h-64 border-4 border-white rounded-full"></div>
               <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-white rounded-full"></div>
            </div>
            
            {/* Person Image Overlay */}
            <div className="relative w-full h-full lg:-left-16 xl:-left-20 flex items-center justify-center lg:justify-start pt-8 pb-12 lg:py-0">
               <div className="relative w-[85%] aspect-square max-w-lg">
                  <div className="absolute inset-0 bg-[#ff7e5f] rounded-3xl rotate-6 animate-pulse"></div>
                  <div className="absolute inset-0 bg-white rounded-3xl transition-transform duration-700 hover:rotate-2 overflow-hidden border-8 border-white shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
                      className="w-full h-full object-cover" 
                      alt="Student" 
                    />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section id="categories" className="pt-10 sm:pt-12 pb-20 sm:pb-24 px-6 sm:px-8 lg:px-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-[0.3em] mb-4">
            <span className="w-8 h-px bg-[#ff7e5f]/30"></span>
            Course Categories
            <span className="w-8 h-px bg-[#ff7e5f]/30"></span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-headline font-black text-[#0d694f] tracking-tight mb-4">Explore our Course Categories</h2>
          <p className="text-[#0d694f]/70 font-medium text-sm sm:text-base max-w-xl mx-auto">
            Empowering voices in the classroom and beyond. We offer a variety of distinctive benefits for everyone.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {categories.map((cat, idx) => (
            <div 
              key={idx}
              onClick={() => navigate(`/home?tab=browse&category=${encodeURIComponent(cat.title.toLowerCase().replace(' ', '-'))}`)}
              className={`${cat.color} p-6 sm:p-7 rounded-3xl border border-[#0d694f]/10 hover:border-[#0d694f]/20 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 group cursor-pointer relative overflow-hidden`}
            >
              <div className={`w-12 h-12 rounded-2xl ${cat.active ? 'bg-white/10' : 'bg-white'} flex items-center justify-center mb-6 shadow-sm group-hover:scale-125 transition-transform duration-500`}>
                <span className={`material-symbols-outlined text-[24px] ${cat.active ? 'text-white' : 'text-[#0d694f]'}`}>{cat.icon}</span>
              </div>
              <h3 className="text-lg font-headline font-black mb-3">{cat.title}</h3>
              <p className={`text-sm font-medium leading-relaxed mb-6 ${cat.active ? 'text-white/75' : 'text-[#0d694f]/70'}`}>
                {cat.desc}
              </p>
              <div className={`inline-flex h-2 w-12 rounded-full ${cat.active ? 'bg-white/20' : 'bg-[#0d694f]/10'}`}></div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about-us" className="pt-10 sm:pt-12 pb-20 sm:pb-24 px-6 sm:px-8 lg:px-24 max-w-7xl mx-auto bg-[#fcf8f1] scroll-mt-20">
        {/* Centered Header */}
        <div className="max-w-4xl mx-auto text-center mb-16 px-4">
          <div className="inline-flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-[0.3em] mb-4">
            <span className="w-8 h-px bg-[#ff7e5f]/30"></span>
            About Us
            <span className="w-8 h-px bg-[#ff7e5f]/30"></span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold text-[#0d694f] leading-tight tracking-tight mb-6">
            Empowering the Next Generation <br className="hidden md:block" /> 
            of Digital Pioneers
          </h2>
          <p className="text-[#0d694f]/70 font-normal text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            SkillNest is a sanctuary for the curious, a forge for the skilled, and a catalyst for professional transformation. We bridge the gap between traditional education and industry mastery by delivering high-fidelity learning experiences crafted by elite educators worldwide.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Illustrations Column (Left) */}
          <div className="lg:w-1/2 relative px-4 lg:px-0 mb-12 lg:mb-0">
             {/* Dual Illustration Staggered Layout */}
             <div className="relative group perspective-1000 max-w-md mx-auto lg:mx-0">
               {/* Bottom Image (Screenshot 002303) */}
               <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-transparent rotate-[-6deg] group-hover:rotate-0 transition-all duration-700 w-[90%] z-10 p-2">
                 <img 
                   src="/Screenshot 2026-04-01 002303.png" 
                   alt="Learning Illustration" 
                   className="w-full h-auto mix-blend-multiply"
                 />
                 <div className="absolute top-4 left-4 bg-[#0d694f]/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                   Inspire
                 </div>
               </div>

               {/* Top Image (Screenshot 002257) */}
               <div className="absolute -bottom-6 -right-4 md:-bottom-10 md:-right-6 rounded-3xl overflow-hidden shadow-3xl bg-transparent rotate-[6deg] group-hover:rotate-0 transition-all duration-700 w-[85%] z-20 hover:z-30 hover:scale-105">
                 <img 
                   src="/Screenshot 2026-04-01 002257.png" 
                   alt="Collaboration Illustration" 
                   className="w-full h-auto mix-blend-multiply"
                 />
                 <div className="absolute top-4 left-4 bg-[#ff7e5f]/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                   Collaborate
                 </div>
               </div>
             </div>
          </div>
          
          {/* Features Column (Right) */}
          <div className="lg:w-1/2 px-4 shadow-sm bg-white/40 p-8 sm:p-10 rounded-[2.5rem] border border-[#0d694f]/5">
            <h3 className="text-xl font-headline font-black text-[#0d694f] mb-6 tracking-tight">Our Core Advantages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {[
                "Unique Support System",
                "Life Time Support",
                "Get Certificate",
                "Amazing Instructor"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-[#ff7e5f]/10 flex items-center justify-center text-[#ff7e5f]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="font-headline font-semibold text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={() => navigate("/about")}
              className="bg-[#0d694f] hover:bg-[#0b5c45] text-white rounded-xl px-10 py-7 font-headline font-black text-sm transition-all group border-none shadow-xl shadow-[#0d694f]/20 w-full sm:w-auto"
            >
              Learn More
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentHomePage;
