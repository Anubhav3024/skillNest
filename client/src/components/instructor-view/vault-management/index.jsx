import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Users, 
  Star,
  BookOpen,
  ChevronRight
} from "lucide-react";
import VaultDetailedView from "./detailed-view";
import PropTypes from "prop-types";
import { InstructorContext } from "@/context/instructor-context";

const VaultManagement = ({ listOfCourses }) => {
  const { globalSearchTerm, setGlobalSearchTerm } = useContext(InstructorContext);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const searchTerm = globalSearchTerm || "";

  const filteredCourses = listOfCourses?.filter(course => {
    const title = course?.title || "";
    const status = (course?.status || "active").toLowerCase();
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (selectedCourseId) {
    return (
      <VaultDetailedView 
        courseId={selectedCourseId} 
        onBack={() => setSelectedCourseId(null)} 
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-black text-[#0d694f] tracking-tighter">
            Vault Explorer
          </h1>
          <p className="text-muted-foreground font-medium text-sm italic opacity-60">
            Select a knowledge manifestation to audit its core metrics and student resonance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-[#0d694f] transition-colors" />
            <input 
              type="text" 
              placeholder="Search vaults..."
              value={searchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="w-full bg-white/50 backdrop-blur-sm border border-[#0d694f]/5 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-[#0d694f]/5 focus:border-[#0d694f]/20 transition-all shadow-sm"
            />
          </div>
          <div className="relative w-full sm:w-44">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 text-[#0d694f] opacity-40" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white/50 backdrop-blur-sm border border-[#0d694f]/5 rounded-2xl pl-10 pr-4 py-3 text-[10px] font-black tracking-widest text-[#0d694f] outline-none cursor-pointer hover:bg-white transition-all appearance-none shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Course List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const status = (course?.status || "active").toLowerCase();

              return (
                <motion.div 
                  key={course._id}
                  layout
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedCourseId(course._id)}
                  className="group relative bg-white border border-[#0d694f]/20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl flex flex-col h-full"
                >
                {/* Top Section: Thumbnail */}
                <div className="relative p-1.5 bg-white/40 backdrop-blur-xl">
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-[#fcf8f1] border border-[#0d694f]/5 shadow-inner">
                    <img 
                      src={course.image || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800"} 
                      alt={course.title || "Vault thumbnail"}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#011c14]/60 via-transparent to-transparent"></div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/20 shadow-lg ${
                        status === "paused"
                          ? "bg-[#ff7e5f] text-white"
                          : status === "archived"
                            ? "bg-zinc-500 text-white"
                            : "bg-[#0d694f] text-white"
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </div>

                    {/* Scholars Overlay */}
                    <div className="absolute bottom-3 right-3 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg">
                      <Users className="h-3.5 w-3.5 text-white" />
                      <span className="text-[11px] font-bold text-white ">
                        {course.students?.length || 0} Scholars
                      </span>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      <Star className="h-2.5 w-2.5 fill-[#ff7e5f] text-[#ff7e5f]" />
                      <span className="text-[10px] font-black text-white">4.8</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex-1 bg-[#0d694f] p-4 space-y-3 relative flex flex-col justify-between"> 
                  <div className="space-y-1.5"> 
                    <h3 className="text-[15px] font-headline font-bold text-white leading-tight tracking-tight group-hover:text-[#ff7e5f] transition-all line-clamp-2"> 
                      {course.title || "Untitled Vault"}
                    </h3>
                    <p className="text-[10px] font-semibold text-white/60 italic leading-relaxed line-clamp-2"> 
                      {course.subtitle || course.category || "Select this vault to audit its core metrics."}
                    </p>
                  </div>

                  <div className="space-y-3"> 
                    <div className="flex items-center justify-between bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10"> 
                      <div className="flex flex-col gap-0.5"> 
                        <span className="text-[9px] font-bold text-white/40  leading-none">Scholars</span> 
                        <div className="text-base font-headline font-bold text-white"> 
                          {course.students?.length || 0}
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

                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedCourseId(course._id);
                      }}
                      className="w-full bg-[#ff7e5f] hover:bg-[#ff7e5f]/90 text-white rounded-xl py-3.5 h-auto font-headline font-bold text-[10px]  transition-all shadow-lg shadow-black/20 border-none flex items-center justify-center gap-2"
                    >
                      Audit Vault
                      <ChevronRight className="h-4 w-4 opacity-70" />
                    </button>
                  </div>
                  
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
                
                {/* Status-specific decorative line */}
                <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 group-hover:w-full w-12 ${
                  status === 'paused' ? 'bg-[#ff7e5f]' : 
                  status === 'archived' ? 'bg-zinc-500' : 
                  'bg-[#ff7e5f]'
                }`}></div>
              </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-32 text-center bg-white/30 backdrop-blur-xl rounded-[3rem] border border-[#0d694f]/5"
            >
              <div className="max-w-xs mx-auto space-y-4">
                <div className="w-16 h-16 bg-[#fcf8f1] rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-[#0d694f]/20" />
                </div>
                <h3 className="text-xl font-headline font-black text-[#0d694f] tracking-tight">Empty Archive</h3>
                <p className="text-muted-foreground text-sm font-medium italic opacity-60">No manifestations match your current frequency query.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

VaultManagement.propTypes = {
  listOfCourses: PropTypes.array.isRequired,
};

export default VaultManagement;
