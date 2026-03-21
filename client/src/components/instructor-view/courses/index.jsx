import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";

import { InstructorContext } from "@/context/instructor-context";
import { Trash2, Edit3, Plus, Users, IndianRupee, BookOpen } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const InstructorCourses = ({ listOfCourses }) => {
  const navigate = useNavigate();

  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
  } = useContext(InstructorContext);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[3rem] border border-[#0d694f]/5 shadow-2xl shadow-emerald-950/5 overflow-hidden">
        <div className="p-10 lg:p-12 border-b border-[#fcf8f1] flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-[0.2em]">
                 Asset Management
                 <span className="w-12 h-px bg-[#ff7e5f]/30"></span>
              </div>
              <h3 className="text-3xl font-headline font-black text-[#0d694f]">Course Inventory</h3>
           </div>
           
           <Button
             className="bg-[#0d694f] hover:bg-[#ff7e5f] text-white rounded-2xl px-10 py-7 font-headline font-black text-[11px] tracking-widest uppercase shadow-xl shadow-[#0d694f]/20 transition-all border-none group"
             onClick={() => {
               setCurrentEditedCourseId(null);
               setCourseCurriculumFormData(courseCurriculumInitialFormData);
               setCourseLandingFormData(courseLandingInitialFormData);
               navigate("/instructor/create-new-course");
             }}
           >
             <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
             PUBLISH NEW VAULT
           </Button>
        </div>

        <div className="p-10 lg:p-12">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#0d694f]/10 hover:bg-transparent">
                  <TableHead className="font-headline font-black text-[#0d694f] text-[10px] tracking-widest uppercase py-6">Course Identity</TableHead>
                  <TableHead className="font-headline font-black text-[#0d694f] text-[10px] tracking-widest uppercase py-6 text-center">Scholars</TableHead>
                  <TableHead className="font-headline font-black text-[#0d694f] text-[10px] tracking-widest uppercase py-6 text-center">Earnings</TableHead>
                  <TableHead className="text-right font-headline font-black text-[#0d694f] text-[10px] tracking-widest uppercase py-6">Modifications</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listOfCourses && listOfCourses.length > 0 ? (
                  listOfCourses.map((course) => (
                    <TableRow 
                      key={course._id}
                      className="border-b border-[#fcf8f1] hover:bg-[#fcf8f1]/50 transition-colors duration-300 group"
                    >
                      <TableCell className="py-8">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#fcf8f1] border border-[#0d694f]/5 flex items-center justify-center text-[#ff7e5f] shadow-sm transform group-hover:rotate-3 transition-transform">
                               <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                               <div className="font-headline font-black text-[#0d694f] text-lg leading-tight group-hover:text-[#ff7e5f] transition-colors">{course?.title}</div>
                               <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Status: Published</div>
                            </div>
                         </div>
                      </TableCell>
                      <TableCell className="text-center py-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#fcf8f1] border border-[#0d694f]/5 text-[#0d694f] font-black text-[10px] uppercase tracking-widest shadow-sm">
                           <Users className="h-3 w-3" />
                           {course?.students?.length} Enrolled
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-8">
                        <div className="font-headline font-black text-lg text-[#0d694f]">
                           Rs {course?.students?.length * course?.pricing}
                        </div>
                        <div className="text-[9px] font-black text-[#ff7e5f] uppercase tracking-widest">Gross Revenue</div>
                      </TableCell>
                      <TableCell className="text-right py-8">
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-12 h-12 rounded-xl border border-[#0d694f]/5 bg-white text-[#0d694f] hover:bg-[#0d694f] hover:text-white transition-all shadow-sm group-hover:shadow-md"
                            onClick={() => {
                              navigate(
                                `/instructor/edit-course/${course?._id}`
                              );
                            }}
                          >
                            <Edit3 className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="w-12 h-12 rounded-xl border border-destructive/10 bg-white text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                     <TableCell colSpan={4} className="py-24 text-center">
                        <div className="max-w-xs mx-auto">
                           <div className="w-20 h-20 bg-[#fcf8f1] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#0d694f]/10 shadow-inner">
                              <BookOpen className="h-8 w-8 text-[#0d694f]/20" />
                           </div>
                           <h4 className="text-xl font-headline font-black text-[#0d694f] mb-2">Inventory Empty</h4>
                           <p className="text-muted-foreground text-sm font-medium mb-8">Ready to share your knowledge with the world?</p>
                           <Button 
                              onClick={() => navigate("/instructor/create-new-course")}
                              variant="ghost" 
                              className="text-[#ff7e5f] font-black text-[10px] tracking-widest uppercase hover:bg-transparent hover:underline"
                           >
                              Begin Drafting
                           </Button>
                        </div>
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorCourses;
