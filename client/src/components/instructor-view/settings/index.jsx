import {
  mediaUploadService
} from "@/services";
import {
  Lock,
  CreditCard,
  Globe,
  Database,
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useContext } from "react";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { AuthContext } from "@/context/auth-context";

const InstructorSettings = () => {
  const { auth, updateAuthUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  // Profile State
  const [profileData, setProfileData] = useState({
    userName: auth?.user?.userName || "",
    userEmail: auth?.user?.userEmail || "",
    philosophy: auth?.user?.philosophy || "",
    experience: auth?.user?.experience || "",
    linkedin: auth?.user?.socialLinks?.linkedin || "",
    github: auth?.user?.socialLinks?.github || "",
    twitter: auth?.user?.socialLinks?.twitter || "",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Payout State
  const [payoutData, setPayoutData] = useState({
    upiId: auth?.user?.upiId || "",
    accountNumber: auth?.user?.bankDetails?.accountNumber || "",
    ifsc: auth?.user?.bankDetails?.ifsc || "",
    bankName: auth?.user?.bankDetails?.bankName || "",
  });

  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState(auth?.user?.settings || {
    twoFactorAuth: false,
    scholarEnrollmentAlerts: true,
    revenueMilestones: true,
    communityInsights: false,
    vaultIndexing: true,
    analyticsSharing: false,
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePayoutChange = (e) => {
    setPayoutData({ ...payoutData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    try {
      setIsSaving(true);
      const response = await axiosInstance.put("/user/update", {
        userName: profileData.userName,
        userEmail: profileData.userEmail,
        philosophy: profileData.philosophy,
        experience: profileData.experience,
        socialLinks: {
          linkedin: profileData.linkedin,
          github: profileData.github,
          twitter: profileData.twitter,
        }
      });

      if (response.data.success) {
        toast.success("Identity manifest synchronized");
        updateAuthUser(response.data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Encryption mismatch: Passwords do not align.");
      return;
    }
    try {
      setIsSaving(true);
      const response = await axiosInstance.put("/user/change-password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        toast.success("Security keys rotated successfully.");
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Protocol override failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePayouts = async () => {
    try {
      setIsSaving(true);
      const response = await axiosInstance.put("/user/update", {
        upiId: payoutData.upiId,
        bankDetails: {
          accountNumber: payoutData.accountNumber,
          ifsc: payoutData.ifsc,
          bankName: payoutData.bankName,
        }
      });

      if (response.data.success) {
        toast.success("Wealth flow parameters archived");
        updateAuthUser(response.data.user);
      }
    } catch {
      toast.error("Failed to sync payout data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncPlatformSettings = async () => {
    try {
      setIsSaving(true);
      const response = await axiosInstance.put("/user/settings/update", {
        settings: platformSettings,
      });

      if (response.data.success) {
        toast.success("Terminal preferences synced");
        updateAuthUser({ ...auth.user, settings: response.data.settings });
      }
    } catch {
      toast.error("Failed to sync configurations");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsSaving(true);
      // Removed manual headers to allow axios to set the boundary correctly
      const data = await mediaUploadService(formData, () => {});
      
      if (data.success) {
        const imageUrl = data.result.url;
        const updateRes = await axiosInstance.put("/user/update", {
          avatar: imageUrl
        });
        if (updateRes.data.success) {
          toast.success("Identity visual manifest synchronized");
          updateAuthUser(updateRes.data.user);
        }
      }
    } catch (error) {
      toast.error(`Protocol failure: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems = [
    { id: "general", label: "Workspace General", icon: Globe },
    { id: "security", label: "Security Layer", icon: Lock },
    { id: "payouts", label: "Payout Flows", icon: CreditCard },
    { id: "terminal", label: "Terminal Config", icon: Database }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-headline font-black text-[#0d694f] tracking-tighter uppercase mb-2">
            System Preferences
          </h1>
          <p className="text-muted-foreground font-medium text-xs italic opacity-60">
            Tailor your educator environment and professional identity.
          </p>
        </div>
      </div>

      {/* Horizontal Profile Overview Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[3rem] p-8 md:p-10 border border-[#0d694f]/5 shadow-3d flex flex-col md:flex-row gap-10 items-center overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0d694f]/5 to-transparent rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        {/* Left Side: Profile Image */}
        <div className="relative group">
          <div className="w-40 h-40 rounded-full border-4 border-[#0d694f]/10 p-1 flex items-center justify-center overflow-hidden bg-[#fcf8f1]">
            {auth?.user?.avatar ? (
              <img src={auth.user.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full bg-[#0d694f]/10 flex items-center justify-center rounded-full">
                <Globe className="h-10 w-10 text-[#0d694f]/40" />
              </div>
            )}
            <input type="file" id="profile-image" className="hidden" accept="image/*" onChange={handleImageUpload} />
            <label 
              htmlFor="profile-image" 
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-full"
            >
              <Check className="h-6 w-6 text-white" />
            </label>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#ff7e5f] text-white p-2 rounded-full shadow-3d-orange">
            <Globe className="h-4 w-4" />
          </div>
        </div>

        {/* Right Side: Identity Data */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff7e5f] mb-1 block">Certified Educator</span>
              <h2 className="text-4xl font-headline font-black text-[#0d694f] tracking-tighter uppercase leading-none">
                {auth?.user?.userName}
              </h2>
              <p className="text-[#0d694f]/60 font-medium text-sm mt-2 flex items-center gap-2">
                <Globe className="h-3 w-3" /> {auth?.user?.userEmail}
              </p>
            </div>
            <div className="flex gap-3">
              {[
                { icon: Globe, link: auth?.user?.socialLinks?.linkedin },
                { icon: Database, link: auth?.user?.socialLinks?.github },
                { icon: Lock, link: auth?.user?.socialLinks?.twitter }
              ].map((social, idx) => (
                social.link && (
                  <a key={idx} href={social.link} target="_blank" rel="noreferrer" className="p-3 rounded-2xl bg-[#0d694f]/5 text-[#0d694f] hover:bg-[#0d694f] hover:text-white transition-all shadow-3d border border-transparent">
                    <social.icon className="h-4 w-4" />
                  </a>
                )
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#0d694f]/5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0d694f]/30">Experience Tier</span>
              <p className="font-bold text-[#0d694f] text-sm uppercase">{auth?.user?.experience || 0} Years in the Vault</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0d694f]/30">Philosophy Manifest</span>
              <p className="font-medium text-[#0d694f]/80 text-xs italic leading-relaxed line-clamp-2">
                &quot;{auth?.user?.philosophy || "No philosophy archived yet."}&quot;
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3 space-y-3">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 5 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-8 py-5 rounded-2xl transition-all font-headline font-black text-[10px] uppercase tracking-widest ${
                activeTab === item.id 
                  ? 'bg-[#0d694f] text-white shadow-3d-orange' 
                  : 'bg-white text-[#0d694f]/40 hover:bg-[#0d694f]/5 border border-[#0d694f]/10 shadow-3d'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </motion.button>
          ))}
        </div>

        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === "general" && (
              <motion.div 
                key="general" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-[#0d694f]/5 shadow-3d space-y-10"
              >
                <div className="flex items-center gap-4 pb-6 border-b border-[#fcf8f1]">
                   <Globe className="h-5 w-5 text-[#0d694f]" />
                   <h3 className="text-xl font-headline font-black text-[#0d694f] uppercase">Public Identity</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">Manifest Title (Name)</label>
                      <input name="userName" value={profileData.userName} onChange={handleProfileChange} className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">Secure Link (Email)</label>
                      <input name="userEmail" value={profileData.userEmail} onChange={handleProfileChange} className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">Educator Philosophy (Description)</label>
                      <textarea name="philosophy" value={profileData.philosophy} onChange={handleProfileChange} rows="4" className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all resize-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">Experience Delta (Years)</label>
                      <input name="experience" value={profileData.experience} onChange={handleProfileChange} className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">LinkedIn Archive</label>
                      <input name="linkedin" value={profileData.linkedin} onChange={handleProfileChange} className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">GitHub Repository</label>
                      <input name="github" value={profileData.github} onChange={handleProfileChange} className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">X / Twitter Frequency</label>
                      <input name="twitter" value={profileData.twitter} onChange={handleProfileChange} className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button disabled={isSaving} onClick={handleUpdateProfile} className="bg-[#0d694f] text-white hover:bg-[#ff7e5f] rounded-2xl px-12 py-5 h-auto font-black text-[10px] tracking-widest uppercase shadow-3d-orange border-none flex items-center gap-3">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    SYNC IDENTITY
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div 
                key="security" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-[#0d694f]/5 shadow-3d space-y-10"
              >
                <div className="flex items-center gap-4 pb-6 border-b border-[#fcf8f1]">
                   <Lock className="h-5 w-5 text-[#0d694f]" />
                   <h3 className="text-xl font-headline font-black text-[#0d694f] uppercase">Security Layer</h3>
                </div>

                <div className="max-w-md space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">Current Access Token (Old Password)</label>
                      <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">New Access Key</label>
                      <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">Confirm New Key</label>
                      <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button disabled={isSaving} onClick={handleChangePassword} className="bg-[#0d694f] text-white hover:bg-[#ff7e5f] rounded-2xl px-12 py-5 h-auto font-black text-[10px] tracking-widest uppercase shadow-3d-orange border-none flex items-center gap-3">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    ROTATE KEYS
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "payouts" && (
              <motion.div 
                key="payouts" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-[#0d694f]/5 shadow-3d space-y-10"
              >
                <div className="flex items-center gap-4 pb-6 border-b border-[#fcf8f1]">
                   <CreditCard className="h-5 w-5 text-[#0d694f]" />
                   <h3 className="text-xl font-headline font-black text-[#0d694f] uppercase">Wealth Flow</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">UPI Identifier</label>
                      <input name="upiId" value={payoutData.upiId} onChange={handlePayoutChange} placeholder="example@upi" className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">Account Numeric Sequence</label>
                      <input name="accountNumber" value={payoutData.accountNumber} onChange={handlePayoutChange} className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">IFSC Protocol</label>
                      <input name="ifsc" value={payoutData.ifsc} onChange={handlePayoutChange} className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] opacity-50 ml-2">Banking Institution Designation</label>
                      <input name="bankName" value={payoutData.bankName} onChange={handlePayoutChange} className="w-full bg-[#fcf8f1]/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-[#0d694f] focus:ring-2 focus:ring-[#0d694f]/10 transition-all" />
                   </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button disabled={isSaving} onClick={handleUpdatePayouts} className="bg-[#0d694f] text-white hover:bg-[#ff7e5f] rounded-2xl px-12 py-5 h-auto font-black text-[10px] tracking-widest uppercase shadow-3d-orange border-none flex items-center gap-3">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    SYNC VAULT ACCESS
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "terminal" && (
              <motion.div 
                key="terminal" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-[#0d694f]/5 shadow-3d space-y-10"
              >
                <div className="flex items-center gap-4 pb-6 border-b border-[#fcf8f1]">
                   <Database className="h-5 w-5 text-[#0d694f]" />
                   <h3 className="text-xl font-headline font-black text-[#0d694f] uppercase">Platform Protocol</h3>
                </div>

                <div className="space-y-8">
                  {[
                    { label: "Two-Factor Authentication", key: "twoFactorAuth" },
                    { label: "Scholar Enrollment Alerts", key: "scholarEnrollmentAlerts" },
                    { label: "Revenue Milestones", key: "revenueMilestones" },
                    { label: "Vault Indexing", key: "vaultIndexing" },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-6 bg-[#fcf8f1]/30 rounded-2xl border border-[#0d694f]/5">
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#0d694f]">{setting.label}</span>
                       <Switch 
                         checked={platformSettings[setting.key]} 
                         onCheckedChange={(val) => setPlatformSettings({...platformSettings, [setting.key]: val})}
                         className="data-[state=checked]:bg-[#0d694f]"
                       />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-6">
                  <Button disabled={isSaving} onClick={handleSyncPlatformSettings} className="bg-[#0d694f] text-white hover:bg-[#ff7e5f] rounded-2xl px-12 py-5 h-auto font-black text-[10px] tracking-widest uppercase shadow-3d-orange border-none flex items-center gap-3">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    SYNC TERMINAL
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default InstructorSettings;
