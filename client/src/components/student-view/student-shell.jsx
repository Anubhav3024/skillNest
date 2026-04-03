import { useContext, useState } from "react";
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Search,
  Activity,
  Settings,
  HelpCircle,
  LogOut,
  User,
  CreditCard,
} from "lucide-react";
import { AuthContext } from "@/context/auth-context";
import { toast } from "react-toastify";
import NotificationDropdown from "../common/notification-dropdown";

const sidebarLinks = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/home?tab=dashboard" },
  { id: "my-learning", label: "My Learning", icon: BookOpen, path: "/home?tab=my-courses" },
  { id: "catalogue", label: "Catalogue", icon: Search, path: "/home?tab=browse" },
  { id: "feed", label: "Feed", icon: Activity },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "security", label: "Security", icon: Settings, path: "/profile" },
  { id: "support", label: "Support", icon: HelpCircle },
];

const StudentShell = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, resetCredentials } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");

  const isLinkActive = (linkId) => {
    if (linkId === "catalogue") {
      return (
        location.search.includes("tab=browse") ||
        location.pathname.startsWith("/course/details")
      );
    }
    if (linkId === "dashboard") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    if (linkId === "my-learning") {
      return (
        location.search.includes("tab=my-courses") ||
        location.pathname === "/student-courses"
      );
    }
    if (linkId === "security") {
      return location.pathname === "/profile";
    }
    return false;
  };

  const handleLogout = () => {
    toast.success("Identity session terminated archive synchronized", {
      autoClose: 1000,
    });
    resetCredentials();
    sessionStorage.clear();
    navigate("/auth");
  };

  const handleHeaderSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/home?tab=browse&search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcf8f1] font-body text-slate-900 selection:bg-[#0d694f]/20 overflow-hidden">
      <aside className="w-16 sm:w-64 bg-white/70 backdrop-blur-2xl border-r border-[#0d694f]/5 fixed top-0 left-0 h-screen z-50 flex flex-col pt-0 px-2 sm:px-4 pb-5 transition-all duration-500 shadow-3d">
        <div
          className="flex flex-col items-center justify-center gap-0 mb-4 sm:mb-6 group cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <img
            src="/skillnestlog.png"
            alt="SkillNest Logo"
            className="w-10 h-10 sm:w-[95px] sm:h-[95px] object-contain transition-transform group-hover:rotate-6"
          />
          <span className="hidden sm:block text-2xl font-headline font-black tracking-tighter transition-colors">
            <span className="text-[#0d694f]">Skill</span><span className="text-[#ff7e5f]">Nest</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-0 sm:pr-2">
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => link.path && navigate(link.path)}
              title={link.label}
              aria-label={link.label}
              className={`relative w-full flex items-center justify-center sm:justify-start gap-0 sm:gap-4 px-2 sm:px-4 py-2.5 rounded-2xl font-headline font-semibold text-[13px] tracking-tight transition-all duration-300 group ${
                isLinkActive(link.id)
                  ? "bg-[#0d694f] text-white shadow-3d scale-[1.02]"
                  : "text-muted-foreground/60 hover:text-[#0d694f] hover:bg-[#0d694f]/5"
              }`}
            >
              <link.icon
                className={`h-4.5 w-4.5 transition-transform duration-300 ${
                  isLinkActive(link.id) ? "scale-110" : "group-hover:scale-110"
                }`}
              />
              <span className="hidden sm:inline">{link.label}</span>
              {isLinkActive(link.id) && (
                <div className="sm:ml-auto absolute sm:static right-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#ff7e5f] shadow-[0_0_8px_rgba(255,126,95,0.8)]"></div>
              )}
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-900/95 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 sm:hidden">
                {link.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <button
            onClick={handleLogout}
            title="Disconnect"
            aria-label="Disconnect"
            className="relative w-full flex items-center justify-center sm:justify-start gap-0 sm:gap-4 px-2 sm:px-6 py-4 font-headline font-bold text-[10px] tracking-[0.15em] text-muted-foreground hover:text-[#ff7e5f] transition-colors group border-none bg-transparent"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">DISCONNECT</span>
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-900/95 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 sm:hidden">
              Disconnect
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 ml-16 sm:ml-64 overflow-y-auto overflow-x-hidden custom-scrollbar relative scroll-smooth">
        <header className="flex flex-col sm:flex-row sm:items-center items-stretch justify-between gap-3 sm:gap-10 sticky top-0 z-40 bg-[#0d694f] px-4 sm:px-8 lg:px-10 py-4 shadow-2xl shadow-[#0d694f]/20 border-b border-white/5">
          <div className="w-full sm:flex-1 relative flex items-center group sm:max-w-xl">
            <Search className="absolute left-6 h-4 w-4 text-white/50 transition-colors group-focus-within:text-white" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleHeaderSearch}
              className="w-full pl-14 pr-8 py-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-white placeholder:text-white/40 focus:bg-white/15 transition-all outline-none text-sm font-medium focus:ring-1 focus:ring-white/20"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6">
            <NotificationDropdown userId={auth?.user?._id} role="student" />

            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 p-1 bg-white/10 border border-white/10 rounded-full pr-2 sm:pr-5 cursor-pointer hover:bg-white/20 transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden border border-white/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                {auth?.user?.avatar ? (
                  <img src={auth.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-white/80" />
                )}
              </div>
              <span className="hidden sm:inline text-[12px] font-headline font-bold text-white tracking-tight">
                {auth?.user?.userName?.split(" ")[0]}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="w-11 h-11 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all relative group hover:bg-white/20"
              title="Disconnect"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="pt-10">{children}</div>
      </main>
    </div>
  );
};

StudentShell.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StudentShell;
