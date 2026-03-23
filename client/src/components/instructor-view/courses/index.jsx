import { Button } from "@/components/ui/button";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { 
  Trash2, 
  Plus, 
  Users, 
  BookOpen, 
  Search, 
  Filter,
  Star
} from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

import { useState, useEffect } from "react";

const InstructorCourses = ({ listOfCourses }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recententries");

  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
    deleteCourse,
    fetchInstructorCourseList,
  } = useContext(InstructorContext);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (auth?.user?._id) {
      fetchInstructorCourseList(auth.user._id, searchTerm, sortOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.user?._id, sortOption, fetchInstructorCourseList]);

  const handleSearch = () => {
    if (auth?.user?._id) {
       fetchInstructorCourseList(auth.user._id, searchTerm, sortOption);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  async function handleDeleteCourse(courseId) {
    if (window.confirm("Are you certain you wish to delete this curriculum vault? This action is irreversible.")) {
      const success = await deleteCourse(courseId, auth?.user?._id);
      if (success) {
         // Optionally refetch with current search/sort
         fetchInstructorCourseList(auth.user._id, searchTerm, sortOption);
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div>
          <h1 className="text-2xl font-headline font-bold text-[#0d694f] tracking-tighter mb-1 uppercase">
            Curriculum Archives
          </h1>
          <p className="text-muted-foreground font-semibold text-sm italic opacity-70">
            Audit and orchestrate your knowledge repositories.
          </p>
        </div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="bg-[#0d694f] hover:bg-[#ff7e5f] text-white rounded-2xl px-8 py-5 h-auto font-headline font-bold text-[11px] tracking-wider uppercase shadow-3d-orange transition-all border-none group"
            onClick={() => {
              setCurrentEditedCourseId(null);
              setCourseCurriculumFormData(courseCurriculumInitialFormData);
              setCourseLandingFormData(courseLandingInitialFormData);
              navigate("/instructor/create-new-course");
            }}
          >
            <Plus className="mr-2 h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
            INITIATE NEW VAULT
          </Button>
        </motion.div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col lg:flex-row items-center gap-6"
      >
        <div className="relative flex-1 group flex items-center gap-3 w-full">
           <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#0d694f] transition-colors" />
              <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               onKeyPress={handleKeyPress}
               placeholder="Query curriculum archives..." 
               className="w-full bg-white border border-[#0d694f]/5 rounded-[1.5rem] pl-16 pr-6 py-4 text-xs font-medium focus:ring-4 focus:ring-[#0d694f]/5 focus:border-[#0d694f]/20 outline-none transition-all shadow-3d"
              />
           </div>
           <Button 
            onClick={handleSearch}
            className="bg-[#0d694f] hover:bg-[#0d694f]/90 text-white rounded-[1.5rem] px-8 h-[52px] font-bold text-[11px] tracking-wider uppercase shadow-3d-orange border-none shrink-0"
           >
              SEARCH
           </Button>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto shrink-0">
           <div className="relative w-full lg:w-[260px]">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#0d694f] z-10" />
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full bg-white border border-[#0d694f]/5 rounded-[1.5rem] pl-16 pr-10 py-4 h-[52px] text-[10px] font-bold uppercase tracking-wider text-[#0d694f] outline-none shadow-3d cursor-pointer hover:bg-[#fcf8f1] transition-colors appearance-none"
              >
                 <option value="mostpopular">MOST POPULAR</option>
                 <option value="recententries">RECENT ENTRIES</option>
                 <option value="maxrevenue">MAX REVENUE</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#0d694f] opacity-40">
                ▼
              </div>
           </div>
        </div>
      </motion.div>

      {/* Course Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" 
      >
        {listOfCourses && listOfCourses.length > 0 ? (
          listOfCourses.map((course) => (
            <motion.div 
              key={course._id}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              className="group relative bg-white border border-[#0d694f]/20 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col h-full" 
            >
              {/* Top Section: Skinny Glassy Thumbnail */}
              <div className="relative p-1.5 bg-white/40 backdrop-blur-xl"> 
                <div className="relative aspect-video overflow-hidden rounded-xl bg-[#fcf8f1] border border-[#0d694f]/5 shadow-inner"> 
                  <img 
                    src={course?.image || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800"} 
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#011c14]/40 to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                     <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 ${course.isPublished ? 'bg-[#0d694f] text-white' : 'bg-[#ff7e5f] text-white'}`}>
                        {course.isPublished ? "PUBLISHED" : "DRAFT"}
                     </div>
                  </div>

                  {/* Scholars Overlay */}
                  <div className="absolute bottom-3 right-3 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg">
                     <Users className="h-3.5 w-3.5 text-white" />
                     <span className="text-[11px] font-bold text-white uppercase tracking-tight">
                       {course?.students?.length || 0} ARCHIVED
                     </span>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Main Theme Green */}
              <div className="flex-1 bg-[#0d694f] p-4 space-y-3 relative flex flex-col justify-between"> 
                <div className="space-y-1.5"> 
                  <h3 className="text-[15px] font-headline font-bold text-white leading-tight uppercase tracking-tight group-hover:text-[#ff7e5f] transition-all"> 
                    {course.title || "UNTITLED MANIFEST"}
                  </h3>
                  <div className="relative">
                     <p className="text-[10px] font-semibold text-white/60 italic leading-relaxed line-clamp-2"> 
                       {course.objectives || "No strategic objectives declared for this vault."}
                     </p>
                  </div>
                </div>

                <div className="space-y-3"> 
                  {/* Rating & Pricing Row */}
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10"> 
                    <div className="flex flex-col gap-0.5"> 
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider leading-none">Global Rating</span> 
                        <div className="flex items-center gap-0.5"> 
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-2.5 w-2.5 ${star <= 4.5 ? 'fill-white text-white' : 'fill-white/10 text-white/10'}`} /> 
                          ))}
                        </div>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10 mx-2"></div> 
                    <div className="flex flex-col items-end gap-0.5"> 
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider leading-none">Price</span> 
                        <div className="text-base font-headline font-bold text-white"> 
                          {course.pricing > 0 ? `₹${course.pricing}` : "GRATIS"}
                        </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3"> 
                    <Button
                      onClick={() => navigate(`/instructor/edit-course/${course?._id}`)}
                      className="flex-1 bg-[#ff7e5f] hover:bg-[#ff7e5f]/90 text-white rounded-xl py-3.5 h-auto font-headline font-bold text-[10px] tracking-wider uppercase transition-all shadow-lg shadow-black/20 border-none group/edit relative overflow-hidden" 
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                          REVISE VAULT
                          <BookOpen className="w-3 h-3 opacity-50 group-hover/edit:translate-x-1 transition-transform" /> 
                      </span>
                    </Button>
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteCourse(course._id)}
                      className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-red-500 hover:border-red-500 transition-all flex items-center justify-center shadow-lg backdrop-blur-md" 
                    >
                      <Trash2 className="h-4 w-4" /> 
                    </motion.button>
                  </div>
                </div>
                
                {/* Decorative Light Glow */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            variants={cardVariants}
            className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-[#0d694f]/5 shadow-3d"
          >
             <div className="max-w-md mx-auto px-6">
                <div className="w-20 h-20 bg-[#fcf8f1] rounded-full flex items-center justify-center mx-auto mb-8 border border-[#0d694f]/10 shadow-inner">
                   <BookOpen className="h-8 w-8 text-[#0d694f]/20" />
                </div>
                <h2 className="text-2xl font-headline font-black text-[#0d694f] mb-3 uppercase tracking-tight">Repository Offline</h2>
                <p className="text-muted-foreground font-medium mb-10 text-sm italic opacity-70">Your scholarly knowledge is waiting to be manifested. Begin the transmission cycle.</p>
                <Button
                   className="bg-[#0d694f] hover:bg-[#ff7e5f] text-white rounded-2xl px-10 py-6 h-auto font-headline font-black text-[10px] tracking-widest uppercase shadow-3d-orange transition-all border-none"
                   onClick={() => navigate("/instructor/create-new-course")}
                >
                   DRAFT FIRST MANIFEST
                </Button>
             </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

InstructorCourses.propTypes = {
  listOfCourses: PropTypes.array.isRequired,
};

export default InstructorCourses;
