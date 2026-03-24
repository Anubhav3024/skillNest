import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  LayoutDashboard, 
  Users, 
  IndianRupee, 
  BookOpen, 
  Settings,
  Download,
  Pause,
  Play,
  Archive,
  Star,
  TrendingUp,
  Activity,
  Plus,
  Trash2
} from "lucide-react";
import { InstructorContext } from "@/context/instructor-context";
import { instructorFetchVaultDetailedAnalyticsService } from "@/services";

const VaultDetailedView = ({ courseId, onBack }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [vaultData, setVaultData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { updateCourse } = useContext(InstructorContext);

  useEffect(() => {
    async function fetchVaultDetails() {
      setLoading(true);
      const data = await instructorFetchVaultDetailedAnalyticsService(courseId);
      if (data?.success) {
        setVaultData(data.data);
      }
      setLoading(false);
    }
    fetchVaultDetails();
  }, [courseId]);

  const handleStatusChange = async (newStatus) => {
    if (window.confirm(`Are you certain you wish to ${newStatus} this manifestation?`)) {
      const response = await updateCourse(courseId, { status: newStatus });
      if (response?.success) {
        setVaultData(prev => ({
          ...prev,
          course: { ...prev.course, status: newStatus }
        }));
      }
    }
  };

  const handleDownloadReport = () => {
    // Reference the backend export endpoint
    window.open(`${import.meta.env.VITE_API_URL}/api/analytics/export?courseId=${courseId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-[#ff7e5f]/10 border-t-[#ff7e5f] rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-40">Synchronizing Vault Data...</p>
      </div>
    );
  }

  const { course, stats, revenueBreakdown, students } = vaultData;

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "students", label: "Scholars", icon: Users },
    { id: "revenue", label: "Revenue", icon: IndianRupee },
    { id: "content", label: "Manifest", icon: BookOpen },
    { id: "settings", label: "Control", icon: Settings },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white border border-[#0d694f]/10 flex items-center justify-center text-[#0d694f] shadow-sm hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div className="space-y-1">
            <h1 className="text-2xl font-headline font-black text-[#0d694f] uppercase tracking-tighter leading-none">
              {course.title}
            </h1>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Vault ID: {courseId.slice(-8)}</span>
               <div className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                 course.status === 'paused' ? 'bg-amber-100 text-amber-700' : 
                 course.status === 'archived' ? 'bg-zinc-100 text-zinc-700' : 
                 'bg-emerald-100 text-emerald-700'
               }`}>
                  {course.status || 'ACTIVE'}
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {course.status === 'active' ? (
            <button 
              onClick={() => handleStatusChange('paused')}
              className="px-6 py-3 rounded-2xl bg-white border border-amber-500/20 text-amber-600 font-headline font-bold text-[10px] uppercase tracking-widest hover:bg-amber-50 transition-all flex items-center gap-2"
            >
              <Pause className="h-3 w-3" /> PAUSE
            </button>
          ) : course.status === 'paused' ? (
            <button 
              onClick={() => handleStatusChange('active')}
              className="px-6 py-3 rounded-2xl bg-[#0d694f] text-white font-headline font-bold text-[10px] uppercase tracking-widest hover:bg-[#0d694f]/90 transition-all flex items-center gap-2"
            >
              <Play className="h-3 w-3" /> RESUME
            </button>
          ) : null}
          
          {course.status !== 'archived' && (
            <button 
              onClick={() => handleStatusChange('archived')}
              className="px-6 py-3 rounded-2xl bg-white border border-red-500/20 text-red-600 font-headline font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
            >
              <Archive className="h-3 w-3" /> ARCHIVE
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-[#1a2d24]/5 p-1.5 rounded-[2rem] w-fit backdrop-blur-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] transition-all duration-500 ${
              activeTab === tab.id 
              ? "bg-[#0d694f] text-white shadow-xl shadow-[#0d694f]/20 scale-105" 
              : "text-[#0d694f]/40 hover:text-[#0d694f] hover:bg-white/50"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="min-h-[500px]"
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Grid */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard label="TOTAL SCHOLARS" value={stats.totalStudents} icon={Users} color="emerald" trend="+12% this month" />
                <StatCard label="STABILITY SCORE" value={`${stats.stabilityScore}%`} icon={Activity} color="indigo" desc="Engagement Consistency" />
                <StatCard label="CONVERSION RATE" value={`${stats.conversionRate}%`} icon={TrendingUp} color="orange" desc="Views to Enrollments" />
                <StatCard label="CUMULATIVE REVENUE" value={`₹${stats.totalRevenue}`} icon={IndianRupee} color="emerald" trend="Lifetime Manifestations" />
                
                {/* Visual Chart Placeholder */}
                <div className="col-span-full bg-white rounded-[2.5rem] border border-[#0d694f]/5 p-8 h-[300px] flex flex-col justify-center items-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-[#fcf8f1] to-white opacity-50"></div>
                   <Activity className="h-12 w-12 text-[#ff7e5f]/20 mb-4 animate-pulse" />
                   <p className="text-[11px] font-black uppercase tracking-widest text-[#0d694f]/30 relative z-10 text-center">
                     Engagement Trajectory Visualizer <br />
                     <span className="text-[9px] opacity-60 italic normal-case font-medium">Real-time data synchronization enabled</span>
                   </p>
                   {/* Decorative lines mock */}
                   <div className="absolute inset-x-0 bottom-0 h-32 opacity-10 flex items-end gap-1 px-8 pb-8">
                      {[40, 70, 45, 90, 65, 80, 50, 100, 85, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-[#0d694f] rounded-t-lg" style={{ height: `${h}%` }}></div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-8">
                 <div className="bg-[#0d694f] rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="space-y-2 relative z-10">
                       <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Vault Configuration</h3>
                       <p className="text-xl font-headline font-bold leading-tight uppercase">{course.category} Manifest</p>
                    </div>
                    <div className="space-y-4 relative z-10">
                       <p className="text-xs font-medium text-white/60 leading-relaxed italic">
                         Your {course.level} level curriculum is currently resonating with {stats.totalStudents} scholars worldwide.
                       </p>
                       <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase">Global Resonance</span>
                          <div className="flex gap-0.5">
                             {[1,2,3,4,5].map(s => <Star key={s} className="h-2 w-2 fill-white text-white" />)}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white rounded-[2.5rem] p-8 border border-[#0d694f]/5 space-y-6 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d694f] mb-4">Core Strengths</h3>
                    <div className="space-y-4">
                       <StrengthBar label="Instruction Clarity" value={92} />
                       <StrengthBar label="Resource Value" value={78} />
                       <StrengthBar label="Student Engagement" value={85} />
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="bg-white rounded-[2.5rem] border border-[#0d694f]/5 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-[#0d694f]/5 flex items-center justify-between bg-gradient-to-r from-[#fcf8f1] to-transparent">
                 <h3 className="text-lg font-headline font-bold text-[#0d694f] uppercase tracking-tight">Active Scholars ({students.length})</h3>
                 <button className="text-[10px] font-black text-[#ff7e5f] hover:underline uppercase tracking-widest">Filter Audience</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#fcf8f1]/50">
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Scholar</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">Progress</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">Enrolled</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest text-right">Investment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, i) => (
                      <tr key={i} className="hover:bg-[#fcf8f1]/30 transition-colors border-b border-[#0d694f]/5">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#0d694f]/5 flex items-center justify-center text-[#0d694f] font-black text-xs">
                              {student.userName?.[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#0d694f] uppercase">{student.userName}</span>
                              <span className="text-[9px] font-medium text-muted-foreground italic leading-none">{student.userEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className="w-32 mx-auto space-y-1.5">
                             <div className="w-full h-1 bg-[#0d694f]/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#ff7e5f] rounded-full" style={{ width: '65%' }}></div>
                             </div>
                             <span className="text-[9px] font-black text-[#0d694f] opacity-40">65% ARCHIVED</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="text-[10px] font-bold text-muted-foreground opacity-60">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right font-headline font-bold text-[#0d694f] text-xs">
                           ₹{student.coursePricing}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "revenue" && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {revenueBreakdown.slice(0, 4).map((item, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-6 border border-[#0d694f]/5 space-y-3 hover:shadow-xl transition-all group">
                       <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                          {new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                       </p>
                       <h4 className="text-2xl font-headline font-black text-[#0d694f] group-hover:text-[#ff7e5f] transition-colors tracking-tight italic">₹{item.revenue}</h4>
                       <div className="flex items-center justify-between pt-2 border-t border-[#0d694f]/5 text-[9px] font-black text-[#0d694f]/40">
                          <span>{item.enrollments} ENROLLMENTS</span>
                          <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
                       </div>
                    </div>
                  ))}
               </div>

               <div className="bg-[#fcf8f1] rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#0d694f]/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-[#0d694f]/5 rounded-full -translate-x-16 -translate-y-16"></div>
                  <div className="space-y-3 relative z-10 text-center md:text-left">
                     <h3 className="text-xl font-headline font-black text-[#0d694f] uppercase tracking-tighter">Financial Manifest Audit</h3>
                     <p className="text-sm font-medium text-muted-foreground italic opacity-70">Download a complete analytical report of your vault&apos;s financial performance.</p>
                  </div>
                  <button 
                    onClick={handleDownloadReport}
                    className="bg-[#0d694f] hover:bg-[#ff7e5f] text-white px-10 py-5 rounded-2xl font-headline font-black text-[11px] tracking-widest uppercase shadow-3d-orange transition-all flex items-center gap-3 relative z-10"
                  >
                    <Download className="h-4 w-4" /> DOWNLOAD AUDIT .CSV
                  </button>
               </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-headline font-bold text-[#0d694f] uppercase tracking-tight italic">Manifest Structure</h3>
                  <button className="bg-[#0d694f] hover:bg-[#ff7e5f] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                    <Plus className="h-3 w-3" /> ADD LECTURE
                  </button>
               </div>
               
               <div className="space-y-4">
                  {course.curriculum.map((lecture, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-[#0d694f]/5 flex items-center justify-between group hover:border-[#0d694f]/20 transition-all shadow-sm">
                       <div className="flex items-center gap-6">
                          <div className="w-10 h-10 rounded-xl bg-[#fcf8f1] border border-[#0d694f]/5 flex items-center justify-center font-black text-[11px] text-[#0d694f]/30">
                             {String(i + 1).padStart(2, '0')}
                          </div>
                          <div className="space-y-1">
                             <h4 className="text-sm font-bold text-[#0d694f] uppercase tracking-tight">{lecture.title}</h4>
                             <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Video Archive</span>
                                <div className="h-1 w-1 rounded-full bg-muted-foreground/20"></div>
                                <span className="text-[9px] font-bold text-[#ff7e5f] italic">{lecture.freePreview ? 'Public Access' : 'Private Manifest'}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2.5 rounded-xl hover:bg-[#fcf8f1] text-[#0d694f] transition-all"><Settings className="h-3.5 w-3.5" /></button>
                          <button className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-8">
               <div className="bg-white rounded-[2.5rem] p-8 border border-[#0d694f]/5 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-headline font-bold text-[#0d694f] uppercase tracking-tight italic">Vault Protocols</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <SettingsOption 
                         icon={Pause} 
                         title="Pause Manifestation" 
                         desc="Temporarily disable new scholarly enrollments."
                         active={course.status === 'paused'}
                         onClick={() => handleStatusChange(course.status === 'paused' ? 'active' : 'paused')}
                       />
                       <SettingsOption 
                         icon={Archive} 
                         title="Archive Vault" 
                         desc="Move to long-term storage and disable access."
                         active={course.status === 'archived'}
                         onClick={() => handleStatusChange('archived')}
                       />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[#0d694f]/5 space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <h4 className="text-sm font-bold text-[#0d694f] uppercase">Vault Investment (Price)</h4>
                          <p className="text-[10px] font-medium text-muted-foreground italic">Pricing strategy for this specific manifestation.</p>
                       </div>
                       <div className="text-xl font-headline font-bold text-[#0d694f]">₹{course.pricing}</div>
                    </div>
                    <button className="w-full bg-[#fcf8f1] hover:bg-[#0d694f] hover:text-white text-[#0d694f] py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-[#0d694f]/5 shadow-sm">
                      REVISE PRICING ARCHIVE
                    </button>
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, trend, desc }) => {
  const colors = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    orange: "text-[#ff7e5f] bg-[#ff7e5f]/5 border-[#ff7e5f]/10",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
  };
  
  return (
    <div className="bg-white rounded-[2.5rem] p-7 border border-[#0d694f]/5 space-y-4 hover:shadow-xl transition-all group">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 ${colors[color] || colors.emerald}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{trend}</span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.15em]">{label}</h3>
        <p className="text-3xl font-headline font-black text-[#0d694f] tracking-tighter italic">{value}</p>
        {desc && <p className="text-[9px] font-bold text-[#0d694f]/30 italic">{desc}</p>}
      </div>
    </div>
  );
};

const StrengthBar = ({ label, value }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest leading-none">
      <span className="text-[#0d694f]/60">{label}</span>
      <span className="text-[#0d694f]">{value}%</span>
    </div>
    <div className="w-full h-1.5 bg-[#fcf8f1] rounded-full overflow-hidden border border-[#0d694f]/5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className="h-full bg-gradient-to-r from-[#0d694f] to-[#ff7e5f] rounded-full"
      />
    </div>
  </div>
);

const SettingsOption = ({ icon: Icon, title, desc, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col gap-3 group relative overflow-hidden ${
      active 
      ? 'bg-[#0d694f] border-[#0d694f] text-white' 
      : 'bg-[#fcf8f1]/50 border-[#0d694f]/5 text-[#0d694f] hover:bg-white hover:border-[#0d694f]/20 hover:shadow-lg'
    }`}
  >
    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-[#ff7e5f]'} transition-all group-hover:scale-110`} />
    <div className="space-y-1">
       <p className="text-[11px] font-black uppercase tracking-widest">{title}</p>
       <p className={`text-[10px] font-medium italic leading-relaxed opacity-60 ${active ? 'text-white/70' : ''}`}>{desc}</p>
    </div>
    {active && (
       <div className="absolute top-2 right-4 text-[8px] font-black tracking-widest uppercase text-white/40">ENABLED</div>
    )}
  </button>
);StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
  trend: PropTypes.string,
  desc: PropTypes.string,
};

StrengthBar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};

SettingsOption.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

VaultDetailedView.propTypes = {
  courseId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

export default VaultDetailedView;
