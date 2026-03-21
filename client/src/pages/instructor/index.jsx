import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import {
  fetchInstructorAnalyticsService,
  fetchInstructorCourseListService,
} from "@/services";
import { TabsContent } from "@radix-ui/react-tabs";
import { Book, LogOut, LayoutDashboard, Settings, ChevronRight } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const InstructorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [analytics, setAnalytics] = useState(null);
  const { logoutUser } = useContext(AuthContext);

  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);

  const { auth } = useContext(AuthContext);

  const instructorId = auth?.user?._id;

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const [coursesResponse, analyticsResponse] = await Promise.all([
          fetchInstructorCourseListService(instructorId),
          fetchInstructorAnalyticsService(instructorId),
        ]);

        if (coursesResponse?.success) {
          setInstructorCoursesList(coursesResponse.courseList);
        }

        if (analyticsResponse?.success) {
          setAnalytics(analyticsResponse.analytics);
        }
      } catch (error) {
        console.error("Error loading instructor dashboard", error);
      }
    };

    if (instructorId) {
      fetchAllCourses();
    }
  }, [instructorId, setInstructorCoursesList]);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Overview",
      value: "dashboard",
      component: (
        <InstructorDashboard
          listOfCourses={instructorCoursesList}
          analytics={analytics}
        />
      ),
    },
    {
      icon: Book,
      label: "My Inventory",
      value: "courses",
      component: <InstructorCourses listOfCourses={instructorCoursesList} />,
    },
    {
      icon: Settings,
      label: "Settings",
      value: "settings",
      component: <div className="p-12 text-center text-muted-foreground font-headline font-bold uppercase tracking-widest text-xs">Settings module coming soon</div>,
    },
  ];

  const handleLogOut = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully", { autoClose: 800 });
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-[#fcf8f1]">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-2xl shadow-emerald-950/5 hidden lg:block border-r border-[#0d694f]/5 sticky top-0 h-screen">
        <div className="p-8 h-full flex flex-col">
          <div className="mb-12">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity mb-10"
            >
              <div className="w-10 h-10 bg-[#0d694f] rounded-xl flex items-center justify-center text-white font-headline font-black text-xl">S</div>
              <span className="text-2xl font-headline font-black text-[#0d694f] tracking-tight">SkillNest</span>
            </Link>
            
            <div className="bg-[#fcf8f1] rounded-[2rem] p-6 border border-[#0d694f]/5 mb-8">
               <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0d694f] font-black border border-[#0d694f]/10 shadow-sm">
                    {auth?.user?.userName?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-headline font-black text-[#0d694f] truncate max-w-[120px]">{auth?.user?.userName}</div>
                    <div className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest">Educator</div>
                  </div>
               </div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-3">
            <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em] mb-4 ml-4">Main Navigation</div>
            {menuItems.map((menuItem) => (
              <Button
                key={menuItem.value}
                onClick={() => setActiveTab(menuItem.value)}
                className={`w-full justify-between h-14 px-6 rounded-2xl font-headline font-black text-xs transition-all duration-500 border-none group ${
                  activeTab === menuItem.value
                    ? "bg-[#0d694f] text-white shadow-xl shadow-[#0d694f]/20 scale-[1.02]"
                    : "bg-transparent text-muted-foreground hover:bg-[#0d694f]/5 hover:text-[#0d694f]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <menuItem.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${activeTab === menuItem.value ? 'text-[#ff7e5f]' : ''}`} />
                  {menuItem.label.toUpperCase()}
                </div>
                {activeTab === menuItem.value && <ChevronRight className="h-4 w-4 opacity-50" />}
              </Button>
            ))}
          </nav>
          
          <div className="mt-auto pt-8 border-t border-[#0d694f]/5">
            <Button
              onClick={handleLogOut}
              className="w-full h-14 rounded-2xl font-headline font-black text-xs text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all border-none bg-transparent flex justify-start gap-4 px-6"
            >
              <LogOut className="h-5 w-5" />
              LOGOUT
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:max-h-screen overflow-y-auto pt-8 lg:pt-0">
        <div className="max-w-7xl mx-auto p-6 lg:p-16">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-[0.2em]">
                 {activeTab === 'dashboard' ? 'Analytics Overview' : 'Course Management'}
                 <span className="w-12 h-px bg-[#ff7e5f]/30"></span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-headline font-black text-[#0d694f] tracking-tight capitalize">
                {activeTab === 'dashboard' ? 'Instructor Dashboard' : activeTab}
              </h1>
            </div>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
            {menuItems.map((menuItem) => (
              <TabsContent value={menuItem.value} key={menuItem.value} className="mt-0 focus-visible:outline-none">
                {menuItem.component}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default InstructorDashboardPage;
