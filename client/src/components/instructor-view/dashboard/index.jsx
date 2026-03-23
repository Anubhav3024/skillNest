import {
  TrendingUp,
  Users,
  Star,
  MessageSquare,
  UserPlus,
  ArrowRight,
  IndianRupee,
  Globe,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useContext } from "react";
import { InstructorContext } from "@/context/instructor-context";
import { useNavigate } from "react-router-dom";

const InstructorDashboard = ({ 
  listOfCourses, 
  analytics,
  auth
}) => {
  const navigate = useNavigate();
  const { deleteCourse, fetchInstructorCourseList } = useContext(InstructorContext);

  async function handleDeleteCourse(courseId) {
    if (window.confirm("Are you certain you wish to delete this curriculum vault? This action is irreversible.")) {
      const success = await deleteCourse(courseId, auth?.user?._id);
      if (success) {
         fetchInstructorCourseList(auth?.user?._id);
      }
    }
  }

  const stats = [
    {
      label: "TOTAL REVENUE",
      value: `₹${analytics?.totalRevenue || 0}`,
      change: "Lifetime Earnings",
      icon: TrendingUp,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5"
    },
    {
      label: "TOTAL SCHOLARS",
      value: analytics?.totalStudents || 0,
      change: "Enrolled Students",
      icon: Users,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5"
    },
    {
      label: "COURSE RATING",
      value: analytics?.avgRating ? `${analytics.avgRating} / 5.0` : "0.0 / 5.0",
      change: analytics?.avgRating ? "Platform Average" : "No Reviews Yet",
      icon: Star,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5"
    }
  ];

  const recentActivity = [
    {
      icon: MessageSquare,
      title: 'System Online',
      desc: 'Dashboard synchronized successfully.',
      time: "JUST NOW",
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      icon: UserPlus,
      title: `${listOfCourses?.length || 0} Vaults Active`,
      desc: 'Your course inventory is ready.',
      time: "SESSIONS SYNCED",
      color: "bg-indigo-50 text-indigo-600"
    }
  ];

  const bestPerformingCourses = listOfCourses?.slice(0, 5).map(course => ({
    title: course.title,
    duration: "N/A",
    lessons: `${course.curriculum?.length || 0} Lectures`,
    sales: course.students?.length || 0,
    completion: "75%", 
    revenue: `₹${(course.students?.length || 0) * (course.pricing || 0)}`,
    status: course.isPublished ? "ACTIVE" : "DRAFT",
    image: course.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=100&h=100"
  })) || [];

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Welcome Message Header */}
      <motion.div variants={itemVariants} className="pb-8 border-b border-[#0d694f]/5">
        <p className="text-xl md:text-2xl font-headline font-semibold text-[#0d694f] tracking-tight leading-tight">
          Welcome back, {auth?.user?.userName || 'Educator'}. Your intellectual vaults are synchronized and active.
        </p>
      </motion.div>

      {/* Educator Profile Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-[3.5rem] p-8 md:p-12 border border-[#0d694f]/5 shadow-3d relative overflow-hidden group"
      >
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#fcf8f1] shadow-xl overflow-hidden bg-[#fcf8f1]">
              <img 
                src={auth?.user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200"} 
                alt="Educator Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#ff7e5f] rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white transition-transform group-hover:scale-110">
              <Globe className="h-4 w-4" />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-[#ff7e5f] uppercase tracking-wider opacity-80">Certified Educator</div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold text-[#0d694f] uppercase tracking-tighter leading-none">
                {auth?.user?.userName || 'Educator'}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground/60 text-xs font-medium italic">
                <Globe className="h-3 w-3" />
                <span>{auth?.user?.userEmail}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-4 border-t border-[#0d694f]/5">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[#ff7e5f] uppercase tracking-wider">Experience Tier</div>
                <div className="text-[14px] font-headline font-bold text-[#0d694f] uppercase tracking-tight leading-normal">
                  {auth?.user?.experience || '2 YEAR'} YEARS IN THE VAULT
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[#ff7e5f] uppercase tracking-wider">Philosophy Manifest</div>
                <p className="text-[11px] font-semibold text-muted-foreground/60 italic leading-relaxed max-w-xs">
                  &quot;{auth?.user?.philosophy || 'Experienced educator delivering engaging, practical learning experiences, simplifying complex concepts...'}&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fcf8f1] border border-[#0d694f]/5 flex items-center justify-center text-[#0d694f]/30 hover:text-[#0d694f] hover:border-[#0d694f]/20 transition-all shadow-sm">
              <Globe className="h-5 w-5" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#fcf8f1] border border-[#0d694f]/5 flex items-center justify-center text-[#0d694f]/30 hover:text-[#0d694f] hover:border-[#0d694f]/20 transition-all shadow-sm">
              <Database className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fcf8f1] rounded-full blur-[100px] -mr-32 -mt-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0d694f]/5 rounded-full blur-[80px] -ml-24 -mb-24 opacity-30"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2rem] border border-[#0d694f]/5 shadow-3d group cursor-default"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} transition-transform group-hover:rotate-6 shadow-sm`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase opacity-60 group-hover:opacity-100 transition-opacity">{stat.label}</span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-headline font-bold text-[#0d694f] tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{stat.change}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Vault Command Center - Dynamic Horizontal Scroller */}
      <motion.div variants={itemVariants} className="bg-white p-10 rounded-[3rem] border border-[#0d694f]/10 shadow-3d relative overflow-hidden group/vault">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
          <div>
            <h2 className="text-2xl font-headline font-bold text-[#0d694f] uppercase tracking-tighter mb-1">
              Vault Command Center
            </h2>
            <p className="text-muted-foreground font-medium text-xs italic opacity-70">
              Orchestrate your intellectual manifestations in real-time.
            </p>
          </div>
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="w-12 h-12 bg-primary-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#0d694f]/20"
          >
            <TrendingUp className="h-5 w-5" />
          </motion.div>
        </div>
        
        <div className="relative z-10 w-full">
          <div className="flex gap-8 overflow-x-auto pb-8 pt-4 custom-scrollbar snap-x snap-mandatory">
            {listOfCourses && listOfCourses.length > 0 ? (
              listOfCourses.map((course) => (
                <motion.div 
                  key={course._id}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="min-w-[340px] bg-gradient-to-br from-white to-[#fcf8f1] rounded-[2.5rem] p-5 border border-[#0d694f]/10 shadow-xl snap-start group relative transition-all duration-500 hover:border-[#0d694f]/30"
                >
                  <div className="relative aspect-video rounded-[2.2rem] overflow-hidden mb-6 shadow-2xl border border-white/50 bg-[#f3efe5]">
                    <img 
                      src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                    <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full backdrop-blur-md text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-lg ${course.isPublished ? 'bg-emerald-500/90 text-white' : 'bg-[#ff7e5f]/90 text-white'}`}>
                      {course.isPublished ? 'ACTIVE' : 'DRAFT'}
                    </div>
                  </div>

                  <div className="px-2 space-y-6">
                    <div className="space-y-2">
                       <h3 className="text-base font-headline font-black text-[#0d694f] uppercase tracking-tight line-clamp-1 group-hover:text-[#ff7e5f] transition-colors">
                        {course.title || "UNTITLED MANIFEST"}
                      </h3>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-[#0d694f]/5 flex items-center justify-center border border-[#0d694f]/5">
                               <Users className="h-3.5 w-3.5 text-[#0d694f]/60" />
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{course.students?.length || 0} Scholars</span>
                         </div>
                         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fcf8f1] rounded-xl border border-[#0d694f]/5">
                            <IndianRupee className="h-3 w-3 text-[#ff7e5f]" />
                            <span className="text-sm font-headline font-black text-[#0d694f]">{course.pricing || 'FREE'}</span>
                         </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <Button 
                        onClick={() => navigate(`/instructor/edit-course/${course?._id}`)}
                        className="flex-1 rounded-2xl bg-[#0d694f] hover:bg-[#ff7e5f] text-white shadow-3d-orange border-none text-[11px] font-bold uppercase tracking-wider h-auto py-4.5 transition-all group/btn"
                      >
                        Revise Manifest
                        <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleDeleteCourse(course._id)}
                        className="rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider h-auto px-6 py-4 shadow-sm border border-red-100 hover:border-red-600"
                      >
                        Erase
                      </Button>
                    </div>
                  </div>
                  
                  {/* Decorative Gradient Glow */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#ff7e5f]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.div>
              ))
            ) : (
              <div className="w-full py-20 text-center bg-[#fcf8f1]/50 rounded-[3rem] border-2 border-dashed border-[#0d694f]/10">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                   <UserPlus className="h-6 w-6 text-[#0d694f]/20" />
                </div>
                <p className="text-[10px] font-black text-[#0d694f]/40 uppercase tracking-[0.3em]">No active manifests detected</p>
                <Button 
                   onClick={() => navigate("/instructor/create-new-course")}
                   className="mt-8 bg-transparent hover:bg-[#0d694f]/5 text-[#0d694f] border border-[#0d694f]/10 rounded-xl px-8 h-auto py-3.5 text-[9px] font-black uppercase tracking-widest"
                >
                   Initiate Upload
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0d694f]/5 rounded-full blur-[120px] -mr-48 -mt-48 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ff7e5f]/5 rounded-full blur-[120px] -ml-48 -mb-48 opacity-30"></div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-[#dfede9] p-8 rounded-2xl border border-[#0d694f]/10 shadow-3d">
          <h3 className="text-lg font-headline font-bold text-[#0d694f] mb-8 uppercase tracking-tight">System Logs</h3>
          <div className="space-y-6">
            {recentActivity.map((activity, index) => (
              <motion.div 
                key={index} 
                whileHover={{ x: 4 }}
                className="flex gap-4 group cursor-pointer"
              >
                <div className={`w-9 h-9 rounded-full ${activity.color} flex items-center justify-center flex-shrink-0 shadow-sm border border-black/5 group-hover:rotate-6 transition-transform`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[12px] font-headline font-bold text-[#0d694f] leading-tight group-hover:text-[#ff7e5f] transition-colors uppercase tracking-tight">{activity.title}</div>
                  <div className="text-[11px] text-muted-foreground font-medium italic opacity-70">{activity.desc}</div>
                  <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-wider mt-2">{activity.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="w-full mt-10 text-[9px] font-black text-[#0d694f] hover:text-[#ff7e5f] uppercase tracking-[0.2em] p-0 transition-all text-left flex items-center gap-2 group/btn">
            MANIFEST ALL LOGS 
            <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </motion.div>

        {/* Best Performing Courses */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white p-8 rounded-2xl border border-[#0d694f]/5 shadow-3d">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-headline font-bold text-[#0d694f] uppercase tracking-tight">Top Manifestations</h3>
            <button 
              onClick={() => navigate('/instructor/courses')}
              className="text-[9px] font-black text-muted-foreground/60 hover:text-[#ff7e5f] uppercase tracking-[0.2em] flex items-center gap-2 transition-all group/all"
            >
              MANAGE VAULTS <ArrowRight className="h-3 w-3 transition-transform group-hover/all:translate-x-1" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#fcf8f1]">
                  <th className="pb-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">IDENTIFIER</th>
                  <th className="pb-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider text-center">TRAFFIC</th>
                  <th className="pb-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider text-center">STABILITY</th>
                  <th className="pb-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider text-center">REVENUE</th>
                  <th className="pb-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider text-right">PROTOCOL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#fcf8f1]">
                {bestPerformingCourses.map((course, index) => (
                  <motion.tr 
                    key={index} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="group hover:bg-[#fcf8f1]/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#0d694f]/5 bg-[#fcf8f1] group-hover:scale-105 transition-transform duration-500">
                          <img src={course.image} alt="" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                        </div>
                        <div>
                          <div className="text-[13px] font-headline font-bold text-[#0d694f] mb-0.5 uppercase tracking-tight group-hover:text-[#ff7e5f] transition-colors">{course.title}</div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-40">{course.lessons} ACTIVE</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center text-[12px] font-headline font-black text-[#0d694f] tracking-tight">{course.sales}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                        <div className="text-[9px] font-black text-[#0d694f] uppercase tracking-widest opacity-60">{course.completion}</div>
                        <div className="w-full h-1 bg-[#fcf8f1] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: course.completion }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-primary-gradient rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center text-[12px] font-headline font-black text-[#0d694f] tracking-tight">{course.revenue}</td>
                    <td className="py-3.5 text-right">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border transition-all ${course.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-[#0d694f] group-hover:text-white' : 'bg-red-50 text-red-600 border-red-100 group-hover:bg-[#ff7e5f] group-hover:text-white'}`}>
                        {course.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                {bestPerformingCourses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
                      No active archives detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

InstructorDashboard.propTypes = {
  listOfCourses: PropTypes.array,
  analytics: PropTypes.object,
  auth: PropTypes.object.isRequired,
};

export default InstructorDashboard;
