import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianRupee, Users, TrendingUp, ArrowRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

const InstructorDashboard = ({ listOfCourses, analytics }) => {
  const calculateTotalStudentsAndRevenue = useCallback(() => {
    const { totalStudents, totalRevenue, studentList } = listOfCourses.reduce(
      (acc, course) => {
        const studentCount = course.students.length;
        acc.totalStudents += studentCount;
        acc.totalRevenue += course.pricing * studentCount;

        course.students.forEach((student) => {
          acc.studentList.push({
            courseTitle: course.title,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
          });
        });
        return acc;
      },
      {
        totalStudents: 0,
        totalRevenue: 0,
        studentList: [],
      },
    );
    return {
      totalStudents,
      totalRevenue,
      studentList,
    };
  }, [listOfCourses]);

  const [config, setConfig] = useState([
    {
      icon: Users,
      label: "Total Students",
      value: 0,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5"
    },
    {
      icon: IndianRupee,
      label: "Total Revenue",
      value: 0,
      color: "text-[#ff7e5f]",
      bg: "bg-[#ff7e5f]/5"
    },
  ]);

  const [studentList, setStudentList] = useState([]);

  useEffect(() => {
    if (analytics) {
      setConfig([
        {
          icon: Users,
          label: "Total Students",
          value: analytics.totalStudents || 0,
          color: "text-[#0d694f]",
          bg: "bg-[#0d694f]/5"
        },
        {
          icon: IndianRupee,
          label: "Total Revenue",
          value: analytics.totalRevenue || 0,
          color: "text-[#ff7e5f]",
          bg: "bg-[#ff7e5f]/5"
        },
      ]);

      const studentsFromAnalytics = (analytics.revenuePerCourse || []).flatMap(
        (course) =>
          (listOfCourses || [])
            .find((item) => String(item._id) === String(course.courseId))
            ?.students?.map((student) => ({
              courseTitle: course.title,
              studentName: student.studentName,
              studentEmail: student.studentEmail,
            })) || [],
      );

      setStudentList(studentsFromAnalytics);
      return;
    }

    const result = calculateTotalStudentsAndRevenue();

    setConfig([
      {
        icon: Users,
        label: "Total Students",
        value: result.totalStudents,
        color: "text-[#0d694f]",
        bg: "bg-[#0d694f]/5"
      },
      {
        icon: IndianRupee,
        label: "Total Revenue",
        value: result.totalRevenue,
        color: "text-[#ff7e5f]",
        bg: "bg-[#ff7e5f]/5"
      },
    ]);

    setStudentList(result.studentList);
  }, [listOfCourses, analytics]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {config.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-[2.5rem] p-10 border border-[#0d694f]/5 shadow-xl shadow-emerald-950/5 hover:shadow-emerald-950/10 transition-all duration-500 group relative overflow-hidden"
          >
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#0d694f]/2 rounded-full blur-3xl group-hover:bg-[#0d694f]/5 transition-colors"></div>
             
             <div className="flex justify-between items-start mb-10">
                <div>
                   <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground ml-1">{item.label}</span>
                   <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-5xl font-headline font-black text-[#0d694f] tracking-tighter">
                         {item.label === 'Total Revenue' ? `Rs ${item.value}` : item.value}
                      </span>
                   </div>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${item.bg} border border-[#0d694f]/5 flex items-center justify-center ${item.color} shadow-sm transition-transform group-hover:scale-110`}>
                   <item.icon className="h-6 w-6" />
                </div>
             </div>
             
             <div className="flex items-center gap-2 text-[#0d694f] text-[10px] font-black uppercase tracking-widest bg-[#fcf8f1] w-fit px-4 py-2 rounded-xl border border-[#0d694f]/5">
                <TrendingUp className="h-3 w-3" />
                Live Performance
             </div>
          </div>
        ))}
        
        {/* Third Card Placeholder for Aesthetic Balance */}
        <div className="bg-[#0d694f] rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-950/20 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Users className="h-24 w-24 text-white" />
           </div>
           <div className="space-y-2 relative z-10">
              <h4 className="text-2xl font-headline font-black text-white leading-tight">Expansion <br />Mastery</h4>
              <p className="text-white/40 text-[10px] font-black tracking-widest uppercase">Global Reach Potential</p>
           </div>
           <div className="flex items-center justify-between text-white/60 text-[10px] font-black uppercase tracking-widest pt-8 border-t border-white/10 mt-8 relative z-10">
              <span>View Insights</span>
              <ArrowRight className="h-4 w-4" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 lg:p-12 border border-[#0d694f]/5 shadow-2xl shadow-emerald-950/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
           <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-[0.2em]">
                 Enrolled Scholars
                 <span className="w-12 h-px bg-[#ff7e5f]/30"></span>
              </div>
              <h3 className="text-3xl font-headline font-black text-[#0d694f]">Active Student Base</h3>
           </div>
           <button className="bg-[#0d694f] hover:bg-[#ff7e5f] text-white rounded-2xl px-8 py-5 font-headline font-black text-[10px] tracking-widest uppercase shadow-xl shadow-[#0d694f]/10 transition-all border-none">
              EXPORT ROSTER
           </button>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-[#0d694f]/10 hover:bg-transparent">
                <TableHead className="font-headline font-black text-[#0d694f] text-[10px] tracking-widest uppercase py-6">
                  Vault Entry (Course)
                </TableHead>
                <TableHead className="font-headline font-black text-[#0d694f] text-[10px] tracking-widest uppercase py-6">
                  Scholar Name
                </TableHead>
                <TableHead className="font-headline font-black text-[#0d694f] text-[10px] tracking-widest uppercase py-6 text-right">
                  Communication
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentList.map((studentItem, index) => (
                <TableRow
                  key={index}
                  className="border-b border-[#fcf8f1] hover:bg-[#fcf8f1]/50 transition-colors duration-300 group"
                >
                  <TableCell className="font-headline font-bold text-[#0d694f] py-6">
                    {studentItem?.courseTitle}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium py-6">
                    {studentItem?.studentName}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium py-6 text-right">
                    <span className="bg-[#fcf8f1] px-4 py-2 rounded-xl text-xs border border-[#0d694f]/5 group-hover:bg-white group-hover:border-[#0d694f]/20 transition-all">
                       {studentItem?.studentEmail}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {studentList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-20 text-center text-muted-foreground font-medium italic">
                    No scholars have entered your vault yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
