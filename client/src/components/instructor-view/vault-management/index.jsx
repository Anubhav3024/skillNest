import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Users, 
  TrendingUp, 
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
          <h1 className="text-3xl font-headline font-black text-[#0d694f] tracking-tighter uppercase">
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
              className="w-full bg-white/50 backdrop-blur-sm border border-[#0d694f]/5 rounded-2xl pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#0d694f] outline-none cursor-pointer hover:bg-white transition-all appearance-none shadow-sm"
            >
              <option value="all">ALL STATUS</option>
              <option value="active">ACTIVE</option>
              <option value="paused">PAUSED</option>
              <option value="archived">ARCHIVED</option>
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
                  className="group relative bg-white border border-[#0d694f]/5 rounded-[2rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-[#0d694f]/5 transition-all duration-500 flex flex-col h-full"
                >
                {/* Thumbnail Area */}
                <div className="relative aspect-[16/10] overflow-hidden m-2 rounded-[1.5rem] border border-[#0d694f]/5">
                  <img 
                    src={course.image || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800"} 
                    alt={course.title || "Vault thumbnail"}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#011c14]/60 via-transparent to-transparent"></div>
                  
                  {/* Status Overlay */}
                  <div className="absolute top-4 left-4">
                     <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase backdrop-blur-md border border-white/20 shadow-lg ${
                       status === 'paused' ? 'bg-amber-500 text-white' : 
                       status === 'archived' ? 'bg-zinc-500 text-white' : 
                       'bg-[#0d694f] text-white'
                     }`}>
                        {status.toUpperCase()}
                     </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    <Star className="h-2.5 w-2.5 fill-[#ff7e5f] text-[#ff7e5f]" />
                    <span className="text-[10px] font-black text-white">4.8</span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 pt-2 flex-col flex justify-between flex-1 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-headline font-bold text-[#0d694f] tracking-tight line-clamp-2 uppercase">
                      {course.title || "Untitled Vault"}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">{course.students?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3 text-[#ff7e5f]" />
                        <span className="text-[11px] font-bold text-[#ff7e5f] tracking-wider uppercase">₹{course.pricing || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#0d694f]/5">
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Audit Manifest</span>
                    <button className="w-8 h-8 rounded-full bg-[#fcf8f1] border border-[#0d694f]/5 flex items-center justify-center group-hover:bg-[#0d694f] group-hover:text-white transition-all shadow-sm">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Status-specific decorative line */}
                <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 group-hover:w-full w-12 ${
                  status === 'paused' ? 'bg-amber-500' : 
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
                <h3 className="text-xl font-headline font-black text-[#0d694f] uppercase tracking-tight">Empty Archive</h3>
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
