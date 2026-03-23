import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/auth-context";
import StudentDashboard from "@/components/student-view/dashboard";
import { Button } from "@/components/ui/button";
import { StudentContext } from "@/context/student-context";
import { fetchStudentViewCourseListService } from "@/services";
import { PlayCircle, CheckCircle2, Star, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    { title: "Language", icon: "language", desc: "Master new tongues with our immersive linguistic journeys.", color: "bg-orange-50" },
    { title: "Graphic Design", icon: "palette", desc: "Unleash your creativity with high-fidelity visual arts.", color: "bg-[#0d694f] text-white", active: true },
    { title: "Content Writing", icon: "edit", desc: "Craft compelling narratives that resonate and inspire.", color: "bg-blue-50" },
    { title: "Finance", icon: "payments", desc: "Navigate the complexities of wealth and investment.", color: "bg-pink-50" },
  ];

  return (
    <div className="min-h-screen bg-[#fcf8f1]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[750px]">
          {/* Left Side: Cream */}
          <div className="lg:w-[60%] flex flex-col justify-start px-8 lg:px-24 pt-16 pb-20 relative z-10">
            <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm mb-8 animate-in fade-in slide-in-from-left-4 duration-700">
               <Star className="h-4 w-4 text-[#ff7e5f] fill-current" />
               <span className="text-xs font-headline font-black text-foreground uppercase tracking-widest">30 Days free trial</span>
            </div>
            
            <h1 className="text-5xl lg:text-[5.5rem] font-headline font-black text-[#0d694f] leading-[1.05] tracking-tight mb-8">
              Build Your Skills <br />
              on the <span className="text-[#ff7e5f] relative">Best <div className="absolute -bottom-2 left-0 w-full h-3 bg-[#ff7e5f]/20 -z-10 rounded-full"></div></span> Platform
            </h1>
            
            <p className="max-w-md text-muted-foreground font-medium text-lg leading-relaxed mb-10">
              Find unlimited courses that match your niche to hasten the process of developing your skills.
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <Button 
                onClick={() => navigate("/courses")}
                className="bg-[#0d694f] hover:bg-[#0b5c45] text-white rounded-xl px-10 py-7 font-headline font-black text-lg shadow-xl shadow-[#0d694f]/20 transition-all active:scale-95 border-none"
              >
                Get Started
              </Button>
              <button className="flex items-center gap-3 font-headline font-bold text-[#0d694f] hover:text-[#ff7e5f] transition-all group">
                <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-[#ff7e5f] group-hover:scale-110 transition-transform">
                  <PlayCircle className="h-7 w-7 fill-current" />
                </div>
                Video Play
              </button>
            </div>
            
            {/* Social Proof */}
            <div className="mt-16 flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl w-fit border border-white/50">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-2 border-[#fcf8f1] bg-muted overflow-hidden">
                     <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
                   </div>
                 ))}
               </div>
               <div>
                  <div className="text-sm font-headline font-black text-foreground">10.00+ Active</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student Worldwide</div>
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
            <div className="relative w-full h-full lg:-left-24 flex items-center justify-center lg:justify-start pt-12 lg:pt-0 pb-10 lg:pb-0">
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
      <section className="py-24 px-8 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-[0.3em] mb-4">
            <span className="w-8 h-px bg-[#ff7e5f]/30"></span>
            Course Categories
            <span className="w-8 h-px bg-[#ff7e5f]/30"></span>
          </div>
          <h2 className="text-5xl font-headline font-black text-foreground mb-6">Explore our Course Categories</h2>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto">
            For everyone of you, we offer a variety of distinctive benefits. Empowering voices in the classroom and beyond.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {categories.map((cat, idx) => (
            <div 
              key={idx}
              onClick={() => navigate(`/courses?category=${cat.title.toLowerCase().replace(' ', '-')}`)}
              className={`${cat.color} p-10 rounded-[2.5rem] border border-transparent hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden`}
            >
              <div className={`w-16 h-16 rounded-2xl ${cat.active ? 'bg-white/10' : 'bg-white'} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                <span className={`material-symbols-outlined text-3xl ${cat.active ? 'text-white' : 'text-[#0d694f]'}`}>{cat.icon}</span>
              </div>
              <h3 className="text-2xl font-headline font-black mb-4">{cat.title}</h3>
              <p className={`text-sm font-medium leading-relaxed opacity-70 mb-8`}>
                {cat.desc}
              </p>
              <div className={`inline-flex h-2 w-12 rounded-full ${cat.active ? 'bg-white/20' : 'bg-[#0d694f]/10'}`}></div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-8 lg:px-24 max-w-7xl mx-auto bg-[#fcf8f1]">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 relative">
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#0d694f]/5 rounded-full blur-3xl"></div>
             <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-white">
               <img 
                 src="https://images.unsplash.com/photo-1544717297-fa154daaf02e?q=80&w=2070&auto=format&fit=crop" 
                 alt="Teacher" 
                 className="w-full h-auto"
               />
               <div className="absolute top-10 left-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0d694f] rounded-full flex items-center justify-center text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xl font-headline font-black text-foreground tracking-tight">Best Mentor</div>
                    <div className="text-[10px] font-black text-[#0d694f] uppercase tracking-widest">Industry Experts</div>
                  </div>
               </div>
             </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-[0.3em] mb-4">
              <span className="w-8 h-px bg-[#ff7e5f]/30"></span>
              About Us
              <span className="w-8 h-px bg-[#ff7e5f]/30"></span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-headline font-black text-[#0d694f] leading-tight mb-8">
              Educate The populace <br />
              to advance the nation
            </h2>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed mb-10">
              This can be accomplished by highlighting any awards or recognitions that the company has received, as well as any partnerships or collaborations that it has formed with other industry leaders.
            </p>
            
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
                  <span className="font-headline font-bold text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={() => navigate("/courses")}
              className="bg-[#0d694f] hover:bg-[#0b5c45] text-white rounded-xl px-10 py-7 font-headline font-black transition-all group border-none shadow-xl shadow-[#0d694f]/20"
            >
              Learn More
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Global Footer CTA */}
      <section className="bg-[#0d694f] py-24 px-8 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-white max-w-xl text-center md:text-left">
              <h3 className="text-4xl lg:text-5xl font-headline font-black mb-4">Ready to embark on <br />your learning quest?</h3>
              <p className="text-white/70 font-medium">Join thousands of students who are already mastering new skills every day.</p>
           </div>
           <div className="flex gap-4">
              <Button 
                onClick={() => navigate("/courses")}
                className="bg-[#ff7e5f] hover:bg-[#ff6b4a] text-white rounded-xl px-10 py-7 font-headline font-black shadow-2xl shadow-orange-950/20 border-none"
              >
                Explore Courses
              </Button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default StudentHomePage;
