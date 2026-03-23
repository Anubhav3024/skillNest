import {
  TrendingUp,
  Users,
  Star,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const InstructorEarnings = () => {
  const stats = [
    {
      label: "NET REVENUE",
      value: "₹1,02,482.00",
      change: "+14.2% yield surge",
      icon: TrendingUp,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5"
    },
    {
      label: "ENROLLMENTS",
      value: "1,248",
      change: "+8.5% growth rate",
      icon: Users,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5"
    },
    {
      label: "AVG. RATING",
      value: "4.92",
      change: "Based on 856 reviews",
      icon: Star,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5"
    },
    {
      label: "STABILITY",
      value: "68%",
      change: "Retention threshold",
      icon: TrendingUp,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5"
    }
  ];

  const paymentHistory = [
    {
      date: "Oct 24, 2024",
      student: "Adrian Locke",
      course: "Mastering Advanced Typography",
      status: "COMPLETED",
      amount: "₹14,900.00",
      avatar: "AL"
    },
    {
      date: "Oct 23, 2024",
      student: "Elena Wright",
      course: "UI/UX Strategy & Operations",
      status: "COMPLETED",
      amount: "₹19,900.00",
      avatar: "EW"
    },
    {
      date: "Oct 21, 2024",
      student: "Marcus Thorne",
      course: "Design Systems for Scale",
      status: "COMPLETED",
      amount: "₹14,900.00",
      avatar: "MS"
    },
    {
      date: "Oct 20, 2024",
      student: "Julian Hart",
      course: "Mastering Advanced Typography",
      status: "PENDING",
      amount: "₹14,900.00",
      avatar: "JH"
    }
  ];

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
            Financial Analytics
          </h1>
          <p className="text-muted-foreground font-medium text-sm italic opacity-70">
            Synthesized yield reports and engagement metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-[#0d694f]/10 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-3d">
             <div className="w-4 h-4 bg-[#0d694f]/5 rounded flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-[#0d694f]" />
             </div>
             <span className="text-[9px] font-black text-[#0d694f] uppercase tracking-widest">30-DAY CYCLE</span>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-white hover:bg-[#0d694f]/5 text-[#0d694f] border border-[#0d694f]/10 rounded-xl px-4 py-4 h-auto aspect-square shadow-3d-orange transition-all border-none">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2rem] border border-[#0d694f]/5 shadow-3d group cursor-default"
          >
            <div className="flex flex-col gap-6">
              <span className="text-[9px] font-black tracking-[0.2em] text-muted-foreground uppercase opacity-40 group-hover:opacity-100 transition-opacity">{stat.label}</span>
              <div className="space-y-1">
                <div className="text-2xl font-headline font-black text-[#0d694f] tracking-tighter">{stat.value}</div>
                <div className="text-[9px] font-black text-[#0d694f]/60 uppercase tracking-widest italic opacity-70">{stat.change}</div>
              </div>
              {stat.label === 'STABILITY' && (
                <div className="w-full h-1 bg-[#fcf8f1] rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "68%" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-primary-gradient rounded-full"
                   ></motion.div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Trends */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-[#0d694f]/5 shadow-3d relative overflow-hidden">
          <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-lg font-headline font-black text-[#0d694f] uppercase tracking-tight">Yield Progression</h3>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0d694f]"></div>
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">ACTIVE</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ff7e5f]"></div>
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">FORMER</span>
               </div>
            </div>
          </div>
          
          <div className="h-80 relative flex items-end justify-between px-6 pb-2 z-10">
             {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'].map((month, i) => (
               <div key={i} className="flex flex-col items-center gap-6 w-full group">
                  <div className="flex gap-1.5 items-end">
                     <div className="w-7 bg-[#0d694f]/5 rounded-t-lg relative h-48 overflow-hidden group-hover:bg-[#0d694f]/10 transition-colors">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${[40, 55, 70, 50, 85, 95][i]}%` }}
                          transition={{ duration: 1.5, delay: 0.6 + (i * 0.1) }}
                          className="absolute bottom-0 left-0 right-0 bg-primary-gradient rounded-t-lg shadow-[0_0_10px_rgba(13,105,79,0.1)]"
                        ></motion.div>
                     </div>
                     <div className="w-7 bg-[#ff7e5f]/5 rounded-t-lg relative h-48 overflow-hidden group-hover:bg-[#ff7e5f]/10 transition-colors">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${[30, 40, 50, 45, 60, 70][i]}%` }}
                          transition={{ duration: 1.5, delay: 0.8 + (i * 0.1) }}
                          className="absolute bottom-0 left-0 right-0 bg-[#ff7e5f]/40 rounded-t-lg"
                        ></motion.div>
                     </div>
                  </div>
                  <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] group-hover:text-[#0d694f] transition-colors">{month}</span>
               </div>
             ))}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-30"></div>
        </motion.div>

        {/* Top Performing */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-[#dfede9] p-10 rounded-[2.5rem] border border-[#0d694f]/10 shadow-3d">
          <h3 className="text-lg font-headline font-black text-[#0d694f] mb-10 uppercase tracking-tight">Prime Assets</h3>
          <div className="space-y-8">
            {[
              { title: "Mastering Advanced Typography", earn: "₹4,29,000.00 earned", img: "https://images.unsplash.com/photo-1541462608141-ad511a7ee596?auto=format&fit=crop&q=80&w=100" },
              { title: "UI/UX Strategy & Operations", earn: "₹3,15,000.00 earned", img: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=100" },
              { title: "Design Systems for Scale", earn: "₹2,84,000.00 earned", img: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=100" }
            ].map((course, index) => (
              <motion.div 
                key={index} 
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-3d border border-white/20 grayscale group-hover:grayscale-0 transition-all duration-700">
                   <img src={course.img} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                   <div className="text-[11px] font-headline font-black text-[#0d694f] truncate uppercase tracking-tight group-hover:text-[#ff7e5f] transition-colors">{course.title}</div>
                   <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1 italic">{course.earn}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="w-full mt-12 text-[9px] font-black text-[#0d694f] hover:text-[#ff7e5f] uppercase tracking-[0.2em] transition-all flex items-center justify-between group/btn">
            ANALYZE ALL VAULTS
            <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </motion.div>
      </div>

      {/* Payment History */}
      <motion.div variants={itemVariants} className="bg-white p-10 rounded-[3rem] border border-[#0d694f]/5 shadow-3d">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <h3 className="text-lg font-headline font-black text-[#0d694f] uppercase tracking-tight">Transaction Manifest</h3>
          <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-[#0d694f] transition-colors" />
             <input 
              type="text" 
              placeholder="Query protocol logs..." 
              className="bg-[#fcf8f1] border border-[#0d694f]/5 rounded-xl pl-11 pr-6 py-3 text-[11px] font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none w-full md:w-72 transition-all"
             />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-[#fcf8f1]">
                <th className="py-5 px-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">EPOCH</th>
                <th className="py-5 px-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">SCHOLAR</th>
                <th className="py-5 px-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">ARCHIVE IDENTIFIER</th>
                <th className="py-5 px-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-center">PROTOCOL</th>
                <th className="py-5 px-6 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-right">VALUATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#fcf8f1]">
              {paymentHistory.map((payment, index) => (
                <motion.tr 
                  key={index} 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="group hover:bg-[#fcf8f1]/50 transition-colors cursor-pointer"
                >
                  <td className="py-6 px-6 text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">{payment.date}</td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#fcf8f1] border border-[#0d694f]/10 flex items-center justify-center text-[9px] font-black text-[#0d694f] shadow-inner group-hover:rotate-6 transition-transform">
                         {payment.avatar}
                      </div>
                      <span className="text-[12px] font-headline font-black text-[#0d694f] uppercase tracking-tight group-hover:text-[#ff7e5f] transition-colors">{payment.student}</span>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-[11px] font-medium text-muted-foreground italic group-hover:text-[#0d694f] transition-colors">{payment.course}</td>
                  <td className="py-6 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${payment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'} group-hover:bg-[#0d694f] group-hover:text-white transition-all`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-right text-[12px] font-headline font-black text-[#0d694f] tracking-tighter">{payment.amount}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-10 flex items-center justify-between border-t border-[#fcf8f1] pt-10">
           <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">INDEX 4 OF 128 ENTRIES</span>
           <div className="flex items-center gap-3">
              <motion.button whileHover={{ y: -2 }} whileTap={{ y: 0 }} className="h-9 px-4 rounded-xl border border-[#0d694f]/5 bg-white text-[9px] font-black uppercase tracking-widest text-[#0d694f] flex items-center gap-2 hover:bg-[#fcf8f1] transition-all shadow-3d"><ChevronLeft className="h-3.5 w-3.5" /> PREVIOUS</motion.button>
              <motion.button whileHover={{ y: -2 }} whileTap={{ y: 0 }} className="h-9 px-4 rounded-xl border border-[#0d694f]/5 bg-white text-[9px] font-black uppercase tracking-widest text-[#0d694f] flex items-center gap-2 hover:bg-[#fcf8f1] transition-all shadow-3d">NEXT <ChevronRight className="h-3.5 w-3.5" /></motion.button>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InstructorEarnings;
