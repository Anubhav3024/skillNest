import {
  Users,
  Search,
  Filter,
  Mail,
  User,
  Calendar,
  Clock,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const InstructorStudents = ({ listOfCourses }) => {
  // Extract all unique students from all courses
  const allStudents = listOfCourses?.reduce((acc, course) => {
    course.students?.forEach((student) => {
      const existingStudent = acc.find((s) => s.studentId === student.studentId);
      if (existingStudent) {
        if (!existingStudent.courses.includes(course.title)) {
          existingStudent.courses.push(course.title);
        }
      } else {
        acc.push({
          ...student,
          courses: [course.title],
          joinDate: new Date().toLocaleDateString(), // Placeholder
          progress: "75%", // Placeholder
          status: "ACTIVE"
        });
      }
    });
    return acc;
  }, []) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-headline font-black text-[#0d694f] tracking-tighter mb-1 uppercase">
            Scholar Registry
          </h1>
          <p className="text-muted-foreground font-medium text-sm italic opacity-70">
            Monitor engagement and track the evolution of your scholars.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white border border-[#0d694f]/10 rounded-xl px-5 py-3 flex flex-col shadow-3d cursor-default group">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mb-1 opacity-40 group-hover:opacity-100 transition-opacity">TOTAL SCHOLARS</span>
              <span className="text-xl font-headline font-black text-[#0d694f] leading-none tracking-tight">{allStudents.length}</span>
           </div>
           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
             <Button className="bg-[#0d694f] hover:bg-[#ff7e5f] text-white rounded-xl px-7 py-5 h-auto font-headline font-black text-[9px] tracking-widest uppercase shadow-3d-orange border-none">
               BROADCAST MESSAGE
             </Button>
           </motion.div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#0d694f] transition-colors" />
           <input 
            type="text" 
            placeholder="Search scholars by identifier..." 
            className="w-full bg-white border border-[#0d694f]/5 rounded-[1.5rem] pl-13 pr-6 py-4 text-xs font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none transition-all shadow-3d"
           />
        </div>
        <Button variant="ghost" className="bg-white border border-[#0d694f]/5 rounded-[1.5rem] px-8 py-4 h-auto text-[9px] font-black uppercase tracking-widest text-[#0d694f] hover:bg-[#fcf8f1] shadow-3d">
          <Filter className="h-3.5 w-3.5 mr-2" />
          REFINE REGISTRY
        </Button>
      </motion.div>

      {/* Students Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-[3rem] border border-[#0d694f]/5 shadow-3d overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#fcf8f1]">
                <th className="py-6 px-8 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">SCHOLAR IDENTITY</th>
                <th className="py-6 px-8 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">ACCESS PERMISSIONS</th>
                <th className="py-6 px-8 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">ENGAGEMENT MATRIX</th>
                <th className="py-6 px-8 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-center">PROTOCOL</th>
                <th className="py-6 px-8 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-right">OPERATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#fcf8f1]">
              {allStudents.length > 0 ? (
                allStudents.map((student, index) => (
                  <motion.tr 
                    key={index} 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * index }}
                    className="group hover:bg-[#fcf8f1]/50 transition-colors cursor-pointer"
                  >
                    <td className="py-8 px-8">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#0d694f]/5 border border-[#0d694f]/10 flex items-center justify-center text-[#0d694f] shadow-inner group-hover:rotate-6 transition-transform">
                             <User className="h-5 w-5" />
                          </div>
                          <div>
                             <div className="font-headline font-black text-[#0d694f] text-[13px] uppercase tracking-tight group-hover:text-[#ff7e5f] transition-colors">{student.studentName}</div>
                             <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5 italic opacity-60">
                                <Mail className="h-3 w-3" />
                                {student.studentEmail}
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="py-8 px-8 max-w-xs">
                       <div className="flex flex-wrap gap-1.5">
                          {student.courses.map((course, i) => (
                            <span key={i} className="bg-white border border-[#0d694f]/5 text-[#0d694f] px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest truncate max-w-[130px] shadow-sm">
                                {course}
                            </span>
                          ))}
                       </div>
                    </td>
                    <td className="py-8 px-8">
                       <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-[#0d694f]/60 uppercase tracking-widest italic">
                             <Calendar className="h-3 w-3" />
                             {student.joinDate}
                          </div>
                          <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-30">
                             <Clock className="h-3 w-3" />
                             SYNCED TODAY
                          </div>
                       </div>
                    </td>
                    <td className="py-8 px-8 text-center">
                       <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-emerald-100/50 group-hover:bg-[#0d694f] group-hover:text-white transition-all">
                          {student.status}
                       </span>
                    </td>
                    <td className="py-8 px-8 text-right">
                       <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-9 h-9 rounded-xl bg-white border border-[#0d694f]/5 text-[#0d694f] hover:text-[#ff7e5f] transition-all flex items-center justify-center shadow-3d mx-auto ml-auto"
                       >
                          <ExternalLink className="h-4 w-4" />
                       </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] opacity-20">
                     <Users className="h-10 w-10 mx-auto mb-4 opacity-50" />
                     REGISTRY EMPTY
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

InstructorStudents.propTypes = {
  listOfCourses: PropTypes.array.isRequired,
};

export default InstructorStudents;
