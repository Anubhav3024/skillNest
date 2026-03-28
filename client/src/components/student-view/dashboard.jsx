import { useContext, useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Search as SearchIcon,
  Activity,
  User,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  ArrowRight,
  Play,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  CheckCircle2,
  Eye,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import { Button } from "../ui/button";
import { AuthContext } from "@/context/auth-context";
import { toast } from "react-toastify";
import { StudentContext } from "@/context/student-context";
import { motion, AnimatePresence } from "framer-motion";
import { 
  fetchStudentViewCourseListService, 
  updateUserSettingsService,
  updateUserProfileService,
  mediaUploadService,
  fetchStudentTransactionsService,
  fetchStudentActivityService
} from "@/services";
import Loader from "../common/loader";
import NotificationDropdown from "../common/notification-dropdown";

const capitalize = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

/* ───── TAB: Dashboard ───── */
const DashboardTab = ({ data, navigate, setActiveTab }) => {
  const { auth } = useContext(AuthContext);
  if (!data) return null;
  const { activeCourse, stats, recommendations } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16 pb-20 px-8 lg:px-10"
    >
      {/* 1. Welcome Section */}
      <section className="pt-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff7e5f]/10 text-[#ff7e5f] rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-[#ff7e5f]/10">
            <Activity size={12} /> Adaptive Learning Manifest
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-extrabold text-[#0d694f] leading-[0.95] tracking-tight">
            Welcome back, <br />
            <span className="text-[#ff7e5f]">{capitalize(auth?.user?.userName)}</span>
          </h1>
          <p className="text-slate-500 font-medium text-base lg:text-lg mt-7 max-w-2xl leading-relaxed italic opacity-80">
            {stats?.totalEnrolled > 0 
              ? `Your intellectual journey is ${Math.round((stats.totalCompleted/stats.totalEnrolled)*100 || 0)}% complete. You have ${stats.totalEnrolled} active vaults in your library.`
              : "Your journey towards mastery begins today. Start exploring our curated manifest repository."}
          </p>
        </motion.div>
      </section>

      {/* 2. Student Profile Card (Full Width Premium) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <div className="bg-white rounded-[3.5rem] p-10 lg:p-14 shadow-3d border border-[#0d694f]/5 overflow-hidden flex flex-col lg:flex-row items-center gap-12 group transition-all hover:shadow-2xl">
           <div className="absolute top-0 right-0 w-96 h-96 bg-[#0d694f]/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-[#0d694f]/10 transition-colors"></div>
           
           {/* Avatar */}
           <div className="relative flex-shrink-0">
             <div className="w-44 h-44 rounded-full bg-[#fcf8f1] p-1.5 shadow-2xl overflow-hidden border-2 border-white relative z-10">
                {auth?.user?.avatar ? (
                  <img src={auth.user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full bg-[#0d694f]/5 flex items-center justify-center text-[#0d694f]/20 rounded-full">
                    <User size={64} strokeWidth={1} />
                  </div>
                )}
             </div>
             <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#ff7e5f] rounded-full shadow-3d-orange flex items-center justify-center text-white z-20 border-4 border-white">
                <TrendingUp size={20} />
             </div>
           </div>

           {/* Info */}
           <div className="flex-1 text-center lg:text-left space-y-4 relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff7e5f] opacity-80">Official Scholar Profile</span>
                <h3 className="text-3xl lg:text-4xl font-headline font-extrabold text-[#0d694f] tracking-tight">{capitalize(auth?.user?.userName)}</h3>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                   <div className="flex items-center gap-2 px-4 py-2 bg-[#0d694f]/5 rounded-xl text-[#0d694f] text-[10px] font-black uppercase tracking-widest">
                      <BookOpen size={12} /> {auth?.user?.fieldOfStudy || "General Scholar"}
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <Activity size={12} /> Rank: {stats?.totalCompleted > 5 ? 'Adept' : 'Initiate'}
                   </div>
                </div>
              </div>
              <p className="text-sm lg:text-[15px] text-slate-500 font-medium max-w-lg leading-relaxed pt-2">
                Member of SkillNest since {new Date(auth?.user?.createdAt).toLocaleDateString("en-IN", { month: 'long', year: 'numeric' })}. Currently mastering {stats?.totalEnrolled || 0} disciplines.
              </p>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-2 gap-4 flex-shrink-0 w-full lg:w-auto relative z-10 pt-8 lg:pt-0 lg:border-l border-slate-100 lg:pl-12">
              <div className="p-6 bg-[#fcf8f1] rounded-3xl border border-white text-center">
                 <div className="text-3xl font-headline font-black text-[#0d694f]">{stats?.totalEnrolled || 0}</div>
                 <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Vaults</p>
              </div>
              <div className="p-6 bg-[#0d694f] rounded-3xl text-white text-center shadow-3d-orange">
                 <div className="text-3xl font-headline font-black">{stats?.totalCompleted || 0}</div>
                 <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">Mastered</p>
              </div>
           </div>
        </div>
      </motion.section>

      {/* 3. Browse / My Courses Action Section */}
      <section className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
        <Button 
          onClick={() => setActiveTab("browse")}
          className="bg-[#0d694f] hover:bg-[#0b5c45] text-white rounded-[2rem] px-12 py-8 h-auto font-headline font-black text-sm shadow-2xl shadow-[#0d694f]/20 transition-all active:scale-95 border-none group"
        >
          Explore Catalogue
          <SearchIcon className="ml-3 h-5 w-5 transition-transform group-hover:scale-110" />
        </Button>
        {stats?.totalEnrolled > 0 && (
          <Button 
            variant="outline"
            onClick={() => setActiveTab("my-courses")}
            className="bg-white hover:bg-[#fcf8f1] text-[#0d694f] border-[#0d694f]/10 rounded-[2rem] px-12 py-8 h-auto font-headline font-black text-sm transition-all shadow-lg active:scale-95 group"
          >
            My Learning Vault
            <BookOpen className="ml-3 h-5 w-5 transition-transform group-hover:scale-110" />
          </Button>
        )}
      </section>

      {/* 4. Actions Section (Progress, Enrollment, Lectures) */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-headline font-black text-[#0d694f] tracking-tight">Scholar Performance</h3>
            <div className="h-1 w-20 bg-[#ff7e5f] mt-2 rounded-full"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { label: "Manifest Progress", value: `${activeCourse?.progressPercent || 0}%`, icon: Activity, color: "text-[#4fb5ca]", sub: "Continuing Mastery" },
            { label: "Active Nodes", value: stats?.totalEnrolled || 0, icon: BookOpen, color: "text-[#0d694f]", sub: "Enrolled Disciplines" },
            { label: "Lectures Ingested", value: stats?.totalLecturesCompleted || 0, icon: Play, color: "text-[#ff7e5f]", sub: "Information Delta" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              whileHover={{ y: -8, shadow: "0 25px 50px -12px rgb(0 0 0 / 0.1)" }}
              className="bg-white rounded-[3rem] p-10 shadow-3d border border-[#0d694f]/5 group transition-all relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-6 ${stat.color.replace('text', 'bg')}/10 ${stat.color} shadow-lg shadow-black/5`}>
                    <stat.icon size={26} />
                  </div>
                  <div className="text-4xl font-headline font-black text-[#0d694f] tracking-tighter">{stat.value}</div>
                  <div className="text-[11px] font-black text-slate-800 mt-2 tracking-wide">{stat.label}</div>
                  <div className="text-[9px] font-bold text-slate-400 italic mt-0.5">
                    {stat.sub}
                  </div>
                </div>
                <div className="absolute top-4 right-4 text-[#0d694f]/5 rotate-12 transition-transform group-hover:scale-125">
                   <stat.icon size={80} strokeWidth={1} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Recommended Section */}
      {recommendations && recommendations.length > 0 && (
        <section id="recommended-section" className="space-y-10 pt-4">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#0d694f]/5 pb-8">
              <div>
                <span className="text-[10px] font-black tracking-[0.16em] text-[#ff7e5f]">Curated Archive</span>
                <h3 className="text-2xl font-headline font-black text-[#0d694f] tracking-tight">Recommended Courses</h3>
              </div>
              <button 
                onClick={() => navigate("/home?tab=browse")}
                className="px-6 py-3 bg-[#0d694f]/5 rounded-xl text-[10px] font-black text-[#0d694f] hover:bg-[#0d694f] hover:text-white transition-all tracking-wide"
              >
                Browse Course Library
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {recommendations.slice(0, 3).map((course, idx) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + (idx * 0.1) }}
                whileHover={{ y: -12 }}
                onClick={() => navigate(`/course/details/${course._id}`)}
                className="group relative bg-white border border-[#0d694f]/20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl flex flex-col h-full"
              >
                <div className="relative p-1.5 bg-white/40 backdrop-blur-xl">
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-[#fcf8f1] border border-[#0d694f]/5 shadow-inner">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#0d694f]/5">
                        <BookOpen className="w-12 h-12 text-[#0d694f]/10" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#011c14]/60 via-transparent to-transparent opacity-80"></div>

                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="px-4 py-1.5 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/20 bg-[#0d694f] text-white shadow-lg">
                        {course.category}
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg">
                      <Users className="h-3.5 w-3.5 text-white" />
                      <span className="text-[11px] font-bold text-white ">
                        {course.totalStudents ?? course.students?.length ?? 0} Scholars
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-[#0d694f] p-4 space-y-3 relative flex flex-col justify-between"> 
                  <div className="space-y-1.5"> 
                    <h4 className="text-[15px] font-headline font-bold text-white leading-tight tracking-tight group-hover:text-[#ff7e5f] transition-all line-clamp-2 uppercase"> 
                      {capitalize(course.title)}
                    </h4>
                    <p className="text-[10px] font-semibold text-white/60 italic leading-relaxed line-clamp-2"> 
                      {course.instructorName ? `by ${capitalize(course.instructorName)} · ` : ""}
                      {course.level ? `${course.level} · ` : ""}
                      {course.totalLectures || 0} units
                    </p>
                  </div>

                  <div className="space-y-3"> 
                    <div className="flex items-center justify-between bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10"> 
                      <div className="flex flex-col gap-0.5"> 
                        <span className="text-[9px] font-bold text-white/40  leading-none">Units</span> 
                        <div className="text-base font-headline font-bold text-white"> 
                          {course.totalLectures || 0}
                        </div>
                      </div>
                      <div className="h-8 w-[1px] bg-white/10 mx-2"></div> 
                      <div className="flex flex-col items-end gap-0.5"> 
                        <span className="text-[9px] font-bold text-white/40  leading-none">Price</span> 
                        <div className="text-base font-headline font-bold text-white"> 
                          {course.pricing > 0 ? `₹${course.pricing}` : "Free"}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/course/details/${course._id}`);
                      }}
                      className="w-full bg-[#ff7e5f] hover:bg-[#ff7e5f]/90 text-white rounded-xl py-3.5 h-auto text-[10px] font-headline font-bold border-none transition-all shadow-lg shadow-black/20 group/btn"
                    >
                      View Vault
                      <ArrowRight className="ml-2 h-3.5 w-3.5 opacity-60 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Your Courses Anchor */}
      <div id="my-courses-section"></div>
    </motion.div>
  );
};

DashboardTab.propTypes = {
  data: PropTypes.shape({
    activeCourse: PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      image: PropTypes.string,
      progressPercent: PropTypes.number,
      completedLectures: PropTypes.number,
      totalLectures: PropTypes.number,
    }),
    stats: PropTypes.shape({
      totalEnrolled: PropTypes.number,
      totalInProgress: PropTypes.number,
      totalCompleted: PropTypes.number,
      totalLecturesCompleted: PropTypes.number,
    }),
    recommendations: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      image: PropTypes.string,
      category: PropTypes.string,
      totalLectures: PropTypes.number,
      pricing: PropTypes.number,
    })),
  }),
  navigate: PropTypes.func.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

/* ───── TAB: My Courses ───── */
const MyCoursesTab = ({ data, navigate }) => {
  const courses = data?.enrolledCourses || [];

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-16 shadow-3d text-center border border-primary/5">
        <ShoppingCart className="w-12 h-12 text-primary/20 mx-auto mb-4" />
        <h3 className="text-xl font-headline font-black text-primary mb-2">No courses purchased</h3>
        <p className="text-muted-foreground text-sm mb-6">Browse our catalogue and start learning today.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-headline font-black text-primary">
          My Courses ({courses.length})
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <motion.div
            key={course._id}
            whileHover={{ y: -6 }}
            className="group bg-white rounded-[2rem] border border-primary/5 shadow-3d overflow-hidden cursor-pointer transition-all"
            onClick={() => navigate(`/course-progress/${course._id}`)}
          >
            <div className="aspect-video bg-[#fcf8f1] overflow-hidden relative">
              {course.image ? (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-primary/20" />
                </div>
              )}
              {course.isCompleted && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black tracking-wider">
                  Completed
                </div>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-[8px] font-black text-[#ff7e5f] uppercase tracking-widest mb-1">
                  {course.category}
                </div>
                <h4 className="text-sm font-headline font-black text-primary leading-tight line-clamp-2">
                  {capitalize(course.title)}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1">
                  by {capitalize(course.instructorName)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black text-primary">
                  <span className="opacity-40">Progress</span>
                  <span>{course.progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progressPercent}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <div className="text-[8px] text-muted-foreground">
                  {course.completedLectures}/{course.totalLectures} lectures
                </div>
              </div>
              <Button className="w-full bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-xl py-3 h-auto text-[10px] font-black border-none transition-all">
                {course.progressPercent > 0 ? "Continue Learning" : "Start Learning"}
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

MyCoursesTab.propTypes = {
  data: PropTypes.shape({
    enrolledCourses: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      image: PropTypes.string,
      instructorName: PropTypes.string,
      category: PropTypes.string,
      progressPercent: PropTypes.number,
      completedLectures: PropTypes.number,
      totalLectures: PropTypes.number,
      isCompleted: PropTypes.bool,
    })),
  }),
  navigate: PropTypes.func.isRequired,
};

/* ───── TAB: Browse ───── */
const CATEGORIES = [
  { id: "web-development", label: "Web Development" },
  { id: "backend-development", label: "Backend Development" },
  { id: "data-science", label: "Data Science" },
  { id: "machine-learning", label: "Machine Learning" },
  { id: "artificial-intelligence", label: "Artificial Intelligence" },
  { id: "cloud-computing", label: "Cloud Computing" },
  { id: "cyber-security", label: "Cyber Security" },
  { id: "mobile-development", label: "Mobile Development" },
  { id: "game-development", label: "Game Development" },
  { id: "software-engineering", label: "Software Engineering" },
];
const LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const BrowseTab = ({ navigate, externalSearch = "" }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ sortBy: "price-lowtohigh", category: "", level: "" });

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const queryParams = { ...filters, page, limit: 12 };
        if (externalSearch) queryParams.search = externalSearch;
        const query = Object.entries(queryParams)
          .filter(([, v]) => v !== undefined && v !== null && v !== "")
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join("&");
        const res = await fetchStudentViewCourseListService(query);
        if (res?.success) {
          setCourses(res.courseList || []);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.error("Browse fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [filters, page, externalSearch]);

  const clearFilters = () => {
    setFilters({ sortBy: "price-lowtohigh", category: "", level: "" });
    setPage(1);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-xl font-headline font-black text-primary">
          Browse Courses ({courses.length})
        </h3>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
          className="bg-white border border-primary/10 rounded-xl px-4 py-2 text-xs font-bold text-primary outline-none"
        >
          <option value="price-lowtohigh">Price: Low to High</option>
          <option value="price-hightolow">Price: High to Low</option>
          <option value="title-atoz">Title: A-Z</option>
          <option value="title-ztoa">Title: Z-A</option>
        </select>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar */}
        <aside className="w-56 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-[2rem] p-6 shadow-3d border border-primary/5 sticky top-6 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-[0.15em]">
                Filter Catalog
              </h4>
              {(filters.category || filters.level) && (
                <button onClick={clearFilters} className="text-[9px] font-bold text-primary/40 hover:text-primary underline">
                  Clear
                </button>
              )}
            </div>

            <div>
              <h5 className="text-xs font-headline font-black text-primary mb-3 uppercase tracking-wider">Category</h5>
              <div className="space-y-2.5">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        category: f.category === cat.id ? "" : cat.id,
                      }))
                    }
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      filters.category === cat.id ? "border-primary bg-primary" : "border-primary/20 group-hover:border-primary/40"
                    }`}>
                      {filters.category === cat.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className={`text-xs font-medium transition-colors ${
                      filters.category === cat.id ? "text-primary font-bold" : "text-muted-foreground group-hover:text-primary"
                    }`}>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-headline font-black text-primary mb-3 uppercase tracking-wider">Level</h5>
              <div className="space-y-2.5">
                {LEVELS.map((lvl) => (
                  <label
                    key={lvl.id}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        level: f.level === lvl.id ? "" : lvl.id,
                      }))
                    }
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      filters.level === lvl.id ? "border-primary bg-primary" : "border-primary/20 group-hover:border-primary/40"
                    }`}>
                      {filters.level === lvl.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className={`text-xs font-medium transition-colors ${
                      filters.level === lvl.id ? "text-primary font-bold" : "text-muted-foreground group-hover:text-primary"
                    }`}>{lvl.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>
        {/* Course Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader />
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-16 text-center shadow-3d border border-primary/5">
              <SearchIcon className="w-12 h-12 text-primary/20 mx-auto mb-4" />
              <h3 className="text-lg font-headline font-black text-primary mb-2">No courses available</h3>
              <p className="text-muted-foreground text-sm">Check back later for new courses.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <motion.div
                    key={course._id}
                    whileHover={{ y: -6 }}
                    onClick={() => navigate(`/course/details/${course._id}`)}
                    className="group bg-white rounded-[2rem] border border-primary/5 shadow-3d overflow-hidden cursor-pointer transition-all hover:shadow-xl"
                  >
                    <div className="aspect-video bg-[#fcf8f1] overflow-hidden relative">
                      {course.image ? (
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-primary/20" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-primary/90 text-white px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase">
                        {course.category}
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black text-[#ff7e5f] uppercase tracking-widest">{course.level}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[9px] text-muted-foreground">{course.students?.length || 0} students</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-headline font-black text-primary leading-tight line-clamp-2">{capitalize(course.title)}</h4>
                      <p className="text-[10px] text-muted-foreground">by {capitalize(course.instructorName)}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                        <span className="text-[9px] text-muted-foreground">{course.curriculum?.length || 0} Lessons</span>
                        <span className="text-sm font-headline font-black text-primary">₹{course.pricing || "Free"}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => {
                      setPage(p => p - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="rounded-xl font-bold text-[10px] uppercase tracking-wider"
                  >
                    Previous
                  </Button>
                  <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => {
                      setPage(p => p + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="rounded-xl font-bold text-[10px] uppercase tracking-wider"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

BrowseTab.propTypes = {
  navigate: PropTypes.func.isRequired,
  externalSearch: PropTypes.string,
};


/* ───── TAB: Activity ───── */
const ActivityTab = ({ auth }) => {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await fetchStudentActivityService(auth?.user?._id);
        if (response?.success) {
          setActivityData(response.data);
        }
      } catch (err) {
        console.error("Activity fetch error:", err);
        toast.error("Failed to sync activity data");
      } finally {
        setLoading(false);
      }
    }

    if (auth?.user?._id) {
      fetchActivity();
    }
  }, [auth]);

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#0d694f]/20 border-t-[#0d694f] rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#0d694f]">Syncing Ecosystem Data...</p>
    </div>
  );

  const { coursesCompleted, lecturesWatched, totalEnrolled, timeline = [], recentPurchases = [] } = activityData || {};

  const getActivityIcon = (type) => {
    switch (type) {
      case "LECTURE_VIEW": return <Play className="w-4 h-4 text-[#ff7e5f]" />;
      case "COURSE_ENROLL": return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
      case "COURSE_COMPLETE": return <CheckCircle2 className="w-4 h-4 text-primary" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "LECTURE_VIEW": return "bg-orange-50";
      case "COURSE_ENROLL": return "bg-emerald-50";
      case "COURSE_COMPLETE": return "bg-primary/5";
      default: return "bg-gray-50";
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h3 className="text-xl font-headline font-black text-primary">Activity Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-8 shadow-3d border border-primary/5 text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-3" />
          <div className="text-3xl font-headline font-black text-primary">{coursesCompleted || 0}</div>
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mt-1">Courses Completed</div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-3d border border-primary/5 text-center">
          <Play className="w-6 h-6 text-[#ff7e5f] mx-auto mb-3" />
          <div className="text-3xl font-headline font-black text-primary">{lecturesWatched || 0}</div>
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mt-1">Lectures Watched</div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-3d border border-primary/5 text-center">
          <BookOpen className="w-6 h-6 text-primary mx-auto mb-3" />
          <div className="text-3xl font-headline font-black text-primary">{totalEnrolled || 0}</div>
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mt-1">Total Enrolled</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Feed */}
        <div className="bg-white rounded-[2rem] p-8 shadow-3d border border-primary/5">
          <h4 className="text-sm font-headline font-black text-primary mb-6">Learning Timeline</h4>
          {timeline.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No activities recorded yet.</p>
          ) : (
            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/5">
              {timeline.map((act) => (
                <div key={act._id} className="flex items-start gap-4 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${getActivityColor(act.type)} border-4 border-white shadow-sm`}>
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="text-[11px] font-bold text-primary leading-tight">
                      {act.type === "LECTURE_VIEW" && `Watched "${act.lectureTitle}"`}
                      {act.type === "COURSE_ENROLL" && `Enrolled in "${act.courseTitle}"`}
                      {act.type === "COURSE_COMPLETE" && `Completed "${act.courseTitle}" 🏆`}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>{capitalize(act.courseTitle)}</span>
                      <span>•</span>
                      <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Purchases */}
        <div className="bg-white rounded-[2rem] p-8 shadow-3d border border-primary/5">
          <h4 className="text-sm font-headline font-black text-primary mb-6">Recent Purchases</h4>
          {recentPurchases.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No purchase history yet.</p>
          ) : (
            <div className="space-y-4">
              {recentPurchases.map((purchase) => (
                <div key={purchase._id} className="flex items-center justify-between p-4 rounded-xl bg-[#fcf8f1] border border-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-xs font-headline font-black text-primary">{capitalize(purchase.courseTitle)}</div>
                      <div className="text-[9px] text-muted-foreground">
                        {new Date(purchase.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-headline font-black text-primary">₹{purchase.orderAmount}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

ActivityTab.propTypes = {
  auth: PropTypes.object.isRequired,
};

/* ───── TAB: Settings ───── */
const SettingsTab = ({ auth, updateAuthUser }) => {
  const [prefs, setPrefs] = useState({
    courseUpdates: auth?.user?.settings?.courseUpdates ?? true,
    promotionalEmails: auth?.user?.settings?.promotionalEmails ?? false,
    progressReminders: auth?.user?.settings?.progressReminders ?? true,
    publicProfile: auth?.user?.settings?.publicProfile ?? true,
  });

  const [profileData, setProfileData] = useState({
    userName: auth?.user?.userName || "",
    fieldOfStudy: auth?.user?.fieldOfStudy || "",
    avatar: auth?.user?.avatar || "",
  });

  const [uploading, setUploading] = useState(false);

  const togglePref = async (key) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    try {
      const response = await updateUserSettingsService({ settings: newPrefs });
      if (response?.success) {
        toast.success("Preference updated");
        updateAuthUser({ ...auth.user, settings: newPrefs });
      } else {
        toast.error("Failed to update preference");
        setPrefs(prefs); // rollback
      }
    } catch (err) {
      console.error("Settings toggle error:", err);
      toast.error("Error updating settings");
      setPrefs(prefs); // rollback
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("File size must be less than 2MB");
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await mediaUploadService(formData, () => {});
      const uploadedUrl =
        res?.result?.url ||
        res?.data?.url ||
        res?.url ||
        res?.result?.secure_url;

      if (res?.success && uploadedUrl) {
        setProfileData((prev) => ({ ...prev, avatar: uploadedUrl }));
        toast.success("Avatar uploaded! Remember to save profile.");
      } else {
        toast.error(res?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    // If it's a new upload or we just want to clear it locally before saving
    setProfileData({ ...profileData, avatar: "" });
    toast.info("Avatar cleared. Save profile to persist.");
  };

  const handleSaveProfile = async () => {
    try {
      const res = await updateUserProfileService({
        userId: auth?.user?._id,
        userName: profileData.userName,
        fieldOfStudy: profileData.fieldOfStudy,
        avatar: profileData.avatar,
      });

      if (res.success) {
        toast.success("Profile saved successfully");
        updateAuthUser({
          ...auth.user,
          userName: profileData.userName,
          fieldOfStudy: profileData.fieldOfStudy,
          avatar: profileData.avatar,
        });
      } else {
        toast.error(res.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      toast.error("An error occurred while saving");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20 px-8 lg:px-10">
      <div className="flex items-center justify-between">
         <h3 className="text-2xl font-headline font-bold text-[#0d694f]">Settings</h3>
         <Button 
            onClick={handleSaveProfile}
            className="bg-[#0d694f] hover:bg-[#0b5c45] text-white rounded-2xl px-8 py-4 h-auto font-headline font-bold text-xs shadow-xl shadow-[#0d694f]/20 transition-all active:scale-95 border-none"
          >
            Save Changes
          </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card Refactored as Edit Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-3d border border-[#0d694f]/5 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff7e5f]/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <h4 className="text-sm font-headline font-bold text-[#0d694f] border-b border-[#0d694f]/5 pb-4">Personal Information</h4>
            
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-inner p-1">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover rounded-[1.8rem]" />
                  ) : (
                    <User className="w-12 h-12 text-[#0d694f]/20" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                       <div className="w-6 h-6 border-2 border-[#0d694f] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                   <label className="w-10 h-10 bg-[#0d694f] text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      <Eye size={16} />
                   </label>
                   {profileData.avatar && (
                     <button 
                        onClick={handleAvatarDelete}
                        className="w-10 h-10 bg-white text-destructive border border-destructive/10 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                     >
                        <LogOut size={16} className="rotate-180" />
                     </button>
                   )}
                </div>
              </div>

              <div className="flex-1 w-full space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 ml-1">Display Name</label>
                    <input
                      type="text"
                      value={profileData.userName}
                      onChange={(e) => setProfileData({ ...profileData, userName: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-5 py-4 rounded-2xl bg-[#fcf8f1] border border-[#0d694f]/5 text-sm font-semibold text-[#0d694f] outline-none focus:ring-2 focus:ring-[#0d694f]/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 ml-1">Field of Study</label>
                    <input
                      type="text"
                      value={profileData.fieldOfStudy}
                      onChange={(e) => setProfileData({ ...profileData, fieldOfStudy: e.target.value })}
                      placeholder="e.g. Graphic Design"
                      className="w-full px-5 py-4 rounded-2xl bg-[#fcf8f1] border border-[#0d694f]/5 text-sm font-semibold text-[#0d694f] outline-none focus:ring-2 focus:ring-[#0d694f]/10 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 ml-1">Email Address (Read Only)</label>
                  <input
                    type="email"
                    value={auth?.user?.userEmail || ""}
                    disabled
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Security Mockup */}
          <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-3d border border-[#0d694f]/5 space-y-6">
            <h4 className="text-sm font-headline font-bold text-[#0d694f] border-b border-[#0d694f]/5 pb-4">Security</h4>
            <div className="flex items-center justify-between p-4 bg-[#fcf8f1] rounded-[2rem] border border-[#0d694f]/5">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#ff7e5f] shadow-sm">
                     <Activity size={18} />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-[#0d694f]">Password</div>
                     <div className="text-[10px] text-muted-foreground">Last changed 3 months ago</div>
                  </div>
               </div>
               <Button variant="ghost" className="text-xs font-bold text-[#ff7e5f] hover:bg-white rounded-xl">Update</Button>
            </div>
          </div>
        </div>

        {/* Preferences Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-3d border border-[#0d694f]/5 space-y-8">
            <h4 className="text-sm font-headline font-bold text-[#0d694f] border-b border-[#0d694f]/5 pb-4">Notifications</h4>
            <div className="space-y-2">
              {[
                { key: "courseUpdates", label: "Course Updates", icon: BookOpen },
                { key: "promotionalEmails", label: "Offers & News", icon: TrendingUp },
                { key: "progressReminders", label: "Learning Reminders", icon: Activity },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-4 group">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${prefs[item.key] ? 'bg-[#0d694f]/10 text-[#0d694f]' : 'bg-slate-50 text-slate-300'}`}>
                        <item.icon size={14} />
                     </div>
                     <span className={`text-[11px] font-bold ${prefs[item.key] ? 'text-slate-800' : 'text-slate-400'}`}>{item.label}</span>
                  </div>
                  <button
                    onClick={() => togglePref(item.key)}
                    className={`w-10 h-5 rounded-full transition-all relative ${prefs[item.key] ? "bg-[#0d694f]" : "bg-slate-200"}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all shadow-sm ${prefs[item.key] ? "left-5.5" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#ff7e5f]/5 rounded-[2.5rem] p-8 border border-[#ff7e5f]/10 overflow-hidden relative">
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#ff7e5f]/10 rounded-full blur-2xl"></div>
             <h4 className="text-sm font-headline font-bold text-[#ff7e5f] mb-2">Need help?</h4>
             <p className="text-[10px] text-slate-600 font-medium leading-relaxed mb-6">
               Our support team is available 24/7 to help you with any issues regarding your account.
             </p>
             <Button variant="outline" className="w-full bg-white border-[#ff7e5f]/20 text-[#ff7e5f] rounded-xl font-bold py-3 text-[10px]">
                Contact Support
             </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

SettingsTab.propTypes = {
  auth: PropTypes.shape({
    user: PropTypes.shape({
      _id: PropTypes.string,
      userName: PropTypes.string,
      userEmail: PropTypes.string,
      role: PropTypes.string,
      avatar: PropTypes.string,
      fieldOfStudy: PropTypes.string,
      createdAt: PropTypes.string,
      settings: PropTypes.shape({
        courseUpdates: PropTypes.bool,
        promotionalEmails: PropTypes.bool,
        progressReminders: PropTypes.bool,
        publicProfile: PropTypes.bool,
      }),
    }),
  }).isRequired,
  updateAuthUser: PropTypes.func.isRequired,
};

/* ───── TAB: Help ───── */
const HelpTab = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q: "How do I purchase a course?", a: "Browse our catalogue, select a course, and click 'Buy Now'. You'll be redirected to a secure payment gateway." },
    { q: "How do I track my progress?", a: "Your progress is automatically tracked as you watch lectures. Visit the 'My Courses' tab to see progress bars for each course." },
    { q: "Can I get a refund?", a: "Refund requests can be made within 7 days of purchase. Contact support at support@skillnest.com." },
    { q: "How do I resume a course?", a: "Click on any course in 'My Courses' or use the 'Resume Learning' button on your dashboard." },
    { q: "Who are the educators?", a: "Our educators are verified professionals and experts in their fields. You can view their profiles on each course page." },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h3 className="text-xl font-headline font-black text-primary">Help & FAQ</h3>
      <div className="bg-white rounded-[2rem] p-8 shadow-3d border border-primary/5 space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-primary/5 last:border-none">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between py-5 text-left"
            >
              <span className="text-sm font-headline font-bold text-primary">{faq.q}</span>
              {openFaq === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-muted-foreground pb-5 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/* ═══════  MAIN DASHBOARD COMPONENT  ═══════ */
/* ───── TAB: Payments ───── */
const PaymentsTab = ({ auth }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetchStudentTransactionsService(auth?.user?._id);
        if (res.success) setTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.user?._id) fetchTransactions();
  }, [auth?.user?._id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 opacity-30">
       <Loader2 className="w-8 h-8 animate-spin mb-4" />
       <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Ledger...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 px-8 lg:px-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-headline font-black text-[#0d694f] tracking-tighter">Financial Ledger</h3>
          <p className="text-muted-foreground text-xs font-medium italic opacity-60">Complete record of your intellectual investments.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-3d border border-[#0d694f]/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fcf8f1] border-b border-[#0d694f]/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#0d694f]/40">Course Asset</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#0d694f]/40">Internal ID</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#0d694f]/40">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#0d694f]/40">Investment</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#0d694f]/40">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0d694f]/5">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-[#fcf8f1]/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 overflow-hidden border border-[#0d694f]/5 shadow-sm group-hover:scale-105 transition-transform">
                           {tx.courseId?.image ? (
                             <img src={tx.courseId.image} className="w-full h-full object-cover" alt="" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-[#0d694f]/10"><BookOpen size={16}/></div>
                           )}
                        </div>
                        <span className="text-sm font-bold text-[#0d694f] group-hover:text-[#ff7e5f] transition-colors">{capitalize(tx.courseId?.title || "Unknown Course")}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-mono font-bold text-muted-foreground/40">{tx.orderId?.slice(-12).toUpperCase()}</td>
                    <td className="px-8 py-6 text-[10px] font-bold text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-[#0d694f]">₹{tx.totalAmount}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-max ${
                        tx.paymentStatus === 'captured' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${tx.paymentStatus === 'captured' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        {tx.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground opacity-20">
                       <CreditCard size={64} strokeWidth={1} />
                       <p className="font-headline font-black text-sm tracking-widest uppercase">No transactions archived.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

PaymentsTab.propTypes = {
  auth: PropTypes.shape({
    user: PropTypes.shape({
      _id: PropTypes.string,
    }),
  }).isRequired,
};

const Loader2 = ({ className }) => <Activity className={className} />;

Loader2.propTypes = {
  className: PropTypes.string,
};

/* ═══════  MAIN DASHBOARD COMPONENT  ═══════ */
const StudentDashboard = () => {
  const { auth, resetCredentials, updateAuthUser } = useContext(AuthContext);
  const { dashboardData, dashboardLoading, fetchDashboard } = useContext(StudentContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const tabFromUrl = searchParams.get("tab");
  const browseSearch = searchParams.get("search") || "";

  useEffect(() => {
    if (auth?.user?._id) {
      fetchDashboard(auth.user._id);
    }
  }, [auth?.user?._id, fetchDashboard]);

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const sidebarLinks = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "my-courses", label: "My Learning", icon: BookOpen },
    { id: "browse", label: "Catalogue", icon: SearchIcon },
    { id: "activity", label: "Feed", icon: Activity },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "settings", label: "Security", icon: Settings },
    { id: "help", label: "Support", icon: HelpCircle },
  ];

  const handleLogout = () => {
    toast.success("Identity session terminated archive synchronized", { autoClose: 1000 });
    resetCredentials();
    sessionStorage.clear();
    navigate("/auth");
  };

  const handleHeaderSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/home?tab=browse&search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTabChange = (tabId) => {
    if (tabId === "browse") {
      const searchSuffix = browseSearch ? `&search=${encodeURIComponent(browseSearch)}` : "";
      navigate(`/home?tab=browse${searchSuffix}`);
      return;
    }
    navigate(`/home?tab=${tabId}`);
  };

  const renderTabContent = () => {
    if (dashboardLoading && activeTab !== "browse" && activeTab !== "settings" && activeTab !== "help" && activeTab !== "payments") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-4 opacity-50">
          <div className="w-12 h-12 border-4 border-[#0d694f]/10 border-t-[#0d694f] rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0d694f]">Loading Ecosystem...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <DashboardTab data={dashboardData} navigate={navigate} setActiveTab={handleTabChange} />;
      case "my-courses":
        return <MyCoursesTab data={dashboardData} navigate={navigate} />;
      case "browse":
        return <BrowseTab navigate={navigate} externalSearch={browseSearch} />;
      case "activity":
        return <ActivityTab auth={auth} />;
      case "settings":
        return <SettingsTab auth={auth} updateAuthUser={updateAuthUser} />;
      case "payments":
        return <PaymentsTab auth={auth} />;
      case "help":
        return <HelpTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcf8f1] font-body text-slate-900 selection:bg-[#0d694f]/20 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white/70 backdrop-blur-2xl border-r border-[#0d694f]/5 fixed top-0 left-0 h-screen z-50 flex flex-col p-5 px-4 transition-all duration-500 shadow-3d">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3 mb-8 px-4 group cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-9 h-9 bg-[#0d694f] rounded-xl flex items-center justify-center text-white font-headline font-bold text-lg shadow-lg shadow-[#0d694f]/20 group-hover:rotate-6 transition-transform">
            S
          </div>
          <span className="text-xl font-headline font-bold text-[#0d694f] tracking-tighter">
            SkillNest
          </span>
        </motion.div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
          {sidebarLinks.map((link) => (
            <motion.button
              key={link.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTabChange(link.id)}
              className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-2xl font-headline font-semibold text-[13px] tracking-tight transition-all duration-300 group ${
                activeTab === link.id
                  ? "bg-[#0d694f] text-white shadow-3d scale-[1.02]"
                  : "text-muted-foreground/60 hover:text-[#0d694f] hover:bg-[#0d694f]/5"
              }`}
            >
              <link.icon
                className={`h-4.5 w-4.5 transition-transform duration-300 ${
                  activeTab === link.id ? "scale-110" : "group-hover:scale-110"
                }`}
              />
              <span>{link.label}</span>
              {activeTab === link.id && (
                <motion.div layoutId="activeTabBadge" className="ml-auto w-1 h-1 rounded-full bg-[#ff7e5f] shadow-[0_0_8px_rgba(255,126,95,0.8)]"></motion.div>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 font-headline font-bold text-[10px] tracking-[0.15em] text-muted-foreground hover:text-[#ff7e5f] transition-colors group border-none bg-transparent"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            DISCONNECT
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto w-full custom-scrollbar relative scroll-smooth">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between gap-10 sticky top-0 z-40 bg-[#0d694f] px-8 lg:px-10 py-4 shadow-2xl shadow-[#0d694f]/20 border-b border-white/5"
        >
          <div className="flex-1 relative flex items-center group max-w-xl">
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

          <div className="flex items-center gap-6">
            <NotificationDropdown userId={auth?.user?._id} role="student" />

            <div 
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-3 p-1 bg-white/10 border border-white/10 rounded-full pr-5 cursor-pointer hover:bg-white/20 transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden border border-white/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                {auth?.user?.avatar ? (
                  <img src={auth?.user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-white/80" />
                )}
              </div>
              <span className="text-[12px] font-headline font-bold text-white tracking-tight">
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
        </motion.header>

        {/* Tab Content */}
        <div className="pt-10">
          <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
               className="w-full"
             >
               {renderTabContent()}
             </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <div className="fixed bottom-6 right-10 text-[8px] font-bold text-[#0d694f]/20 tracking-[0.3em] pointer-events-none select-none">
        © 2026 SkillNest • Scholar Manifest System
      </div>
    </div>
  );
};

export default StudentDashboard;
