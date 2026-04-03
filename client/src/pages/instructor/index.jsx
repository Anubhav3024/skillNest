import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import InstructorEarnings from "@/components/instructor-view/earnings";
import InstructorStudents from "@/components/instructor-view/students";
import InstructorSettings from "@/components/instructor-view/settings";
import InstructorHelp from "@/components/instructor-view/help";
import VaultManagement from "@/components/instructor-view/vault-management";
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
  Search,
  BarChart
} from "lucide-react";
import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import NotificationDropdown from "@/components/common/notification-dropdown";

const InstructorDashboardPage = () => {
  const { 
    instructorCoursesList, 
    fetchInstructorCourseList, 
    fetchInstructorAnalytics,
    analytics,
    saasAnalytics,
    fetchSaaSAnalytics,
    activeTab,
    setActiveTab,
    globalSearchTerm,
    setGlobalSearchTerm
  } = useContext(InstructorContext);
  const { auth, resetCredentials } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  useEffect(() => {
    if (auth?.user?._id) {
       fetchInstructorCourseList(auth?.user?._id);
       fetchInstructorAnalytics(auth?.user?._id);
       fetchSaaSAnalytics("monthly");
    }
  }, [fetchInstructorCourseList, fetchInstructorAnalytics, fetchSaaSAnalytics, auth?.user?._id]);

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [setActiveTab, tabFromUrl]);

  // Real-time Dashboard Updates
  useEffect(() => {
    if (!auth?.user?._id) return;

    const socketBaseUrl = import.meta.env.DEV
      ? undefined
      : import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || undefined;
    const socket = io(socketBaseUrl);
    
    socket.emit("join-instructor", auth.user._id);

    socket.on("dashboard-update", (data) => {
      console.log("Global Real-time update received:", data);
      
      // Refresh all analytics
      fetchInstructorAnalytics(auth.user._id);
      fetchSaaSAnalytics("monthly");
      fetchInstructorCourseList(auth.user._id);

      toast.success(data.message || "New activity on your dashboard! 🥂", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [auth?.user?._id, fetchInstructorAnalytics, fetchSaaSAnalytics, fetchInstructorCourseList]);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
    navigate("/auth", { replace: true });
  }

  const handleGlobalSearchKeyDown = (event) => {
    if (event.key !== "Enter") return;

    const query = globalSearchTerm.trim();

    if (!auth?.user?._id) return;

    if (activeTab === "courses") {
      fetchInstructorCourseList(auth.user._id, query);
      return;
    }

    if (activeTab === "vault-management") {
      return;
    }

    setActiveTab("vault-management");
  };

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
          setActiveTab={setActiveTab}
        />
      ),
    },
    {
      icon: BarChart,
      label: "Vault Explorer",
      value: "vault-management",
      component: (
        <VaultManagement 
          listOfCourses={instructorCoursesList} 
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
      component: (
        <InstructorEarnings 
          saasAnalytics={saasAnalytics}
          fetchSaaSAnalytics={fetchSaaSAnalytics}
          user={auth?.user}
        />
      ),
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
      component: <InstructorHelp />,
    },
  ];

  return (
    <div className="flex h-screen bg-[#fcf8f1] font-body text-slate-900 overflow-hidden smooth-scroll">
      {/* Sidebar */}
      <aside className="w-16 md:w-60 bg-white/70 backdrop-blur-2xl border-r border-[#0d694f]/5 fixed top-0 left-0 h-screen z-50 flex flex-col pt-0 px-2 md:px-4 pb-5 transition-all duration-500 shadow-3d">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col items-center justify-center gap-0 mb-4 md:mb-6 group cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <img
            src="/skillnestlog.png"
            alt="SkillNest Logo"
            className="w-10 h-10 md:w-[95px] md:h-[95px] object-contain transition-transform group-hover:rotate-6"
          />
          <span className="hidden md:block text-2xl font-headline font-black tracking-tighter transition-colors">
            <span className="text-[#0d694f]">Skill</span><span className="text-[#ff7e5f]">Nest</span>
          </span>
        </motion.div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-0 md:pr-2">
          {menuItems.map((menuItem) => (
            <motion.button
              key={menuItem.value}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(menuItem.value)}
              title={menuItem.label}
              aria-label={menuItem.label}
              className={`relative w-full flex items-center justify-center md:justify-start gap-0 md:gap-4 px-2 md:px-4 py-2.5 rounded-2xl font-headline font-semibold text-[13px] tracking-tight transition-all duration-300 group ${
                activeTab === menuItem.value
                  ? "bg-[#0d694f] text-white shadow-3d scale-[1.02]"
                  : "text-muted-foreground/60 hover:text-[#0d694f] hover:bg-[#0d694f]/5"
              }`}
            >
              <menuItem.icon className={`h-4.5 w-4.5 transition-transform duration-300 ${activeTab === menuItem.value ? "scale-110" : "group-hover:scale-110"}`} />
              <span className="hidden md:inline">{menuItem.label}</span>
              {activeTab === menuItem.value && (
                <motion.div layoutId="activeTabBadge" className="md:ml-auto absolute md:static right-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#ff7e5f] shadow-[0_0_8px_rgba(255,126,95,0.8)]"></motion.div>
              )}
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-900/95 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 md:hidden">
                {menuItem.label}
              </span>
            </motion.button>
          ))}
        </nav>

        <div className="hidden md:block mt-auto space-y-4">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#f3efe5] rounded-[1.5rem] p-5 border border-[#0d694f]/5 relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
          >
            <div className="relative z-10">
              <div className="text-[11px] font-bold text-[#ff7e5f] uppercase tracking-wider mb-1">Scholar Status</div>
              <p className="text-[11px] font-semibold text-muted-foreground leading-relaxed mb-4 opacity-80">Ready to deploy a new intellectual vault?</p>
              <Button 
                onClick={() => navigate("/instructor/create-new-course")}
                className="w-full bg-[#0d694f] hover:bg-[#0b5c45] text-white rounded-xl py-4 h-auto text-[11px] font-bold border-none shadow-3d flex items-center justify-center gap-2 uppercase tracking-wider"
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
      <main className="flex-1 min-w-0 ml-16 md:ml-60 overflow-y-auto overflow-x-hidden custom-scrollbar relative scroll-smooth">
        {/* Header */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center items-stretch justify-between gap-3 md:gap-10 sticky top-0 z-40 bg-[#0d694f] px-4 md:px-8 lg:px-10 py-4 shadow-2xl shadow-[#0d694f]/20 border-b border-white/5"
        >
          <div className="w-full md:flex-1 relative flex items-center group md:max-w-xl">
            <Search className="absolute left-6 h-4 w-4 text-white/50 transition-colors group-focus-within:text-white" />
            <input
              type="text"
              placeholder="Search manifests..."
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              onKeyDown={handleGlobalSearchKeyDown}
              className="w-full pl-14 pr-8 py-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-white placeholder:text-white/40 focus:bg-white/15 transition-all outline-none text-sm font-medium focus:ring-1 focus:ring-white/20"
            />
          </div>

          <div className="flex items-center justify-between md:justify-start gap-3 md:gap-6">
            <NotificationDropdown userId={auth?.user?._id} role="instructor" />
            
            <div 
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-3 p-1 bg-white/10 border border-white/10 rounded-full pr-2 md:pr-5 cursor-pointer hover:bg-white/20 transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden border border-white/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                {auth?.user?.avatar ? (
                  <img src={auth?.user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="h-5 w-5 text-white/80" />
                )}
              </div>
              <span className="hidden md:inline text-[12px] font-headline font-bold text-white tracking-tight">{auth?.user?.userName?.split(" ")[0]}</span>
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

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">


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
