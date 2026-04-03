import {
  TrendingUp,
  Users,
  Star,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  PieChart,
  Loader2,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/api/axiosInstance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ENTRIES_PER_PAGE = 12;

const InstructorEarnings = ({ saasAnalytics, fetchSaaSAnalytics, user }) => {
  const [trajectoryType, setTrajectoryType] = useState("monthly");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Breakdown states
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState("");
  const [breakdownData, setBreakdownData] = useState([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
  const chartContainerRef = useRef(null);

  // Initial Fetch & Trajectory Refresh
  useEffect(() => {
    fetchSaaSAnalytics(trajectoryType);
  }, [fetchSaaSAnalytics, trajectoryType]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, trajectoryType]);

  useLayoutEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const updateReadyState = () => {
      const { width, height } = container.getBoundingClientRect();
      const nextWidth = Math.max(0, Math.round(width));
      const nextHeight = Math.max(0, Math.round(height));
      setChartSize((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight },
      );
    };

    updateReadyState();
    const resizeObserver = new ResizeObserver(updateReadyState);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const summary = saasAnalytics?.summary;
  const trajectory = useMemo(
    () => saasAnalytics?.trajectory || [],
    [saasAnalytics?.trajectory],
  );
  const transactions = useMemo(
    () => saasAnalytics?.transactions || [],
    [saasAnalytics?.transactions],
  );

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${summary?.revenue?.toLocaleString() || 0}`,
      change: "Lifetime Yield",
      icon: TrendingUp,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5",
    },
    {
      label: "Platform Fees",
      value: `₹${summary?.platformFee?.toLocaleString() || 0}`,
      change: "Service Charge",
      icon: BarChart2,
      color: "text-[#ff7e5f]",
      bg: "bg-[#ff7e5f]/5",
    },
    {
      label: "Gross Sales",
      value: `₹${summary?.totalSales?.toLocaleString() || 0}`,
      change: "Total Revenue",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Enrollments",
      value: summary?.totalStudents || 0,
      change: "Total Scholars",
      icon: Users,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5",
    },
    {
      label: "Avg. Rating",
      value: summary?.avgRating || "0.0",
      change: "Scholarly Feedback",
      icon: Star,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5",
    },
    {
      label: "Stability",
      value: `${summary?.stability || 100}%`,
      change: "Retention threshold",
      icon: BarChart2,
      color: "text-[#0d694f]",
      bg: "bg-[#0d694f]/5",
    },
  ];

  const payoutInfo = (
    <div className="bg-[#fcf8f1] p-6 rounded-[2rem] border border-[#0d694f]/5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[11px] font-black text-[#0d694f] uppercase tracking-widest">
          Payout Registry
        </h4>
        <div className="px-3 py-1 bg-[#0d694f]/10 rounded-full text-[9px] font-black text-[#0d694f] uppercase tracking-wider">
          Active
        </div>
      </div>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">
            UPI Identifier
          </p>
          <p className="text-sm font-headline font-bold text-[#0d694f]">
            {user?.upiId || "Not Configured"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">
            Bank Account
          </p>
          <p className="text-sm font-headline font-bold text-[#0d694f]">
            {user?.bankDetails?.accountNumber
              ? `${user.bankDetails.bankName} (${user.bankDetails.accountNumber.slice(-4)})`
              : "Not Configured"}
          </p>
        </div>
      </div>
    </div>
  );

  const filteredTransactions = useMemo(() => {
    const list = transactions || [];
    if (!searchQuery) return list;
    return list.filter(
      (t) =>
        t.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [transactions, searchQuery]);

  const totalPages = Math.ceil(filteredTransactions.length / ENTRIES_PER_PAGE);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
    return filteredTransactions.slice(
      startIndex,
      startIndex + ENTRIES_PER_PAGE,
    );
  }, [filteredTransactions, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const chartData = useMemo(() => {
    const list = trajectory || [];
    return list.map((item) => {
      const date = new Date(item.period);
      let label = "";
      if (trajectoryType === "monthly") {
        label = date.toLocaleString("default", { month: "short" });
      } else if (trajectoryType === "weekly") {
        label = `W${item.rawId.week}`;
      } else if (trajectoryType === "yearly") {
        label = item.rawId.year;
      }
      return {
        name: label,
        revenue: item.revenue,
        period: `${item.rawId.year}-${String(item.rawId.month || "01").padStart(2, "0")}`,
      };
    });
  }, [trajectory, trajectoryType]);

  const handleBarClick = async (data) => {
    if (!data || !data.period) return;

    setSelectedPeriodLabel(data.name);
    setIsBreakdownModalOpen(true);
    setLoadingBreakdown(true);
    setBreakdownData([]);

    try {
      const response = await axiosInstance.get(
        `/api/analytics/course-breakdown?period=${data.period}`,
      );
      if (response.data.success) {
        setBreakdownData(response.data.data);
      } else {
        toast.error("Failed to fetch breakdown data");
      }
    } catch (error) {
      console.error("Breakdown Fetch Error:", error);
      toast.error("Error retrieving scholarship breakdown");
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get("/api/analytics/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "revenue-manifest.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Financial manifest sequestered successfully! 📊");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error(
        "Failed to sequester financial manifest. Verify authentication.",
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl border border-[#0d694f]/10 shadow-3d-orange backdrop-blur-md">
          <p className="text-[11px] font-bold text-[#0d694f]  mb-2">
            {payload[0].payload.name}
          </p>
          <p className="text-sm font-headline font-bold text-[#ff7e5f]">
            ₹{payload[0].value.toLocaleString()}
          </p>
          <p className="text-[9px] font-semibold text-muted-foreground mt-1 italic">
            Click to view course breakdown
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl font-headline font-bold text-[#0d694f] tracking-tighter mb-1 ">
            Financial Analytics
          </h1>
          <p className="text-muted-foreground font-semibold text-sm italic opacity-70">
            SaaS-grade production yield reports with real-time sync.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#fcf8f1] p-1 rounded-xl border border-[#0d694f]/10 shadow-inner">
            {["weekly", "monthly", "yearly"].map((type) => (
              <button
                key={type}
                onClick={() => setTrajectoryType(type)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold  transition-all ${
                  trajectoryType === type
                    ? "bg-[#0d694f] text-white shadow-3d"
                    : "text-muted-foreground/60 hover:text-[#0d694f]"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleExport}
              className="bg-white hover:bg-[#0d694f]/5 text-[#0d694f] border border-[#0d694f]/10 rounded-xl px-4 py-4 h-auto aspect-square shadow-3d-orange transition-all border-none"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Payout Info Section */}
      <motion.div variants={itemVariants}>{payoutInfo}</motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#0d694f]/5 shadow-3d group cursor-default"
          >
            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-bold  text-muted-foreground  opacity-60 group-hover:opacity-100 transition-opacity">
                {stat.label}
              </span>
              <div className="space-y-1">
                <div className="text-2xl font-headline font-bold text-[#0d694f] tracking-tighter">
                  {stat.value}
                </div>
                <div className="text-[10px] font-bold text-[#0d694f]/60  italic opacity-70">
                  {stat.change}
                </div>
              </div>
              {stat.label === "Stability" && (
                <div className="w-full h-1 bg-[#fcf8f1] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${summary?.stability || 100}%` }}
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
        {/* Financial Trajectory */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-12 bg-white p-8 rounded-2xl border border-[#0d694f]/5 shadow-3d relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-lg font-headline font-bold text-[#0d694f]  tracking-tight">
              Financial Trajectory
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ff7e5f]"></div>
                <span className="text-[10px] font-bold text-muted-foreground  opacity-60">
                  Revenue Performance
                </span>
              </div>
            </div>
          </div>

          <div
            ref={chartContainerRef}
            className="h-80 min-h-[320px] min-w-0 relative z-10"
          >
            {chartSize.width > 0 && chartSize.height > 0 ? (
              <BarChart
                width={chartSize.width}
                height={chartSize.height}
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#0d694f10"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#0d694f60" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#0d694f60" }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#0d694f05", radius: 12 }}
                />
                <Bar
                  dataKey="revenue"
                  radius={[12, 12, 0, 0]}
                  barSize={40}
                  onClick={(data) => handleBarClick(data)}
                  className="cursor-pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill="url(#barGradient)"
                      className="transition-all duration-500 hover:opacity-80"
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d694f" />
                    <stop offset="100%" stopColor="#ff7e5f" />
                  </linearGradient>
                </defs>
              </BarChart>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
                Loading chart...
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-30"></div>
        </motion.div>
      </div>

      {/* Transaction Manifest */}
      <motion.div
        variants={itemVariants}
        className="bg-white p-8 rounded-2xl border border-[#0d694f]/5 shadow-3d"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h3 className="text-lg font-headline font-bold text-[#0d694f]  tracking-tight">
            Transaction Manifest
          </h3>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-[#0d694f] transition-colors" />
            <input
              type="text"
              placeholder="Query protocol logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#fcf8f1] border border-[#0d694f]/5 rounded-xl pl-11 pr-6 py-3 text-[11px] font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none w-full md:w-72 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-[#fcf8f1]">
                <th className="py-3 px-4 text-[10px] font-bold text-muted-foreground/40  opacity-60">
                  Epoch
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-muted-foreground/40  opacity-60">
                  Scholar
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-muted-foreground/40  opacity-60">
                  Archive Identifier
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-muted-foreground/40  opacity-60 text-center">
                  Payout Status
                </th>
                <th className="py-3 px-4 text-[10px] font-bold text-muted-foreground/40  opacity-60 text-right">
                  Yield (Net)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#fcf8f1]">
              <AnimatePresence mode="popLayout">
                {paginatedTransactions.map((payment, index) => (
                  <motion.tr
                    key={payment._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.05 * index }}
                    className="group hover:bg-[#fcf8f1]/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-[11px] text-muted-foreground/60 font-bold ">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#fcf8f1] border border-[#0d694f]/10 flex items-center justify-center text-[10px] font-bold text-[#0d694f] shadow-inner group-hover:rotate-6 transition-transform">
                          {payment.userName?.substring(0, 2).toUpperCase() ||
                            "??"}
                        </div>
                        <span className="text-[13px] font-headline font-bold text-[#0d694f]  tracking-tight group-hover:text-[#ff7e5f] transition-colors">
                          {payment.userName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] font-medium text-muted-foreground italic group-hover:text-[#0d694f] transition-colors">
                      {payment.courseTitle}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border ${payment.payoutStatus === "processed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"} group-hover:bg-[#0d694f] group-hover:text-white transition-all`}
                      >
                        {payment.payoutStatus?.toUpperCase() || "PENDING"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-[12px] font-headline font-black text-[#0d694f] tracking-tighter">
                      ₹{payment.instructorShare}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-20 text-center text-muted-foreground opacity-30 text-[10px] uppercase font-black tracking-widest"
                  >
                    No transactions recorded in the manifest
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-[#fcf8f1] pt-10">
          <span className="text-[10px] font-bold text-muted-foreground/40 ">
            Showing{" "}
            {filteredTransactions.length > 0
              ? (currentPage - 1) * ENTRIES_PER_PAGE + 1
              : 0}
            -
            {Math.min(
              currentPage * ENTRIES_PER_PAGE,
              filteredTransactions.length,
            )}{" "}
            of {filteredTransactions.length} entries
          </span>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={currentPage > 1 ? { y: -2 } : {}}
              whileTap={currentPage > 1 ? { y: 0 } : {}}
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`h-9 px-4 rounded-xl border border-[#0d694f]/5 bg-white text-[10px] font-bold  text-[#0d694f] flex items-center gap-2 transition-all shadow-3d ${currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-[#fcf8f1]"}`}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </motion.button>
            <motion.button
              whileHover={currentPage < totalPages ? { y: -2 } : {}}
              whileTap={currentPage < totalPages ? { y: 0 } : {}}
              onClick={handleNext}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`h-9 px-4 rounded-xl border border-[#0d694f]/5 bg-white text-[10px] font-bold  text-[#0d694f] flex items-center gap-2 transition-all shadow-3d ${currentPage === totalPages || totalPages === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-[#fcf8f1]"}`}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Course Breakdown Dialog */}
      <Dialog
        open={isBreakdownModalOpen}
        onOpenChange={setIsBreakdownModalOpen}
      >
        <DialogContent className="sm:max-w-2xl bg-white rounded-[2.5rem] sm:rounded-[3rem] border border-[#0d694f]/10 shadow-2xl p-6 sm:p-10 overflow-hidden font-body">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#0d694f]/5 rounded-full blur-3xl -mr-24 -mt-24"></div>

          <DialogHeader className="relative z-10 mb-8">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-headline font-bold text-[#0d694f]  tracking-tighter flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0d694f] text-white flex items-center justify-center shadow-lg shadow-[#0d694f]/20">
                  <PieChart className="h-6 w-6" />
                </div>
                Yield Breakdown
              </DialogTitle>
              <div className="bg-[#fcf8f1] px-5 py-2 rounded-xl border border-[#0d694f]/5 text-[11px] font-bold text-[#0d694f] uppercase tracking-wider">
                {selectedPeriodLabel}
              </div>
            </div>
            <DialogDescription className="text-xs font-medium text-muted-foreground/70 italic mt-4">
              Detailed course-level revenue distribution for the selected
              temporal manifest.
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 space-y-6">
            {loadingBreakdown ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-[#0d694f] animate-spin" />
                <span className="text-[10px] font-black text-[#0d694f]/40 uppercase tracking-[0.2em]">
                  Sequestering Data...
                </span>
              </div>
            ) : breakdownData.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {breakdownData.map((course, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-[#fcf8f1]/50 border border-[#0d694f]/5 rounded-[1.5rem] p-5 hover:bg-[#0d694f] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#0d694f]/10 flex items-center justify-center text-[#0d694f] group-hover:rotate-6 transition-transform">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-[13px] font-headline font-black text-[#0d694f]  tracking-tight group-hover:text-white transition-colors">
                            {course.title}
                          </div>
                          <div className="text-[9px] font-black text-muted-foreground  mt-0.5 group-hover:text-white/60 transition-colors">
                            Manifest ID: {course._id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div className="space-y-0.5">
                          <div className="text-sm font-headline font-bold text-[#ff7e5f] group-hover:text-white transition-colors">
                            ₹{course.revenue.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-bold text-[#0d694f]/40  group-hover:text-white/40 transition-colors">
                            Course Yield
                          </div>
                        </div>
                        <ArrowRight className="h-4.5 w-4.5 text-[#0d694f]/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 opacity-30">
                <Users className="h-12 w-12 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                  No Temporal Insights Found
                </p>
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-end">
            <Button
              onClick={() => setIsBreakdownModalOpen(false)}
              className="bg-[#0d694f]/5 hover:bg-[#ff7e5f]/10 text-[#0d694f] hover:text-[#ff7e5f] rounded-xl px-10 py-5 h-auto text-[10px] font-black uppercase tracking-widest border-none transition-all"
            >
              Dismiss Manifest
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

InstructorEarnings.propTypes = {
  saasAnalytics: PropTypes.object,
  fetchSaaSAnalytics: PropTypes.func,
  user: PropTypes.object,
};

export default InstructorEarnings;
