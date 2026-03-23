import {
  Bell,
  Lock,
  CreditCard,
  Shield,
  Eye,
  Globe,
  Database,
  RefreshCcw,
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useState, useContext } from "react";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { AuthContext } from "@/context/auth-context";

const InstructorSettings = () => {
  const { auth, updateAuthUser } = useContext(AuthContext);
  const [settings, setSettings] = useState(auth?.user?.settings || {
    twoFactorAuth: false,
    scholarEnrollmentAlerts: true,
    revenueMilestones: true,
    communityInsights: false,
    vaultIndexing: true,
    analyticsSharing: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSyncSettings = async () => {
    try {
      setIsSaving(true);
      const response = await axiosInstance.put("/user/settings/update", {
        settings,
      });

      if (response.data.success) {
        toast.success("Platform configurations synchronized");
        updateAuthUser({
          ...auth.user,
          settings: response.data.settings,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to sync configurations");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const settingSections = [
    {
      title: "Governance & Access",
      icon: Shield,
      items: [
        { label: "Two-Factor Authentication", desc: "Add an extra layer of security to your account", toggle: true, key: "twoFactorAuth" },
        { label: "Session Management", desc: "Manage your active sessions across devices", link: true }
      ]
    },
    {
      title: "Notifications Control",
      icon: Bell,
      items: [
        { label: "Scholar Enrollment Alerts", desc: "Receive instant notifications for new students", toggle: true, key: "scholarEnrollmentAlerts" },
        { label: "Revenue Milestones", desc: "Get notified when you hit earnings targets", toggle: true, key: "revenueMilestones" },
        { label: "Community Insights", desc: "Weekly digest of school performance", toggle: true, key: "communityInsights" }
      ]
    },
    {
      title: "Privacy & Visibility",
      icon: Eye,
      items: [
        { label: "Vault Indexing", desc: "Allow search engines to discover your courses", toggle: true, key: "vaultIndexing" },
        { label: "Analytics Sharing", desc: "Share anonymized data to improve platform", toggle: true, key: "analyticsSharing" }
      ]
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
            Platform Protocol
          </h1>
          <p className="text-muted-foreground font-medium text-sm italic opacity-70">
            Configure your professional workspace and terminal preferences.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-[9px] font-black text-muted-foreground/40 hover:text-[#ff7e5f] uppercase tracking-[0.2em] flex items-center gap-2 transition-all"
        >
           <RefreshCcw className="h-3 w-3" />
           RESET ALL TO FACTORY
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Navigation */}
         <div className="lg:col-span-4 space-y-3">
            {[
              { label: "Workspace General", icon: Globe, active: true },
              { label: "Security Layer", icon: Lock },
              { label: "Payout Flows", icon: CreditCard },
              { label: "Data Archives", icon: Database }
            ].map((item, index) => (
              <motion.button 
                key={index}
                variants={itemVariants}
                whileHover={{ x: 5 }}
                className={`w-full flex items-center gap-4 px-8 py-5 rounded-[1.5rem] transition-all duration-300 font-headline font-black text-[11px] uppercase tracking-widest ${item.active ? 'bg-[#0d694f] text-white shadow-3d-orange' : 'bg-white text-[#0d694f]/40 hover:bg-[#0d694f]/5 border border-[#0d694f]/5 shadow-3d'}`}
              >
                 <item.icon className="h-4 w-4" />
                 {item.label}
              </motion.button>
            ))}
         </div>

         {/* Content */}
         <div className="lg:col-span-8 space-y-8">
            {settingSections.map((section, index) => (
              <motion.div key={index} variants={itemVariants} className="bg-white p-10 rounded-[3rem] border border-[#0d694f]/5 shadow-3d">
                 <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[#fcf8f1]">
                    <div className="w-9 h-9 rounded-xl bg-[#0d694f]/5 flex items-center justify-center text-[#0d694f] shadow-sm">
                       <section.icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-headline font-black text-[#0d694f] uppercase tracking-tight">{section.title}</h3>
                 </div>

                 <div className="space-y-10">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-8 group">
                         <div className="space-y-1">
                            <div className="text-[12px] font-headline font-black text-[#0d694f] leading-tight group-hover:text-[#ff7e5f] transition-colors uppercase tracking-tight">{item.label}</div>
                            <div className="text-[10px] text-muted-foreground font-medium italic opacity-60">{item.desc}</div>
                         </div>
                         {item.toggle ? (
                           <Switch 
                            checked={settings[item.key]} 
                            onCheckedChange={() => handleToggle(item.key)}
                            className="data-[state=checked]:bg-[#0d694f]" 
                           />
                         ) : (
                           <Button variant="ghost" className="text-[8px] font-black uppercase tracking-[0.2em] text-[#0d694f] hover:bg-[#fcf8f1] rounded-xl px-4 py-2 border border-[#0d694f]/5 shadow-sm">CONFIGURE</Button>
                         )}
                      </div>
                    ))}
                 </div>
              </motion.div>
            ))}
 
            <motion.div variants={itemVariants} className="flex justify-end gap-3 pt-6">
               <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                 <Button className="bg-white text-[#0d694f] hover:bg-[#ff7e5f]/5 border border-[#0d694f]/10 rounded-xl px-8 py-5 h-auto font-headline font-black text-[9px] tracking-widest uppercase shadow-3d">
                    CANCEL
                 </Button>
               </motion.div>
               <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                 <Button 
                   onClick={handleSyncSettings}
                   disabled={isSaving}
                   className="bg-[#0d694f] hover:bg-[#ff7e5f] text-white rounded-xl px-10 py-5 h-auto font-headline font-black text-[9px] tracking-widest uppercase shadow-3d-orange border-none flex items-center gap-2 group"
                 >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5 transition-transform group-hover:scale-125" />
                    )}
                    SYNC CONFIGURATIONS
                 </Button>
               </motion.div>
            </motion.div>
         </div>
      </div>
    </motion.div>
  );
};

export default InstructorSettings;
