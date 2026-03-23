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
  PlayCircle
} from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const InstructorCourses = ({ listOfCourses }) => {
  const navigate = useNavigate();

  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
  } = useContext(InstructorContext);

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
          <h1 className="text-2xl font-headline font-black text-[#0d694f] tracking-tighter mb-1 uppercase">
            Curriculum Archives
          </h1>
          <p className="text-muted-foreground font-medium text-sm italic opacity-70">
            Audit and orchestrate your knowledge repositories.
          </p>
        </div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="bg-[#0d694f] hover:bg-[#ff7e5f] text-white rounded-2xl px-8 py-5 h-auto font-headline font-black text-[10px] tracking-widest uppercase shadow-3d-orange transition-all border-none group"
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
        className="flex flex-col md:flex-row items-center gap-4"
      >
        <div className="relative flex-1 group">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#0d694f] transition-colors" />
           <input 
            type="text" 
            placeholder="Query curriculum archives..." 
            className="w-full bg-white border border-[#0d694f]/5 rounded-2xl pl-13 pr-6 py-4 text-xs font-medium focus:ring-4 focus:ring-[#0d694f]/5 focus:border-[#0d694f]/20 outline-none transition-all shadow-3d"
           />
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" className="bg-white border border-[#0d694f]/5 rounded-2xl px-6 py-4 h-auto text-[9px] font-black uppercase tracking-widest text-[#0d694f] hover:bg-[#fcf8f1] shadow-3d">
             <Filter className="h-3.5 w-3.5 mr-2" />
             SORT OPTIONS
           </Button>
           <select className="bg-white border border-[#0d694f]/5 rounded-2xl px-6 py-4 h-auto text-[9px] font-black uppercase tracking-widest text-[#0d694f] outline-none shadow-3d cursor-pointer hover:bg-[#fcf8f1] transition-colors appearance-none pr-10">
              <option>MOST POPULAR</option>
              <option>RECENT ENTRIES</option>
              <option>MAX REVENUE</option>
           </select>
        </div>
      </motion.div>

      {/* Course Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {listOfCourses && listOfCourses.length > 0 ? (
          listOfCourses.map((course) => (
            <motion.div 
              key={course._id}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[2.5rem] border border-[#0d694f]/5 shadow-3d overflow-hidden group transition-all duration-500 cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img 
                  src={course?.image || "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=800"} 
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors"></div>
                
                {/* Price Tag */}
                <div className="absolute top-6 left-6 bg-white shadow-3d text-[#0d694f] px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic backdrop-blur-md">
                  {course.pricing > 0 ? `₹${course.pricing}` : "GRATIS"}
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-headline font-black text-[#0d694f] leading-tight mb-2 min-h-[3rem] line-clamp-2 group-hover:text-[#ff7e5f] transition-colors uppercase tracking-tight">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1.5 text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
                        <PlayCircle className="h-3.5 w-3.5" />
                        24 SESSIONS
                     </div>
                     <div className="flex items-center gap-1.5 text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
                        <Users className="h-3.5 w-3.5" />
                        {course?.students?.length || 0} SCHOLARS
                     </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#fcf8f1]">
                   <Button
                    onClick={() => navigate(`/instructor/edit-course/${course?._id}`)}
                    className="flex-1 bg-white hover:bg-[#0d694f] text-[#0d694f] hover:text-white rounded-xl py-5 h-auto font-headline font-black text-[9px] tracking-[0.2em] uppercase transition-all border border-[#0d694f]/5 shadow-3d group/edit"
                   >
                     REVISE VAULT
                   </Button>
                   <motion.button 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="ml-4 w-12 h-12 rounded-xl border border-destructive/5 bg-red-50 text-destructive hover:bg-destructive hover:text-white transition-all flex items-center justify-center shadow-sm"
                   >
                     <Trash2 className="h-4 w-4" />
                   </motion.button>
                </div>
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
