import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  fetchStudentBoughtCoursesService,
  getUserEnrolledCoursesService,
} from "@/services";
import { TrendingUp, Award, PlayCircle, Search, Star, ChevronRight, Clock } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const StudentCoursesPage = () => {
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } = useContext(StudentContext);
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentBoughtCourses = async () => {
      setLoading(true);
      try {
        let response = await getUserEnrolledCoursesService(auth?.user?._id);
        if (!response?.success) {
          response = await fetchStudentBoughtCoursesService(auth?.user?._id);
        }
        if (response?.success) {
          setStudentBoughtCoursesList(response?.courses);
        }
      } catch (error) {
        console.error("Error fetching courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentBoughtCourses();
  }, [auth?.user?._id, setStudentBoughtCoursesList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f1] flex items-center justify-center">
        <ClipLoader color="#0d694f" size={50} />
      </div>
    );
  }

  const featuredCourse = studentBoughtCoursesList?.[0];

  return (
    <div className="min-h-screen bg-[#fcf8f1] pt-24 pb-20 px-8 lg:px-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-[0.2em]">
             Student Dashboard
             <span className="w-12 h-px bg-[#ff7e5f]/30"></span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-headline font-black text-[#0d694f] tracking-tight">
            Welcome back, {auth?.user?.userName?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground font-medium text-lg">Ready to continue your intellectual sanctuary journey?</p>
        </div>
      </header>

      {/* Bento Grid Dashboard */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
        {/* Featured Active Course */}
        {featuredCourse ? (
          <div className="lg:col-span-8 rounded-[3rem] shadow-2xl shadow-emerald-950/10 relative overflow-hidden group min-h-[450px] border border-[#0d694f]/5 transition-all hover:shadow-emerald-950/20">
            <img 
              alt={featuredCourse.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
              src={featuredCourse.courseImage} 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d694f]/95 via-[#0d694f]/80 to-transparent"></div>
            <div className="relative z-10 flex flex-col h-full justify-between p-12 text-white">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="bg-[#ff7e5f] px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-orange-950/20">Current Focus</span>
                  <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Clock className="h-3 w-3" /> Recently Accessed
                  </span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-headline font-black max-w-lg leading-tight mb-6 drop-shadow-sm">
                  {featuredCourse.title}
                </h2>
                <div className="flex items-center gap-3 mb-10">
                   <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white border border-white/10">
                      {featuredCourse.instructorName?.[0]}
                   </div>
                   <span className="text-sm font-medium text-white/70">Master {featuredCourse.instructorName}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Button 
                  onClick={() => navigate(`/course-progress/${featuredCourse.courseId}`)}
                  className="w-full sm:w-auto bg-white text-[#0d694f] font-headline font-black px-12 py-7 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#fcf8f1] transition-all shadow-xl shadow-black/10 active:scale-[0.98] border-none"
                >
                  Continue Learning
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="text-white/60 text-xs font-bold uppercase tracking-widest hidden sm:block">
                  Next: Module 4 • Advanced Concepts
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white rounded-[3rem] flex flex-col items-center justify-center text-center p-12 border border-dashed border-[#0d694f]/20 min-h-[450px] shadow-sm">
             <div className="w-20 h-20 bg-[#fcf8f1] rounded-full flex items-center justify-center mb-6">
               <PlayCircle className="h-10 w-10 text-[#0d694f]/20" />
             </div>
             <h3 className="text-2xl font-headline font-black text-[#0d694f]">No active courses</h3>
             <Button onClick={() => navigate("/courses")} className="bg-[#0d694f] hover:bg-[#0b5c45] text-white rounded-xl px-8 py-6 mt-6 font-headline font-black shadow-lg shadow-[#0d694f]/20 border-none">Browse the Sanctuary</Button>
          </div>
        )}

        {/* Learning Stats */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-emerald-950/5 border border-[#0d694f]/5 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#0d694f]/5 rounded-full blur-3xl group-hover:bg-[#0d694f]/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-[11px] font-black tracking-widest uppercase text-[#ff7e5f]">Hours Learned</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-6xl font-headline font-black text-[#0d694f] tracking-tighter">18.4</span>
                  <div className="bg-[#ff7e5f]/10 text-[#ff7e5f] px-2.5 py-1 rounded-lg text-[10px] font-black font-headline tracking-widest uppercase shadow-sm">
                    +8%
                  </div>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#fcf8f1] border border-[#0d694f]/5 flex items-center justify-center text-[#0d694f] shadow-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            
            <div className="h-24 flex items-end gap-3 px-1">
              {[30, 45, 65, 90, 55, 40, 75].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-xl transition-all duration-500 ${i === 3 ? 'bg-[#0d694f] shadow-lg shadow-[#0d694f]/20' : 'bg-[#fcf8f1] group-hover:bg-[#0d694f]/20'}`} 
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
          </div>

          <div className="bg-[#0d694f] rounded-[3rem] p-10 flex flex-col justify-between text-white shadow-2xl shadow-emerald-950/10 hover:-translate-y-2 transition-all group cursor-pointer border border-[#0d694f]/5 relative overflow-hidden min-h-[180px]">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Award className="h-24 w-24" />
            </div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#ff7e5f] border border-white/10 group-hover:bg-white group-hover:text-[#ff7e5f] transition-all duration-500">
                <Award className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-headline font-black text-3xl leading-none">2 Awards</h4>
                <p className="text-[10px] text-white/40 font-black tracking-widest uppercase">Verified Achievements</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl px-6 py-4 mt-6 flex justify-between items-center group-hover:bg-white/10 transition-colors">
               <span className="text-xs font-headline font-bold text-white/80">View Certificates</span>
               <ChevronRight className="h-4 w-4 text-white/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Course Library */}
      <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <h3 className="text-3xl font-headline font-black text-[#0d694f] flex items-center gap-4">
              My Course Library
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff7e5f] animate-pulse"></span>
            </h3>
            <p className="text-muted-foreground font-medium">Continue your path to mastery.</p>
          </div>
          <Button 
             variant="outline" 
             onClick={() => navigate("/courses")}
             className="hidden md:flex rounded-2xl font-headline font-black text-xs px-8 py-6 border-[#0d694f]/20 text-[#0d694f] hover:bg-white hover:border-[#0d694f] transition-all bg-white"
          >
            EXPLORE NEW PATHS
          </Button>
        </div>
        
        {studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {studentBoughtCoursesList.map((course) => (
              <div 
                key={course._id}
                onClick={() => navigate(`/course-progress/${course.courseId}`)}
                className="bg-white rounded-[3rem] overflow-hidden border border-[#0d694f]/5 hover:shadow-[0_40px_80px_-20px_rgba(13,105,79,0.1)] hover:-translate-y-3 transition-all duration-700 group cursor-pointer"
              >
                <div className="h-56 overflow-hidden relative">
                  <img alt={course.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src={course.courseImage} />
                  <div className="absolute inset-0 bg-[#0d694f]/10 group-hover:bg-[#0d694f]/0 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-white/95 backdrop-blur-sm text-[#0d694f] rounded-3xl p-5 shadow-2xl scale-75 group-hover:scale-100 transition-transform flex items-center gap-3">
                      <PlayCircle className="h-8 w-8 fill-current text-[#ff7e5f]" />
                      <span className="font-headline font-black text-[10px] uppercase tracking-widest">Enroll Now</span>
                    </div>
                  </div>
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-[#0d694f] tracking-widest uppercase font-headline bg-[#0d694f]/5 px-3 py-1.5 rounded-xl">Course</span>
                    <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-xl">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-[10px] font-black font-headline">4.9</span>
                    </div>
                  </div>
                  <h4 className="font-headline font-black text-xl mb-6 leading-tight group-hover:text-[#ff7e5f] transition-colors line-clamp-2 min-h-[3rem]">
                    {course.title}
                  </h4>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-[#fcf8f1] flex items-center justify-center text-[10px] font-black text-[#0d694f] border border-[#0d694f]/10 uppercase transition-all group-hover:rotate-6">
                      {course.instructorName?.[0]}
                    </div>
                    <span className="text-sm font-headline font-bold text-muted-foreground">{course.instructorName}</span>
                  </div>
                  <Button className="w-full rounded-2xl py-6 bg-[#0d694f] hover:bg-[#ff7e5f] text-white font-headline font-black text-xs transition-all border-none shadow-xl shadow-[#0d694f]/10">
                    RESUME LESSON
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-[#0d694f]/20 shadow-inner">
             <div className="max-w-xs mx-auto">
               <div className="w-24 h-24 bg-[#fcf8f1] rounded-full flex items-center justify-center mx-auto mb-10 border border-[#0d694f]/10 shadow-inner">
                 <Search className="h-10 w-10 text-[#0d694f]/20" />
               </div>
               <h3 className="text-3xl font-headline font-black text-[#0d694f] mb-6 tracking-tight">Vault Empty</h3>
               <p className="text-muted-foreground font-medium mb-10 leading-relaxed">Begin your intellectual journey today by browsing our curated collection.</p>
               <Button onClick={() => navigate("/courses")} className="bg-[#0d694f] hover:bg-[#0b5c45] text-white rounded-2xl px-12 py-7 font-headline font-black shadow-2xl shadow-[#0d694f]/20 border-none">
                 Browse Catalog
               </Button>
             </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentCoursesPage;
