import {
  Globe,
  Database,
  UserCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const InstructorDashboard = ({
  listOfCourses,
  analytics,
  auth,
  setActiveTab,
}) => {
  const navigate = useNavigate();
  const isFirstTime = !listOfCourses || listOfCourses.length === 0;

  const capitalize = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${analytics?.totalRevenue || 0}`,
      change: "Lifetime Earnings",
      icon: TrendingUp,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5",
    },
    {
      label: "Total Scholars",
      value: analytics?.totalStudents || 0,
      change: "Enrolled Students",
      icon: Users,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5",
    },
    {
      label: "Course Rating",
      value: analytics?.avgRating
        ? `${analytics.avgRating} / 5.0`
        : "0.0 / 5.0",
      change: analytics?.avgRating ? "Platform Average" : "No Reviews Yet",
      icon: Star,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5",
    },
  ];

  const trayectoryData = useMemo(() => {
    const list = analytics?.trajectory || [];
    return list.map((item) => {
      const date = new Date(item.period);
      return {
        name: date.toLocaleString("default", { month: "short" }),
        revenue: item.revenue,
      };
    });
  }, [analytics?.trajectory]);

  const bestPerformingCourses =
    listOfCourses?.slice(0, 5).map((course) => ({
      title: course.title,
      duration: "N/A",
      lessons: `${course.curriculum?.length || 0} Lectures`,
      sales: course.students?.length || 0,
      completion: "75%",
      revenue: `₹${(course.students?.length || 0) * (course.pricing || 0)}`,
      status: course.isPublished ? "Active" : "Draft",
      image:
        course.image ||
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=100&h=100",
    })) || [];

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl border border-[#0d694f]/10 shadow-3d-orange backdrop-blur-md">
          <p className="text-[9px] font-bold text-[#0d694f] uppercase tracking-wider mb-1">
            {payload[0].payload.name}
          </p>
          <p className="text-sm font-headline font-bold text-[#ff7e5f]">
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 font-body"
    >
      {/* Dynamic Welcome Message Header */}
      <motion.div
        variants={itemVariants}
        className="pb-10 border-b border-[#0d694f]/5"
      >
        {!isFirstTime ? (
          <section className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff7e5f]/10 text-[#ff7e5f] rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-[#ff7e5f]/10">
              <TrendingUp size={12} />
              Educator Command Center
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-extrabold text-[#0d694f] leading-[0.95] tracking-tight">
                  Welcome back, <br />
                  <span className="text-[#ff7e5f]">
                    {capitalize(auth?.user?.userName) || "Educator"}
                  </span>
                </h1>
                <p className="text-slate-500 font-medium text-base lg:text-lg mt-7 max-w-2xl leading-relaxed italic opacity-80">
                  {analytics?.totalStudents > 0
                    ? `Your vaults are live with ${analytics.totalStudents} scholars. Keep shipping new lectures and refining your archive.`
                    : "Your educator workstation is ready. Publish your first vault and start building your scholar community."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab("courses")}
                  className="px-6 py-3 bg-[#0d694f]/5 rounded-xl text-[10px] font-black text-[#0d694f] hover:bg-[#0d694f] hover:text-white transition-all tracking-wide"
                >
                  Performance
                </button>
                <button
                  onClick={() => setActiveTab("earnings")}
                  className="px-6 py-3 bg-[#0d694f]/5 rounded-xl text-[10px] font-black text-[#0d694f] hover:bg-[#0d694f] hover:text-white transition-all tracking-wide"
                >
                  Earnings
                </button>
                <button
                  onClick={() => setActiveTab("students")}
                  className="px-6 py-3 bg-[#0d694f]/5 rounded-xl text-[10px] font-black text-[#0d694f] hover:bg-[#0d694f] hover:text-white transition-all tracking-wide"
                >
                  Students
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="space-y-8">
            <section className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff7e5f]/10 text-[#ff7e5f] rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-[#ff7e5f]/10">
                <Plus size={12} />
                Onboarding Protocol
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-extrabold text-[#0d694f] leading-[0.95] tracking-tight">
                Welcome to SkillNest, <br />
                <span className="text-[#ff7e5f]">Educator</span>
              </h1>
              <p className="text-slate-500 font-medium text-base lg:text-lg mt-7 max-w-2xl leading-relaxed italic opacity-80">
                Your journey to share knowledge and empower scholars begins
                here. Let&apos;s initiate your workstation protocols.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <OnboardingCard
                step="01"
                title="Protocol Manifest"
                desc="Set up your professional educator profile to build trust with scholars."
                buttonLabel="Update Profile"
                icon={UserCircle}
                onClick={() => setActiveTab("settings")}
              />
              <OnboardingCard
                step="02"
                title="Initiate Vault"
                desc="Upload your first knowledge manifestation and start your teaching career."
                buttonLabel="Add Course"
                icon={Database}
                onClick={() => navigate("/instructor/create-new-course")}
              />
              <OnboardingCard
                step="03"
                title="Orchestrate"
                desc="Explore your vault explorer to audit and manage future courses."
                buttonLabel="Vault Explorer"
                icon={ArrowRight}
                onClick={() => setActiveTab("vault-management")}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Educator Profile Card - Always Visible */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[3.5rem] p-8 md:p-12 border border-[#0d694f]/5 shadow-3d relative overflow-hidden group"
      >
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#fcf8f1] shadow-xl overflow-hidden bg-[#fcf8f1] flex items-center justify-center">
              {auth?.user?.avatar ? (
                <img
                  src={auth?.user?.avatar}
                  alt="Educator Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="w-20 h-20 text-[#0d694f]/20" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#ff7e5f] rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white transition-transform group-hover:scale-110">
              <Globe className="h-4 w-4" />
            </div>
          </div>

          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-[#ff7e5f]  opacity-80">
                Certified Educator
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold text-[#0d694f] tracking-tighter leading-none">
                {capitalize(auth?.user?.userName) || "Educator"}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground/60 text-xs font-medium italic">
                <Globe className="h-3 w-3" />
                <span>{auth?.user?.userEmail}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-4 border-t border-[#0d694f]/5">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[#ff7e5f] ">
                  Experience
                </div>
                <div className="text-[14px] font-headline font-bold text-[#0d694f] tracking-tight leading-normal">
                  {auth?.user?.experience || "2"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[#ff7e5f] ">
                  Philosophy Manifest
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground/60 italic leading-relaxed max-w-xs">
                  &quot;
                  {auth?.user?.philosophy ||
                    "Experienced educator delivering engaging, practical learning experiences, simplifying complex concepts..."}
                  &quot;
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fcf8f1] border border-[#0d694f]/5 flex items-center justify-center text-[#0d694f]/30 hover:text-[#0d694f] hover:border-[#0d694f]/20 transition-all shadow-sm">
              <Globe className="h-5 w-5" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#fcf8f1] border border-[#0d694f]/5 flex items-center justify-center text-[#0d694f]/30 hover:text-[#0d694f] hover:border-[#0d694f]/20 transition-all shadow-sm">
              <Database className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fcf8f1] rounded-full blur-[100px] -mr-32 -mt-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0d694f]/5 rounded-full blur-[80px] -ml-24 -mb-24 opacity-30"></div>
      </motion.div>

      {!isFirstTime && (
        <>
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
                  <div
                    className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} transition-transform group-hover:rotate-6 shadow-sm`}
                  >
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold  text-muted-foreground  opacity-60 group-hover:opacity-100 transition-opacity">
                    {stat.label}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-headline font-bold text-[#0d694f] tracking-tighter">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground/50 ">
                    {stat.change}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Financial Trajectory - MINI VERSION */}
          {trayectoryData.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-[2.5rem] border border-[#0d694f]/5 shadow-3d relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-headline font-bold text-[#0d694f] tracking-tight">
                    Financial Trajectory
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-bold  opacity-40">
                    Monthly Performance Manifest
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-[#ff7e5f]" />
              </div>
              <div className="h-48 min-h-[192px] min-w-0">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minHeight={192}
                  minWidth={0}
                >
                  <BarChart data={trayectoryData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#0d694f05"
                    />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                      {trayectoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === trayectoryData.length - 1
                              ? "#0d694f"
                              : "#0d694f10"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Vault Command Center */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-10 rounded-[3rem] border border-[#0d694f]/10 shadow-3d relative overflow-hidden group/vault"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
              <div>
                <h2 className="text-2xl font-headline font-bold text-[#0d694f] tracking-tighter mb-1">
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
                {listOfCourses.map((course) => (
                  <motion.div
                    key={course._id}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="w-[340px] flex-none snap-start group relative bg-white border border-[#0d694f]/20 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col"
                  >
                    <div className="relative p-1.5 bg-white/40 backdrop-blur-xl">
                      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#fcf8f1] border border-[#0d694f]/5 shadow-inner">
                        <img
                          src={
                            course.image ||
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"
                          }
                          alt={course.title || "Vault thumbnail"}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#011c14]/60 via-transparent to-transparent opacity-80"></div>

                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <div
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/20 shadow-lg ${course.isPublished ? "bg-[#0d694f] text-white" : "bg-[#ff7e5f] text-white"}`}
                          >
                            {course.isPublished ? "Published" : "Draft"}
                          </div>
                        </div>

                        <div className="absolute bottom-3 right-3 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg">
                          <Users className="h-3.5 w-3.5 text-white" />
                          <span className="text-[11px] font-bold text-white ">
                            {course.students?.length || 0} Scholars
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 bg-[#0d694f] p-4 space-y-3 relative flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h3 className="text-[15px] font-headline font-bold text-white leading-tight tracking-tight group-hover:text-[#ff7e5f] transition-all line-clamp-1">
                          {capitalize(course.title) || "Untitled Manifest"}
                        </h3>
                        <p className="text-[10px] font-semibold text-white/60 italic leading-relaxed line-clamp-2">
                          {course.objectives ||
                            course.subtitle ||
                            "No strategic objectives declared for this vault."}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-white/40  leading-none">
                              Lectures
                            </span>
                            <div className="text-base font-headline font-bold text-white">
                              {course.curriculum?.length || 0}
                            </div>
                          </div>
                          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[9px] font-bold text-white/40  leading-none">
                              Price
                            </span>
                            <div className="text-base font-headline font-bold text-white">
                              {course.pricing > 0
                                ? `₹${course.pricing}`
                                : "Free"}
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() =>
                            navigate(`/instructor/edit-course/${course?._id}`)
                          }
                          className="w-full bg-[#ff7e5f] hover:bg-[#ff7e5f]/90 text-white rounded-xl py-3.5 h-auto font-headline font-bold text-[10px]  transition-all shadow-lg shadow-black/20 border-none group/btn"
                        >
                          Revise Vault
                          <ArrowRight className="h-3.5 w-3.5 ml-2 opacity-60 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>

                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div
              variants={itemVariants}
              className="lg:col-span-8 bg-white p-8 rounded-2xl border border-[#0d694f]/5 shadow-3d overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-headline font-bold text-[#0d694f] tracking-tight">
                  Recent Transactions
                </h3>
                <button
                  onClick={() => setActiveTab("earnings")}
                  className="text-[9px] font-black text-muted-foreground/60 hover:text-[#ff7e5f]  flex items-center gap-2 transition-all group/all"
                >
                  VIEW ALL{" "}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover/all:translate-x-1" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-[#fcf8f1]">
                      <th className="pb-3 text-[10px] font-bold text-muted-foreground/40  opacity-60">
                        Scholar
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-muted-foreground/40  opacity-60">
                        Vault
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-muted-foreground/40  opacity-60 text-right">
                        Valuation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#fcf8f1]">
                    {analytics?.transactions
                      ?.slice(0, 5)
                      .map((payment, index) => (
                        <motion.tr
                          key={payment._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.05 * index }}
                          className="group hover:bg-[#fcf8f1]/50 transition-colors"
                        >
                          <td className="py-3 px-1">
                            <div className="text-[12px] font-headline font-bold text-[#0d694f] tracking-tight group-hover:text-[#ff7e5f] transition-colors">
                              {capitalize(payment.userName)}
                            </div>
                          </td>
                          <td className="py-3 px-1 text-[11px] text-muted-foreground font-medium italic truncate max-w-[150px]">
                            {payment.courseTitle}
                          </td>
                          <td className="py-3 px-1 text-right text-[12px] font-headline font-black text-[#0d694f]">
                            ₹{payment.coursePricing}
                          </td>
                        </motion.tr>
                      ))}
                    {(!analytics?.transactions ||
                      analytics.transactions.length === 0) && (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-8 text-center text-[10px] font-bold text-muted-foreground/30"
                        >
                          No recent activity
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="lg:col-span-4 bg-[#dfede9] p-8 rounded-2xl border border-[#0d694f]/10 shadow-3d"
            >
              <h3 className="text-lg font-headline font-bold text-[#0d694f] mb-8  tracking-tight">
                Top Manifests
              </h3>
              <div className="space-y-6">
                {bestPerformingCourses.map((course, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-[#0d694f] border border-[#0d694f]/5 group-hover:bg-[#0d694f] group-hover:text-white transition-all">
                        {index + 1}
                      </div>
                      <div className="text-[11px] font-headline font-bold text-[#0d694f] tracking-tight line-clamp-1 max-w-[120px]">
                        {capitalize(course.title)}
                      </div>
                    </div>
                    <div className="text-[11px] font-black text-[#ff7e5f]">
                      {course.sales}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};

InstructorDashboard.propTypes = {
  listOfCourses: PropTypes.array,
  analytics: PropTypes.object,
  auth: PropTypes.object.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

const OnboardingCard = ({
  step,
  title,
  desc,
  buttonLabel,
  icon: Icon,
  onClick,
}) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    className="bg-white p-8 rounded-[2.5rem] border border-[#0d694f]/5 shadow-3d group relative overflow-hidden flex flex-col justify-between"
  >
    <div className="space-y-4 relative z-10">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-[#0d694f]/5 flex items-center justify-center text-[#ff7e5f]">
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-2xl font-headline font-black text-[#0d694f]/10">
          {step}
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-headline font-bold text-[#0d694f] tracking-tight">
          {title}
        </h3>
        <p className="text-[11px] font-medium text-muted-foreground italic leading-relaxed">
          {desc}
        </p>
      </div>
    </div>

    <button
      onClick={onClick}
      className="mt-8 w-full bg-[#fcf8f1] hover:bg-[#0d694f] hover:text-white text-[#0d694f] py-4 rounded-xl text-[10px] font-black  transition-all border border-[#0d694f]/5 flex items-center justify-center gap-2 group/btn"
    >
      <Plus className="h-3 w-3 transition-transform group-hover/btn:rotate-90" />{" "}
      {buttonLabel}
    </button>

    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff7e5f]/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
  </motion.div>
);

OnboardingCard.propTypes = {
  step: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  buttonLabel: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default InstructorDashboard;
