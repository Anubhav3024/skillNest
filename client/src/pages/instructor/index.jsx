import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import InstructorEarnings from "@/components/instructor-view/earnings";
import InstructorStudents from "@/components/instructor-view/students";
import InstructorSettings from "@/components/instructor-view/settings";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import {
  BookOpen,
  LogOut,
  LayoutDashboard,
  Settings,
  Users,
  IndianRupee,
  UserCircle,
  PlusCircle,
  HelpCircle,
  Bell,
  Search
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const InstructorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedRange, setSelectedRange] = useState("6m");
  const { 
    instructorCoursesList, 
    fetchInstructorCourseList, 
    fetchInstructorAnalytics,
    analytics 
  } = useContext(InstructorContext);
  const { auth, resetCredentials } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.user?._id) {
       fetchInstructorCourseList(auth?.user?._id);
       fetchInstructorAnalytics(auth?.user?._id, selectedRange);
    }
  }, [fetchInstructorCourseList, fetchInstructorAnalytics, auth?.user?._id, selectedRange]);

  function handleRangeChange(range) {
    setSelectedRange(range);
  }

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      value: "dashboard",
      component: (
        <InstructorDashboard
          listOfCourses={instructorCoursesList}
          analytics={analytics}
          auth={auth}
          onRangeChange={handleRangeChange}
          selectedRange={selectedRange}
        />
      ),
    },
    {
      icon: BookOpen,
      label: "My Inventory",
      value: "courses",
      component: <InstructorCourses listOfCourses={instructorCoursesList} />,
    },
    {
      icon: Users,
      label: "Students",
      value: "students",
      component: <InstructorStudents listOfCourses={instructorCoursesList} />,
    },
    {
      icon: IndianRupee,
      label: "Earnings",
      value: "earnings",
      component: <InstructorEarnings />,
    },
    {
      icon: Settings,
      label: "Settings",
      value: "settings",
      component: <InstructorSettings />,
    },
    {
      icon: HelpCircle,
      label: "Help",
      value: "help",
      component: <div className="p-12 text-center text-muted-foreground font-headline font-bold uppercase tracking-widest text-xs">Support module coming soon</div>,
    },
  ];

  return (
    <div className="flex h-screen bg-[#fcf8f1] font-body text-slate-900 overflow-hidden smooth-scroll">
      {/* Sidebar */}
      <aside className="w-72 bg-white/70 backdrop-blur-2xl border-r border-[#0d694f]/5 fixed top-0 left-0 h-screen z-50 flex flex-col p-8 transition-all duration-500 shadow-3d">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3 mb-10 px-4 group cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <div className="w-9 h-9 bg-[#0d694f] rounded-xl flex items-center justify-center text-white font-headline font-black text-lg shadow-lg shadow-[#0d694f]/20 group-hover:rotate-6 transition-transform">S</div>
          <span className="text-xl font-headline font-black text-[#0d694f] tracking-tighter">SkillNest</span>
        </motion.div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
          {menuItems.map((menuItem) => (
            <motion.button
              key={menuItem.value}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(menuItem.value)}
              className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl font-headline font-bold text-[10px] tracking-[0.1em] transition-all duration-300 group ${
                activeTab === menuItem.value
                  ? "bg-[#0d694f] text-white shadow-3d scale-[1.02]"
                  : "text-muted-foreground/60 hover:text-[#0d694f] hover:bg-[#0d694f]/5"
              }`}
            >
              <menuItem.icon className={`h-4 w-4 transition-transform duration-300 ${activeTab === menuItem.value ? "scale-110" : "group-hover:scale-110"}`} />
              <span className="uppercase">{menuItem.label}</span>
              {activeTab === menuItem.value && (
                <motion.div layoutId="activeTabBadge" className="ml-auto w-1 h-1 rounded-full bg-[#ff7e5f] shadow-[0_0_8px_rgba(255,126,95,0.8)]"></motion.div>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#f3efe5] rounded-3xl p-6 border border-[#0d694f]/5 relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
          >
            <div className="relative z-10">
              <div className="text-[9px] font-black text-[#ff7e5f] uppercase tracking-[0.2em] mb-1">Scholar Status</div>
              <p className="text-[10px] font-bold text-muted-foreground leading-relaxed mb-4 opacity-80">Ready to deploy a new intellectual vault?</p>
              <Button 
                onClick={() => navigate("/instructor/create-new-course")}
                className="w-full bg-[#0d694f] hover:bg-[#0b5c45] text-white rounded-xl py-4 h-auto text-[10px] font-black border-none shadow-3d flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                NEW MANIFEST
              </Button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#0d694f]/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </motion.div>

        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 overflow-y-auto w-full custom-scrollbar relative scroll-smooth">
        {/* Header */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between gap-10 sticky top-0 z-40 bg-[#0d694f] px-10 lg:px-14 py-6 shadow-2xl shadow-[#0d694f]/20 border-b border-white/5"
        >
          <div className="flex-1 relative flex items-center group max-w-xl">
            <Search className="absolute left-6 h-4 w-4 text-white/50 transition-colors group-focus-within:text-white" />
            <input
              type="text"
              placeholder="Search manifests..."
              className="w-full pl-14 pr-8 py-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-white placeholder:text-white/40 focus:bg-white/15 transition-all outline-none text-xs font-medium focus:ring-1 focus:ring-white/20"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="w-11 h-11 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all relative group hover:bg-white/20">
              <Bell className="h-5 w-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-[#ff7e5f] rounded-full border-2 border-[#0d694f] animate-pulse"></span>
            </button>
            
            <div className="flex items-center gap-3 p-1 bg-white/10 border border-white/10 rounded-full pr-5 cursor-pointer hover:bg-white/20 transition-all group">
              <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden border border-white/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                {auth?.user?.avatar ? (
                  <img src={auth?.user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="h-5 w-5 text-white/80" />
                )}
              </div>
              <span className="text-[11px] font-headline font-black text-white tracking-tight">{auth?.user?.userName?.split(" ")[0]}</span>
            </div>

            <button 
              onClick={handleLogout}
              className="w-11 h-11 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all relative group hover:bg-white/20"
              title="Disconnect"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </motion.header>

        <div className="p-10 lg:p-14 max-w-7xl mx-auto w-full">

        {/* Welcome Section */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-headline font-black text-[#0d694f] tracking-tighter uppercase leading-none">
              Control Center
            </h1>
            <div className="h-px flex-1 bg-gradient-to-r from-[#0d694f]/20 to-transparent"></div>
          </div>
          <p className="text-muted-foreground font-medium text-sm italic opacity-70">
            Welcome back, {auth?.user?.userName}. Your intellectual vaults are synchronized and active.
          </p>
        </motion.section>

        <div className="relative z-10 w-full transition-all duration-500">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {menuItems.find(item => item.value === activeTab)?.component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      </main>
    </div>
  );
};

export default InstructorDashboardPage;
