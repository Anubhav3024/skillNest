import { useContext, useState } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Search as SearchIcon, 
  Activity, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Bell, 
  Search,
  ArrowRight,
  Zap,
  Award,
  Clock,
  Star
} from "lucide-react";
import { AuthContext } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const StudentDashboard = () => {
  const { auth, resetCredentials } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const capitalize = (str) => {
    if (!str) return "";
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const handleLogout = () => {
    toast.success("Logged out successfully", { autoClose: 800 });
    resetCredentials();
    sessionStorage.clear();
    navigate("/auth");
  };

  const sidebarLinks = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "my-courses", label: "My Courses", icon: BookOpen },
    { id: "browse", label: "Browse", icon: SearchIcon },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  const recentActivities = [
    { id: 1, type: "completed", title: "Completed Module 4", sub: "Architectural Lighting Fundamentals", time: "2 hours ago", color: "text-emerald-500" },
    { id: 2, type: "badge", title: "New Badge Earned", sub: "The Night Owl Achievement", time: "Yesterday", color: "text-amber-500" },
  ];

  const courses = [
    { id: 1, title: "Digital Sovereignty: Security in 2024", category: "TECHNOLOGY", progress: 32, rating: 4.8 },
    { id: 2, title: "Mastering Light in Oil Portraits", category: "FINE ARTS", progress: 85, rating: 5.0 },
    { id: 3, title: "Behavioral Analytics Masterclass", category: "PSYCHOLOGY", progress: 15, rating: 4.9 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcf8f1] font-body text-foreground selection:bg-primary/20 smooth-scroll">
      {/* Sidebar */}
      <aside className="w-72 bg-white/70 backdrop-blur-2xl border-r border-primary/5 fixed top-0 left-0 h-screen z-50 flex flex-col p-8 transition-all duration-500 shadow-3d">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3 mb-10 px-4 group cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-headline font-black text-lg shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">S</div>
          <span className="text-xl font-headline font-black text-primary tracking-tighter">SkillNest</span>
        </motion.div>

        <nav className="flex-1 space-y-1">
          {sidebarLinks.map((link) => (
            <motion.button
              key={link.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl font-headline font-bold text-[10px] tracking-[0.1em] transition-all duration-300 group ${
                activeTab === link.id
                  ? "bg-primary text-white shadow-3d scale-[1.02]"
                  : "text-muted-foreground/60 hover:text-primary hover:bg-primary/5"
              }`}
            >
              <link.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${activeTab === link.id ? 'text-secondary' : ''}`} />
              {link.label}
            </motion.button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#f3efe5] rounded-3xl p-6 border border-primary/5 relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
          >
            <div className="relative z-10">
              <div className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Pro Plan</div>
              <p className="text-[10px] font-bold text-muted-foreground leading-relaxed mb-4 opacity-80">Unlock expert workshops.</p>
              <Button className="w-full bg-[#8b4513] hover:bg-[#6b3410] text-white rounded-xl py-4 h-auto text-[10px] font-black border-none shadow-3d">UPGRADE</Button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </motion.div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 font-headline font-bold text-[10px] tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors group"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-10 lg:p-14 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between gap-10 mb-10"
        >
          <div className="flex-1 relative flex items-center group max-w-xl">
            <Search className="absolute left-6 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search curriculum..."
              className="w-full pl-14 pr-8 py-4 rounded-2xl bg-white border border-primary/5 shadow-3d focus:shadow-primary/10 transition-all outline-none text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-3d relative group">
              <Bell className="h-5 w-5" />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-secondary rounded-full border-2 border-white ring-4 ring-secondary/10 animate-pulse"></span>
            </button>
            
            <div className="flex items-center gap-3 p-1.5 bg-white rounded-full shadow-3d pr-5 cursor-pointer hover:shadow-primary/10 transition-all group">
              <div className="w-9 h-9 rounded-full bg-muted overflow-hidden border-2 border-[#ff7e5f]/20 group-hover:scale-110 transition-transform">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] font-headline font-black text-primary tracking-tight">{auth?.user?.userName || "Elena"}</span>
            </div>
          </div>
        </motion.header>

        {/* Welcome Section */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-headline font-black text-primary mb-2 tracking-tighter leading-none">
            Welcome back, {capitalize(auth?.user?.userName) || "Elena"}
          </h1>
          <p className="text-muted-foreground font-medium text-sm italic opacity-70">
            Current trajectory: 68% complete. Momentum is high.
          </p>
        </motion.section>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch"
        >
          {/* Left Column: Current Focus */}
          <motion.div variants={itemVariants} className="xl:col-span-8 space-y-10">
            {/* Current Focus Card */}
            <motion.div 
              whileHover={{ scale: 1.01, y: -5 }}
              className="bg-white rounded-[2.5rem] p-10 shadow-3d relative overflow-hidden group isolate border border-primary/5 min-h-[400px] flex flex-col justify-center"
            >
              <div className="relative z-10 lg:w-3/5 space-y-6">
                 <div className="inline-flex py-1 px-4 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black tracking-[0.2em] border border-emerald-100">Active Session</div>
                 <h2 className="text-3xl font-headline font-black text-primary leading-[1.2] tracking-tight">Advanced Principles of Architectural Lighting</h2>
                 
                 <div className="space-y-3 max-w-sm">
                    <div className="flex justify-between items-center text-[10px] font-black tracking-wider">
                      <span className="text-emerald-600">68% Phase Complete</span>
                      <span className="text-muted-foreground opacity-50">12 / 18 Units</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-emerald-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "68%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full transition-all"
                      ></motion.div>
                    </div>
                 </div>

                 <Button className="bg-[#4fb5ca] hover:bg-[#3da4b9] text-white rounded-xl px-8 py-5 font-headline font-black transition-all shadow-lg shadow-[#4fb5ca]/20 active:scale-95 border-none h-auto text-[10px] tracking-widest">
                   Resume Curriculum
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </div>

              {/* Decorative Image */}
              <div className="absolute right-0 top-0 bottom-0 w-[40%] opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none hidden lg:block">
                <img 
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2074&auto=format&fit=crop" 
                  alt="Architecture" 
                  className="h-full w-full object-cover grayscale mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-white via-transparent to-transparent"></div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Stats */}
          <motion.div variants={itemVariants} className="xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
            {/* Hours Learned */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2rem] p-8 shadow-3d border border-primary/5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-40">Focus Time</div>
                  <div className="text-3xl font-headline font-black text-primary leading-none">24.5h</div>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-black border border-emerald-100">+12%</div>
              </div>
              <div className="flex items-end gap-1.5 h-12">
                 {[30, 45, 20, 60, 40, 75, 55].map((h, i) => (
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    key={i} 
                    className={`flex-1 rounded-t-sm transition-all duration-700 ${i === 5 ? 'bg-primary' : 'bg-primary/10 hover:bg-primary/30'}`}
                  ></motion.div>
                 ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {/* Certificates */}
              <motion.div 
                whileHover={{ y: -5, rotate: -2 }}
                className="bg-white rounded-[1.5rem] p-6 shadow-3d border border-primary/5 flex flex-col items-center text-center justify-center gap-2 group cursor-default"
              >
                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-30">Vaults</div>
                <div className="flex items-center gap-2">
                   <span className="text-2xl font-headline font-black text-primary">3</span>
                   <Award className="h-4 w-4 text-emerald-500 transition-transform group-hover:scale-125" />
                </div>
              </motion.div>
              
              {/* XP Points */}
              <motion.div 
                whileHover={{ y: -5, rotate: 2 }}
                className="bg-white rounded-[1.5rem] p-6 shadow-3d border border-primary/5 flex flex-col items-center text-center justify-center gap-2 group cursor-default"
              >
                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-30">Spark</div>
                <div className="flex items-center gap-2">
                   <span className="text-2xl font-headline font-black text-primary tracking-tight">1.2k</span>
                   <Zap className="h-4 w-4 text-amber-500 transition-transform group-hover:scale-125" />
                </div>
              </motion.div>
            </div>

            {/* Premium Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-[#171d1b] rounded-[2rem] p-8 shadow-3d relative overflow-hidden group flex flex-col justify-between items-start min-h-[220px] transition-all"
            >
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-headline font-black text-white leading-tight tracking-tight">Lumina Plus<br/>Mentorship</h3>
                <p className="text-white/40 text-[10px] font-bold leading-relaxed max-w-[140px]">Direct expert consultation protocols active.</p>
                <button className="flex items-center gap-2 text-[9px] font-black text-white hover:text-emerald-400 transition-all pt-4 tracking-[0.2em] group/btn">
                  System Protocol
                  <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-all duration-700"></div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Keep Learning Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="flex justify-between items-baseline mb-8">
            <h3 className="text-2xl font-headline font-black text-primary tracking-tighter">Continuing Curriculum</h3>
            <button className="text-[10px] font-black text-emerald-600 tracking-widest hover:text-emerald-700 transition-colors">Manifest All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <motion.div 
                key={course.id} 
                whileHover={{ y: -8, scale: 1.01 }}
                className="group relative bg-[#011c14]/5 backdrop-blur-xl border border-[#0d694f]/20 rounded-[2.5rem] p-4 transition-all duration-500 hover:shadow-2xl hover:bg-[#011c14]/10 cursor-pointer"
              >
                <div className="relative aspect-video overflow-hidden rounded-[2rem] bg-[#fcf8f1] border border-[#0d694f]/5 mb-5 shadow-inner">
                  <img 
                    src={`https://images.unsplash.com/photo-${course.id === 1 ? '1550751827-4bd374c3f58b' : course.id === 2 ? '1579783902614-a3fb3927b6a5' : '1551288049-bbda38a661a5'}?q=80&w=800`} 
                    alt={course.title}
                    className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#011c14]/40 to-transparent transition-opacity group-hover:opacity-60"></div>
                  
                  {/* Category Tag */}
                  <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/20">
                    {course.category}
                  </div>
                </div>

                <div className="px-2 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-headline font-black text-[#0d694f] leading-tight group-hover:text-[#ff7e5f] transition-colors tracking-tight line-clamp-2 min-h-[2.5rem]">
                      {course.title}
                    </h4>
                    <p className="text-[9px] font-medium text-slate-400 italic">Phase Accelerator Protocol Active</p>
                  </div>

                  <div className="flex items-center justify-between bg-white/30 backdrop-blur-sm p-3 rounded-[1.2rem] border border-white/40 shadow-sm">
                     <div className="flex flex-col gap-0.5">
                        <span className="text-[7px] font-black text-[#0d694f]/40 uppercase tracking-widest">Momentum</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-2.5 w-2.5 ${star <= Math.floor(course.rating) ? 'fill-[#0d694f] text-[#0d694f]' : 'fill-[#0d694f]/10 text-[#0d694f]/10'}`} />
                          ))}
                        </div>
                     </div>
                     <div className="text-[10px] font-black text-[#0d694f]">
                        {course.rating.toFixed(1)}
                     </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-[#0d694f]">
                      <span className="opacity-40">Sync Level</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/50 rounded-full overflow-hidden border border-white/40">
                       <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${course.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-[#0d694f] rounded-full transition-all shadow-[0_0_10px_rgba(13,105,79,0.3)]"
                      ></motion.div>
                    </div>
                  </div>
                </div>

                {/* Decorative Background Element */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#0d694f]/5 rounded-full blur-3xl -z-10 group-hover:bg-[#0d694f]/10 transition-all"></div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Bottom Section */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4 bg-white/40 rounded-[2.5rem] p-10 border border-primary/5 shadow-3d backdrop-blur-sm"
          >
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-10 opacity-40">System Activity</h3>
            <div className="space-y-8">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-5 items-start group relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 ring-4 ring-emerald-500/10 group-hover:ring-8 group-hover:ring-emerald-500/5 transition-all"></div>
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-headline font-black text-primary tracking-wider">{activity.title}</div>
                    <div className="text-[10px] font-bold text-muted-foreground opacity-50 lowercase">{activity.sub}</div>
                    <div className="text-[8px] font-black text-muted-foreground/30 tracking-widest mt-2">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Featured for You */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-8 bg-[#dfede9] rounded-[2.5rem] p-12 shadow-3d relative overflow-hidden isolate border border-primary/10 group"
          >
             <div className="relative z-10 lg:w-3/5 space-y-5">
                 <div className="text-[9px] font-black text-[#ff7e5f] tracking-widest border border-[#ff7e5f]/20 px-3 py-1 rounded-full inline-block">Adaptive Recommendation</div>
                <h3 className="text-3xl font-headline font-black text-primary leading-tight tracking-tight">Sustainable Urban Masterclass</h3>
                <p className="text-muted-foreground font-medium text-xs leading-relaxed max-w-sm italic opacity-80">Phase optimization for urban biodiversity protocols.</p>
                
                <div className="flex items-center gap-6 py-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-[#ff7e5f]" />
                    14 Hours
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                    <User className="h-3.5 w-3.5 text-[#ff7e5f]" />
                    Dr. Aris Thorne
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                   <Button variant="ghost" className="text-[10px] font-black text-primary tracking-widest hover:bg-white/40 border-none px-0 group/link">
                    Analyze Module
                    <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                   </Button>
                </div>
             </div>
             <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-primary/5 -z-10 skew-x-12 translate-x-10"></div>
          </motion.div>
        </div>
      </main>

      {/* Global Bottom Credit */}
      <div className="fixed bottom-6 right-10 text-[8px] font-bold text-muted-foreground/20 tracking-[0.3em] pointer-events-none select-none">© 2024 SkillNest Academy • The Intellectual Sanctuary</div>
    </div>
  );
};

export default StudentDashboard;
