import {
  Users,
  Search,
  Filter,
  Mail,
  User,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  Loader2,
  ChevronDown,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "react-toastify";

const ENTRIES_PER_PAGE = 12;

const InstructorStudents = ({ listOfCourses }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Reset pagination when searching or filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCourse, selectedStatus]);

  // Flattened enrollments: One row per student-course pair
  const allEnrollments = useMemo(() => {
    const enrollments = [];
    listOfCourses?.forEach((course) => {
      course.students?.forEach((student) => {
        enrollments.push({
          ...student,
          courseTitle: course.title,
          courseId: course._id,
          joinDate: new Date(student.enrolledDate || Date.now()).toLocaleDateString(),
          status: "ACTIVE"
        });
      });
    });
    return enrollments.sort((a, b) => new Date(b.enrolledDate) - new Date(a.enrolledDate));
  }, [listOfCourses]);

  // Filtering logic
  const filteredEnrollments = useMemo(() => {
    return allEnrollments.filter(enrollment => {
      const matchesSearch = 
        enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCourse = selectedCourse === "all" || enrollment.courseTitle === selectedCourse;
      const matchesStatus = selectedStatus === "all" || enrollment.status === selectedStatus;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [allEnrollments, searchTerm, selectedCourse, selectedStatus]);

  // Pagination logic
  const paginatedEnrollments = useMemo(() => {
    const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
    return filteredEnrollments.slice(startIndex, startIndex + ENTRIES_PER_PAGE);
  }, [filteredEnrollments, currentPage]);

  const totalPages = Math.ceil(filteredEnrollments.length / ENTRIES_PER_PAGE);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const uniqueCourses = useMemo(() => {
    return Array.from(new Set(listOfCourses?.map(c => c.title) || []));
  }, [listOfCourses]);

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    try {
      const studentIds = Array.from(new Set(filteredEnrollments.map(e => e.studentId)));
      const response = await axiosInstance.post("/instructor/broadcast", {
        studentIds,
        message: broadcastMessage
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setIsBroadcastModalOpen(false);
        setBroadcastMessage("");
      } else {
        toast.error(response.data.message || "Failed to broadcast message");
      }
    } catch (error) {
      console.error("Broadcast error:", error);
      toast.error(error.response?.data?.message || "Error broadcasting message");
    } finally {
      setIsSending(false);
    }
  };

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
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-headline font-bold text-[#0d694f] tracking-tighter mb-1 uppercase">
            Scholar Registry
          </h1>
          <p className="text-muted-foreground font-semibold text-sm italic opacity-70">
            Monitor engagement and track the individual evolution of your scholars.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white border border-[#0d694f]/10 rounded-xl px-5 py-3 flex flex-col shadow-3d cursor-default group">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1 opacity-60 group-hover:opacity-100 transition-opacity">TOTAL ENROLLMENTS</span>
              <span className="text-xl font-headline font-bold text-[#0d694f] leading-none tracking-tight">{filteredEnrollments.length}</span>
           </div>
           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
             <Button 
                onClick={() => setIsBroadcastModalOpen(true)}
                disabled={filteredEnrollments.length === 0}
                className="bg-[#0d694f] hover:bg-[#ff7e5f] text-white rounded-xl px-7 py-5 h-auto font-headline font-bold text-[11px] tracking-wider uppercase shadow-3d-orange border-none disabled:opacity-50"
              >
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#0d694f]/5 rounded-[1.5rem] pl-[3.5rem] pr-6 py-4 text-xs font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none transition-all shadow-3d"
           />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="bg-white border border-[#0d694f]/5 rounded-[1.5rem] px-8 py-4 h-auto text-[11px] font-bold uppercase tracking-wider text-[#0d694f] hover:bg-[#fcf8f1] shadow-3d flex items-center gap-2">
              <Filter className="h-3.5 w-3.5" />
              REFINE REGISTRY
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white rounded-2xl shadow-2xl border border-[#0d694f]/5 p-2" align="end">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 py-3">Filter by Course</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={() => setSelectedCourse("all")}
              className={`text-[10px] font-bold uppercase rounded-xl mb-1 cursor-pointer ${selectedCourse === "all" ? "bg-[#0d694f]/5 text-[#0d694f]" : ""}`}
            >
              All Courses
            </DropdownMenuItem>
            {uniqueCourses.map(course => (
              <DropdownMenuItem 
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`text-[10px] font-bold uppercase rounded-xl mb-1 cursor-pointer ${selectedCourse === course ? "bg-[#0d694f]/5 text-[#0d694f]" : ""}`}
              >
                {course}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-[#0d694f]/5 my-2" />
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 py-3">Filter by Status</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={() => setSelectedStatus("all")}
              className={`text-[10px] font-bold uppercase rounded-xl mb-1 cursor-pointer ${selectedStatus === "all" ? "bg-[#0d694f]/5 text-[#0d694f]" : ""}`}
            >
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSelectedStatus("ACTIVE")}
              className={`text-[10px] font-bold uppercase rounded-xl mb-1 cursor-pointer ${selectedStatus === "ACTIVE" ? "bg-[#0d694f]/5 text-[#0d694f]" : ""}`}
            >
              Active
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Students Table */}
      <div className="space-y-6">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-[#0d694f]/5 shadow-3d overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#fcf8f1]">
                  <th className="py-3 px-5 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">SCHOLAR IDENTITY</th>
                  <th className="py-3 px-5 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">ACCESS PERMISSIONS</th>
                  <th className="py-3 px-5 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">ENGAGEMENT MATRIX</th>
                  <th className="py-3 px-5 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider text-center">PROTOCOL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#fcf8f1]">
                {paginatedEnrollments.length > 0 ? (
                  paginatedEnrollments.map((enrollment, index) => (
                    <motion.tr 
                      key={index} 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * index }}
                      className="group hover:bg-[#fcf8f1]/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#0d694f]/5 border border-[#0d694f]/10 flex items-center justify-center text-[#0d694f] shadow-inner group-hover:rotate-6 transition-transform hover:bg-[#ff7e5f]/10">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                               <div className="font-headline font-bold text-[#0d694f] text-[14px] uppercase tracking-tight group-hover:text-[#ff7e5f] transition-colors">{enrollment.studentName}</div>
                              <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5 mt-0.5 italic opacity-60">
                                  <Mail className="h-3 w-3" />
                                  {enrollment.studentEmail}
                              </div>
                            </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 max-w-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#0d694f]/5 flex items-center justify-center text-[#0d694f]">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <span className="bg-white border border-[#0d694f]/5 text-[#0d694f] px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider truncate max-w-[200px] shadow-sm group-hover:bg-[#0d694f] group-hover:text-white transition-all">
                                {enrollment.courseTitle}
                            </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0d694f]/80 uppercase tracking-wider italic">
                              <Calendar className="h-3.5 w-3.5" />
                              {enrollment.joinDate}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold uppercase tracking-wider opacity-30">
                              <Clock className="h-3 w-3" />
                              MAPPED TO PROTOCOL
                            </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100/50 group-hover:bg-[#0d694f] group-hover:text-white transition-all">
                            {enrollment.status || "ACTIVE"}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-32 text-center text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] opacity-20">
                      <Users className="h-10 w-10 mx-auto mb-4 opacity-50" />
                      REGISTRY EMPTY
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination Footer */}
        {filteredEnrollments.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
            <div className="bg-white border border-[#0d694f]/10 rounded-2xl px-6 py-4 shadow-3d-small">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                SHOWING <span className="text-[#0d694f]">{Math.min(filteredEnrollments.length, (currentPage - 1) * ENTRIES_PER_PAGE + 1)}-{Math.min(filteredEnrollments.length, currentPage * ENTRIES_PER_PAGE)}</span> OF {filteredEnrollments.length} SCHOLARS
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="bg-white border-[#0d694f]/10 rounded-xl px-6 h-12 text-[11px] font-bold uppercase tracking-wider text-[#0d694f] hover:bg-[#0d694f] hover:text-white shadow-3d disabled:opacity-30 transition-all flex items-center gap-2"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                PREVIOUS
              </Button>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="bg-white border-[#0d694f]/10 rounded-xl px-6 h-12 text-[11px] font-bold uppercase tracking-wider text-[#0d694f] hover:bg-[#0d694f] hover:text-white shadow-3d disabled:opacity-30 transition-all flex items-center gap-2"
              >
                NEXT
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Broadcast Modal */}
      <Dialog open={isBroadcastModalOpen} onOpenChange={setIsBroadcastModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-[#0d694f]/10 shadow-2xl p-8 overflow-hidden font-body">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0d694f]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <DialogHeader className="relative z-10 mb-6">
            <DialogTitle className="text-xl font-headline font-bold text-[#0d694f] uppercase tracking-tighter flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0d694f] text-white flex items-center justify-center shadow-lg shadow-[#0d694f]/20">
                <MessageSquare className="h-5 w-5" />
              </div>
              Broadcast Message
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-muted-foreground/70 italic mt-2">
              Send an intellectual stimulus to unique scholars in the current filtered manifest.
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0d694f]/40 ml-1">Manifest Content</label>
              <Textarea 
                placeholder="Compose your broadcast message here..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="min-h-[150px] bg-[#fcf8f1]/50 border-[#0d694f]/10 rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none transition-all resize-none placeholder:opacity-30"
              />
            </div>
            
            <div className="flex items-center gap-2 px-4 py-3 bg-[#0d694f]/5 rounded-xl border border-[#0d694f]/5">
              <Users className="h-3.5 w-3.5 text-[#0d694f]/60" />
              <span className="text-[10px] font-bold text-[#0d694f]/80 uppercase tracking-widest">
                Targeted: {Array.from(new Set(filteredEnrollments.map(e => e.studentId))).length} Unique Scholars
              </span>
            </div>
          </div>

          <DialogFooter className="relative z-10 mt-8 sm:justify-between gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsBroadcastModalOpen(false)}
              className="flex-1 rounded-xl h-14 text-[10px] font-bold uppercase tracking-wider text-[#0d694f]/40 hover:text-[#ff7e5f] hover:bg-transparent"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBroadcast}
              disabled={isSending || !broadcastMessage.trim()}
              className="flex-2 min-w-[160px] bg-[#0d694f] hover:bg-[#ff7e5f] text-white rounded-2xl h-14 text-[11px] font-bold uppercase tracking-wider shadow-3d-orange border-none flex items-center gap-3 transition-all disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSending ? "SEQUESTERING..." : "DEPLOY BROADCAST"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

InstructorStudents.propTypes = {
  listOfCourses: PropTypes.array.isRequired,
};

export default InstructorStudents;
