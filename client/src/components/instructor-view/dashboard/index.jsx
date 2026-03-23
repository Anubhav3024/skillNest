import {
  TrendingUp,
  Users,
  Star,
  Download,
  MessageSquare,
  UserPlus,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const InstructorDashboard = ({ listOfCourses, analytics, auth }) => {
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
    revenue: `₹${(course.students?.length || 0) * course.pricing}`,
    status: course.isPublised ? "ACTIVE" : "DRAFT",
    image: course.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=100&h=100"
  })) || [];

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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-headline font-black text-[#0d694f] tracking-tighter mb-1 uppercase">
            Greetings, {auth?.user?.userName?.split(' ')[0] || 'Educator'}.
          </h1>
          <p className="text-muted-foreground font-medium text-sm italic opacity-70">
            Curriculum engagement has surged by 12% this cycle.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="bg-white hover:bg-[#0d694f]/5 text-[#0d694f] border border-[#0d694f]/10 rounded-xl px-6 py-4 h-auto font-headline font-black text-[9px] tracking-widest shadow-3d-orange border-none uppercase">
            <Download className="h-3.5 w-3.5 mr-2" />
            ANALYTIC EXPORT
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <span className="text-[9px] font-black tracking-[0.2em] text-muted-foreground uppercase opacity-40 group-hover:opacity-100 transition-opacity">{stat.label}</span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-headline font-black text-[#0d694f] tracking-tighter">{stat.value}</div>
              <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{stat.change}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Earnings Performance */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-[#0d694f]/5 shadow-3d relative overflow-hidden">
          <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-lg font-headline font-black text-[#0d694f] uppercase tracking-tight">Financial Trajectory</h3>
            <select 
              value={selectedRange}
              onChange={(e) => onRangeChange(e.target.value)}
              className="bg-[#fcf8f1] border border-[#0d694f]/10 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer hover:border-[#0d694f]/20 transition-all"
            >
              <option value="30d">Last 30 Days</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          
          <div className="h-64 relative flex items-end justify-between px-4 pb-8 z-10">
            {analytics?.monthlyRevenue?.map((data, i) => {
              const maxRevenue = Math.max(...analytics.monthlyRevenue.map(r => r.revenue), 1);
              const heightPercentage = (data.revenue / maxRevenue) * 100;

              return (
                <div key={i} className="flex flex-col items-center gap-4 w-full group">
                  <div className="w-full max-w-[32px] bg-[#fcf8f1] rounded-t-lg relative overflow-hidden h-40 group-hover:bg-[#0d694f]/5 transition-colors">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPercentage, 5)}%` }} // Minimum height for visibility
                      transition={{ duration: 1.5, delay: 0.2 + (i * 0.05) }}
                      className="absolute bottom-0 left-0 right-0 bg-primary-gradient shadow-[0_0_15px_rgba(13,105,79,0.2)]"
                    ></motion.div>
                  </div>
                  <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest group-hover:text-[#0d694f] transition-colors">{data.label}</span>
                </div>
              );
            })}
            {!analytics?.monthlyRevenue && (
              <div className="w-full text-center text-muted-foreground opacity-30 text-[10px] uppercase font-black tracking-widest pb-12">
                No financial projections available
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-[#dfede9] p-10 rounded-[2.5rem] border border-[#0d694f]/10 shadow-3d">
          <h3 className="text-lg font-headline font-black text-[#0d694f] mb-10 uppercase tracking-tight">System Logs</h3>
          <div className="space-y-8">
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
                  <div className="text-[11px] font-headline font-black text-[#0d694f] leading-tight group-hover:text-[#ff7e5f] transition-colors uppercase tracking-wider">{activity.title}</div>
                  <div className="text-[10px] text-muted-foreground font-medium italic opacity-70">{activity.desc}</div>
                  <div className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mt-2">{activity.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="w-full mt-10 text-[9px] font-black text-[#0d694f] hover:text-[#ff7e5f] uppercase tracking-[0.2em] p-0 transition-all text-left flex items-center gap-2 group/btn">
            MANIFEST ALL LOGS 
            <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </motion.div>
      </div>

      {/* Best Performing Courses */}
      <motion.div variants={itemVariants} className="bg-white p-10 rounded-[2.5rem] border border-[#0d694f]/5 shadow-3d">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-lg font-headline font-black text-[#0d694f] uppercase tracking-tight">Top Manifestations</h3>
          <button className="text-[9px] font-black text-muted-foreground/60 hover:text-[#ff7e5f] uppercase tracking-[0.2em] flex items-center gap-2 transition-all group/all">
            MANAGE VAULTS <ArrowRight className="h-3 w-3 transition-transform group-hover/all:translate-x-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-[#fcf8f1]">
                <th className="pb-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">IDENTIFIER</th>
                <th className="pb-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-center">TRAFFIC</th>
                <th className="pb-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-center">STABILITY</th>
                <th className="pb-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-center">REVENUE</th>
                <th className="pb-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-right">PROTOCOL</th>
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
                  <td className="py-6 pr-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#0d694f]/5 bg-[#fcf8f1] group-hover:scale-105 transition-transform duration-500">
                        <img src={course.image} alt="" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                      </div>
                      <div>
                        <div className="text-[12px] font-headline font-black text-[#0d694f] mb-0.5 uppercase tracking-tight group-hover:text-[#ff7e5f] transition-colors">{course.title}</div>
                        <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">{course.lessons} ACTIVE</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 text-center text-[12px] font-headline font-black text-[#0d694f] tracking-tight">{course.sales}</td>
                  <td className="py-6 px-4">
                    <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                      <div className="text-[9px] font-black text-[#0d694f] uppercase tracking-widest opacity-60">{course.completion}</div>
                      <div className="w-full h-1 bg-[#fcf8f1] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: course.completion }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-[#0d694f] rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 text-center text-[12px] font-headline font-black text-[#0d694f] tracking-tight">{course.revenue}</td>
                  <td className="py-6 text-right">
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-emerald-100/50 group-hover:bg-[#0d694f] group-hover:text-white transition-all">
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
    </motion.div>
  );
};

InstructorDashboard.propTypes = {
  listOfCourses: PropTypes.array,
  analytics: PropTypes.object,
  auth: PropTypes.object.isRequired,
  onRangeChange: PropTypes.func,
  selectedRange: PropTypes.string,
};

export default InstructorDashboard;
