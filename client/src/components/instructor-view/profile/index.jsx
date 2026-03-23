import {
  User,
  Mail,
  Camera,
  Save,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Award,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useState, useRef, useContext } from "react";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { AuthContext } from "@/context/auth-context";

const InstructorProfile = ({ auth }) => {
  const { updateAuthUser } = useContext(AuthContext);
  const [userName, setUserName] = useState(auth?.user?.userName || "");
  const [userEmail, setUserEmail] = useState(auth?.user?.userEmail || "");
  const [philosophy, setPhilosophy] = useState(auth?.user?.philosophy || "");
  const [avatar, setAvatar] = useState(auth?.user?.avatar || "");
  const [experience, setExperience] = useState(auth?.user?.experience || "");
  const [skills, setSkills] = useState(auth?.user?.skills?.join(", ") || "");
  const [socialLinks, setSocialLinks] = useState({
    twitter: auth?.user?.socialLinks?.twitter || "",
    linkedin: auth?.user?.socialLinks?.linkedin || "",
    github: auth?.user?.socialLinks?.github || "",
    external: auth?.user?.socialLinks?.external || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const response = await axiosInstance.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setAvatar(response.data.result.url);
        toast.success("Avatar uploaded successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCommitChanges = async () => {
    try {
      setIsSaving(true);
      const response = await axiosInstance.put("/user/update", {
        userId: auth?.user?._id,
        userName,
        userEmail,
        philosophy,
        socialLinks,
        avatar,
        experience,
        skills: skills.split(",").map(s => s.trim()).filter(s => s !== ""),
      });

      if (response.data.success) {
        toast.success("Dossier updated successfully");
        updateAuthUser(response.data.user);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update dossier");
    } finally {
      setIsSaving(false);
    }
  };

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
            Educator Dossier
          </h1>
          <p className="text-muted-foreground font-medium text-sm italic opacity-70">
            Manage your public identity and scholarly credentials.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={handleCommitChanges}
            disabled={isSaving}
            className="bg-[#0d694f] hover:bg-[#ff7e5f] text-white rounded-xl px-10 py-5 h-auto font-headline font-black text-[9px] tracking-widest uppercase shadow-3d-orange border-none group"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-2 transition-transform group-hover:scale-110" />
            )}
            COMMIT CHANGES
          </Button>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-4 space-y-8">
           <motion.div 
            variants={itemVariants}
            className="bg-white p-10 rounded-[3rem] border border-[#0d694f]/5 shadow-3d text-center relative overflow-hidden group"
           >
              <div className="absolute top-0 left-0 right-0 h-32 bg-primary/5 -z-0"></div>
              <div className="relative z-10">
                  <div className="w-28 h-28 rounded-[2rem] bg-white border-4 border-white shadow-3d mx-auto mb-6 relative overflow-hidden group/avatar">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    <div className="w-full h-full bg-[#fcf8f1] flex items-center justify-center text-[#0d694f]">
                       {avatar ? (
                         <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                         <User className="h-12 w-12 opacity-10" />
                       )}
                       {isUploading && (
                         <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                         </div>
                       )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                    >
                       <Camera className="h-6 w-6 text-white" />
                    </button>
                  </div>
                 <h2 className="text-xl font-headline font-black text-[#0d694f] mb-1 uppercase tracking-tight">{auth?.user?.userName}</h2>
                 <p className="text-[9px] font-black text-[#ff7e5f] uppercase tracking-[0.2em] mb-8 italic opacity-80">Principal Curriculum Architect</p>
                 
                 <div className="flex items-center justify-center gap-3 border-t border-[#fcf8f1] pt-8">
                    <motion.button whileHover={{ y: -3 }} className="w-9 h-9 rounded-xl bg-[#fcf8f1] text-[#0d694f] hover:bg-[#0d694f] hover:text-white transition-all flex items-center justify-center shadow-sm"><Twitter className="h-3.5 w-3.5" /></motion.button>
                    <motion.button whileHover={{ y: -3 }} className="w-9 h-9 rounded-xl bg-[#fcf8f1] text-[#0d694f] hover:bg-[#0d694f] hover:text-white transition-all flex items-center justify-center shadow-sm"><Linkedin className="h-3.5 w-3.5" /></motion.button>
                    <motion.button whileHover={{ y: -3 }} className="w-9 h-9 rounded-xl bg-[#fcf8f1] text-[#0d694f] hover:bg-[#0d694f] hover:text-white transition-all flex items-center justify-center shadow-sm"><Github className="h-3.5 w-3.5" /></motion.button>
                 </div>
              </div>
           </motion.div>

           <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border border-[#0d694f]/5 shadow-3d cursor-default"
           >
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#ff7e5f] shadow-sm">
                    <Award className="h-4 w-4" />
                 </div>
                 <h3 className="text-[10px] font-black text-[#0d694f] uppercase tracking-widest opacity-40">DISTINCTIONS</h3>
              </div>
              <div className="space-y-4">
                 {[
                   "Accredited Vault Architect",
                   "Premier Educator Cycle 4",
                   "Knowledge Catalyst Award"
                 ].map((award, i) => (
                   <div key={i} className="flex items-center gap-3 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-150 transition-transform"></div>
                      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-[#0d694f] transition-colors">{award}</span>
                   </div>
                 ))}
              </div>
           </motion.div>
        </div>

        {/* Right Column: Detailed Info Form */}
        <div className="lg:col-span-8 space-y-8">
           <motion.div variants={itemVariants} className="bg-white p-10 rounded-[3rem] border border-[#0d694f]/5 shadow-3d">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#fcf8f1]">
                 <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#0d694f]/5 flex items-center justify-center text-[#0d694f] shadow-sm">
                       <User className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-headline font-black text-[#0d694f] uppercase tracking-tight">Core Identity</h3>
                 </div>
                 <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">PROTOCOL V1.0</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-[#0d694f]/40 uppercase tracking-[0.2em] ml-1">FULL DESIGNATION</label>
                    <div className="relative group">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-[#0d694f] transition-colors" />
                       <input 
                        type="text" 
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-[#fcf8f1]/30 border border-[#0d694f]/5 rounded-xl pl-11 pr-6 py-3.5 text-[13px] font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none transition-all shadow-sm"
                       />
                    </div>
                 </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-[#0d694f]/40 uppercase tracking-[0.2em] ml-1">ENCRYPTED MAIL</label>
                     <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-[#0d694f] transition-colors" />
                        <input 
                         type="email" 
                         value={userEmail}
                         onChange={(e) => setUserEmail(e.target.value)}
                         className="w-full bg-[#fcf8f1]/30 border border-[#0d694f]/5 rounded-xl pl-11 pr-6 py-3.5 text-[13px] font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none transition-all shadow-sm"
                        />
                     </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                     <label className="text-[9px] font-black text-[#0d694f]/40 uppercase tracking-[0.2em] ml-1">SCHOLARLY PHILOSOPHY</label>
                     <textarea 
                      rows="4"
                      value={philosophy}
                      onChange={(e) => setPhilosophy(e.target.value)}
                      placeholder="Manifest your teaching trajectory and domain expertise..."
                      className="w-full bg-[#fcf8f1]/30 border border-[#0d694f]/5 rounded-[2rem] px-6 py-5 text-[13px] font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none transition-all resize-none shadow-sm min-h-[160px]"
                     ></textarea>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                     <label className="text-[9px] font-black text-[#0d694f]/40 uppercase tracking-[0.2em] ml-1">PROFESSIONAL EXPERIENCE</label>
                     <textarea 
                      rows="3"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="Outline your relative professional achievements and trajectory..."
                      className="w-full bg-[#fcf8f1]/30 border border-[#0d694f]/5 rounded-[2rem] px-6 py-5 text-[13px] font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none transition-all resize-none shadow-sm min-h-[120px]"
                     ></textarea>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                     <label className="text-[9px] font-black text-[#0d694f]/40 uppercase tracking-[0.2em] ml-1">CORE COMPETENCIES (COMMAS SEPARATED)</label>
                     <input 
                      type="text" 
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="React, Node.js, System Architecture..."
                      className="w-full bg-[#fcf8f1]/30 border border-[#0d694f]/5 rounded-xl px-6 py-3.5 text-[13px] font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none transition-all shadow-sm"
                     />
                  </div>
              </div>
           </motion.div>

           <motion.div variants={itemVariants} className="bg-[#dfede9] p-10 rounded-[3rem] border border-[#0d694f]/10 shadow-3d">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#0d694f]/5">
                 <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#0d694f] shadow-sm">
                       <Globe className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-headline font-black text-[#0d694f] uppercase tracking-tight">Digital Sync</h3>
                 </div>
                 <ExternalLink className="h-4 w-4 text-[#0d694f]/20" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-[#0d694f]/40 uppercase tracking-[0.2em] ml-1">EXTERNAL DOMAIN</label>
                     <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-[#0d694f] transition-colors" />
                        <input 
                         type="text" 
                         value={socialLinks.external}
                         onChange={(e) => setSocialLinks({ ...socialLinks, external: e.target.value })}
                         placeholder="https://archives.com"
                         className="w-full bg-white border border-[#0d694f]/5 rounded-xl pl-11 pr-6 py-3.5 text-[13px] font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none transition-all shadow-sm"
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-[#0d694f]/40 uppercase tracking-[0.2em] ml-1">TERMINAL (X)</label>
                     <div className="relative group">
                        <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-[#0d694f] transition-colors" />
                        <input 
                         type="text" 
                         value={socialLinks.twitter}
                         onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                         placeholder="@architect"
                         className="w-full bg-white border border-[#0d694f]/5 rounded-xl pl-11 pr-6 py-3.5 text-[13px] font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none transition-all shadow-sm"
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-[#0d694f]/40 uppercase tracking-[0.2em] ml-1">LINKEDIN PROFILE</label>
                     <div className="relative group">
                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-[#0d694f] transition-colors" />
                        <input 
                         type="text" 
                         value={socialLinks.linkedin}
                         onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                         placeholder="in/expert"
                         className="w-full bg-white border border-[#0d694f]/5 rounded-xl pl-11 pr-6 py-3.5 text-[13px] font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none transition-all shadow-sm"
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-[#0d694f]/40 uppercase tracking-[0.2em] ml-1">GITHUB REPOSITORY</label>
                     <div className="relative group">
                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-[#0d694f] transition-colors" />
                        <input 
                         type="text" 
                         value={socialLinks.github}
                         onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                         placeholder="github.com/developer"
                         className="w-full bg-white border border-[#0d694f]/5 rounded-xl pl-11 pr-6 py-3.5 text-[13px] font-medium focus:ring-4 focus:ring-[#0d694f]/5 outline-none transition-all shadow-sm"
                        />
                     </div>
                  </div>
</div>
              </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

InstructorProfile.propTypes = {
  auth: PropTypes.object.isRequired,
};

export default InstructorProfile;
