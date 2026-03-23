import { 
  Rocket, 
  PlusCircle, 
  Users, 
  IndianRupee, 
  BarChart, 
  CheckCircle, 
  LifeBuoy, 
  HelpCircle,
  ChevronDown,
  Mail,
  Youtube,
  ArrowRight,
  X,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const helpSections = [
  {
    id: "getting-started",
    icon: Rocket,
    title: "Getting Started",
    description: "Learn how to set up your profile, create courses, and start teaching in minutes. Follow simple steps to launch quickly.",
    content: "To begin your journey, ensure your profile details are complete. Upload a professional avatar and link your social handles. Once set up, navigate to the 'Inventory' tab to draft your first educational manifest.",
    detailedProtocol: {
      overview: "The SkillNest educator journey begins with personal branding and curriculum architecture.",
      steps: [
        "Profile Synchronization: Navigate to Settings and ensure your Educator Profile Card is fully populated. Students trust educators with clear identities.",
        "Resource Configuration: Set up your payment flows (UPI/Bank) to ensure frictionless revenue manifests.",
        "Curriculum Drafting: Use the 'New Manifest' button on your dashboard to initiate the course creation protocol."
      ],
      proTip: "A detailed educator description increases student conversion by 25%."
    }
  },
  {
    id: "course-creation",
    icon: PlusCircle,
    title: "Course Creation Guide",
    description: "Create high-quality courses with videos, notes, and quizzes. Learn how to structure lessons for better student engagement.",
    content: "Focus on creating clear, modular lessons. Each module should have a specific outcome. Use our built-in Markdown editor for rich notes and ensure your video content is encoded for high-performance streaming.",
    detailedProtocol: {
      overview: "Quality content is the core of your intellectual vault. High-fidelity video and structured data are essential.",
      steps: [
        "Modular Architecture: Break your course into distinct modules. Each should contain 3-5 lectures for optimal scholar retention.",
        "Resource Integration: Always attach 'Study Manifests' (PDFs/Notes) to your lectures. Scholars value tangible resources.",
        "Interactive Elements: Use the 'Course Curriculum' editor to add dynamic quizzes and check-ins at the end of each module."
      ],
      proTip: "Videos under 12 minutes have a 40% higher completion rate."
    }
  },
  {
    id: "managing-students",
    icon: Users,
    title: "Managing Students",
    description: "Track enrollments, monitor student progress, and interact with learners through comments, messages, and feedback tools.",
    content: "Engage with your scholars through the 'Students' portal. You can view individual progress metrics and respond to inquiries. Active interaction is the key to maintaining a high vault stability rating.",
    detailedProtocol: {
      overview: "Student management is about maintaining the health and engagement of your learning community.",
      steps: [
        "Scholars Portal: Use this tab to see real-time progress for every student enrolled in your manifests.",
        "Engagement Feedback: Respond to student questions within 24 hours to maintain your 'High Engagement' status badge.",
        "Progress Tracking: Identify students who are falling behind and send targeted messages to encourage curriculum completion."
      ],
      proTip: "Personalized welcomes often lead to 5-star reviews."
    }
  },
  {
    id: "earnings-payments",
    icon: IndianRupee,
    title: "Earnings & Payments",
    description: "Understand how you earn, payment cycles, and how to withdraw your income securely from the platform.",
    content: "Your earnings are calculated per enrollment. Payouts are processed in 15-day cycles. You can configure your UPI or Bank identifiers in the Payout Flows section of your Settings.",
    detailedProtocol: {
      overview: "The fiscal engine of SkillNest ensures you are rewarded for your intellectual contributions.",
      steps: [
        "Revenue Calculation: You receive 80% of every enrollment manifest. The remaining 20% powers the platform's cloud infrastructure.",
        "Payout Protocol: Funds are reconciled every 1st and 15th of the month. Ensure your payment identifiers are verified.",
        "Tax Manifests: Download your monthly earning statements from the 'Earnings' tab for your financial records."
      ],
      proTip: "Coupons and promotional pricing can surge your revenue by 3x during platform events."
    }
  },
  {
    id: "analytics-insights",
    icon: BarChart,
    title: "Analytics & Insights",
    description: "Access detailed performance data—course views, engagement rates, and student progress to improve your teaching strategy.",
    content: "Use the 'Financial Trajectory' and 'System Logs' to monitor real-time engagement. Insights help you identify which modules are most impactful and where students might be experiencing friction.",
    detailedProtocol: {
      overview: "Data insights provide the roadmap for curriculum refinement and growth.",
      steps: [
        "Engagement Heatmaps: See where students are pausing or re-watching your videos in the advanced analytics module.",
        "Conversion Metrics: Track how many visitors to your vault manifest actually initiate an enrollment.",
        "Trajectory Analysis: Compare your current earnings against the previous cycle to identify peak performance periods."
      ],
      proTip: "Surge your engagement by updating modules that show a high drop-off rate."
    }
  },
  {
    id: "content-guidelines",
    icon: CheckCircle,
    title: "Content Guidelines",
    description: "Follow best practices for uploading content, maintaining quality, and ensuring a great learning experience.",
    content: "Ensure all content adheres to our high-fidelity standards. Avoid low-resolution uploads and ensure all provided files (Notes/PDFs) are correctly categorized within the curriculum vault.",
    detailedProtocol: {
      overview: "Maintaining a premium ecosystem requires adherence to our quality and safety protocols.",
      steps: [
        "Video Quality: All video manifestations must be at least 1080p and use the H.264 encoding protocol.",
        "Intellectual Property: Ensure you own the rights to all materials uploaded to your vaults. Plagiarism leads to immediate account isolation.",
        "Community Standards: Maintain a professional and inclusive environment in all lectures and communications."
      ],
      proTip: "Clear audio is more important than 4K video for educational content."
    }
  },
  {
    id: "technical-support",
    icon: LifeBuoy,
    title: "Technical Support",
    description: "Facing issues? Get quick solutions or contact support for help with uploads, dashboard errors, or account problems.",
    content: "Most upload errors can be resolved by checking your connection or file format. If a persistent protocol error occurs, use the 'Contact Support' button below to reach our engineering team directly.",
    detailedProtocol: {
      overview: "We are here to ensure your educational terminal remains online and functional.",
      steps: [
        "Upload Protocol Failure: Ensure your file size is within the 500MB limit per lecture manifest.",
        "System De-sync: If your dashboard displays outdated metrics, try a hard refresh to re-initiate the WebSocket handshake.",
        "Account Security: If you suspect unauthorized access, immediately rotate your encryption keys in the Security tab."
      ],
      proTip: "Use the 'System Logs' to identify specific error codes before contacting the support terminal."
    }
  },
  {
    id: "faqs",
    icon: HelpCircle,
    title: "FAQs",
    description: "Find answers to common questions about courses, payments, students, and platform features.",
    content: "Q: Can I update a course after publishing? A: Yes, you can revise any manifest even after it is live. Q: Is there a limit to the number of students? A: No, our protocol scales dynamically to accommodate any number of scholars.",
    detailedProtocol: {
      overview: "Quick answers to the most frequent inquiries from our educator community.",
      steps: [
        "Q: How do I offer a discount? A: You can adjust the pricing manifest in the 'Course Details' section of any vault.",
        "Q: Can I collaborate with other educators? A: We are currently beta-testing multi-author protocols. Contact us for access.",
        "Q: What video formats are supported? A: We support MP4, MOV, and WebM manifestations."
      ],
      proTip: "Checked all FAQs and still have questions? Our 'Contact Creator' button is the most efficient way to get unique answers."
    }
  }
];

const InstructorHelp = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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
      className="max-w-4xl mx-auto space-y-12 pb-20 px-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h1 className="text-4xl font-headline font-black text-[#0d694f] uppercase tracking-tighter">
          Educator Knowledge Base
        </h1>
        <p className="text-muted-foreground font-medium text-sm italic opacity-70 max-w-lg mx-auto">
          Synchronize your teaching protocols and master the SkillNest ecosystem with our detailed resource modules.
        </p>
      </motion.div>

      {/* Help Sections (Accordion) */}
      <div className="space-y-4">
        {helpSections.map((section) => (
          <motion.div 
            key={section.id} 
            variants={itemVariants}
            className={`bg-white rounded-[2rem] border overflow-hidden transition-all duration-500 ${activeAccordion === section.id ? 'border-[#0d694f]/20 shadow-xl' : 'border-[#0d694f]/5 shadow-3d hover:border-[#0d694f]/10'}`}
          >
            <button 
              onClick={() => toggleAccordion(section.id)}
              className="w-full px-8 py-6 flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeAccordion === section.id ? 'bg-primary-gradient text-white shadow-lg' : 'bg-[#0d694f]/5 text-[#0d694f] group-hover:bg-[#0d694f]/10'}`}>
                  <section.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-headline font-black text-[#0d694f] uppercase tracking-tight">
                    {section.title}
                  </h3>
                  <p className="text-[10px] font-medium text-muted-foreground/60 italic leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-[#0d694f]/30 transition-transform duration-500 ${activeAccordion === section.id ? 'rotate-180 text-[#ff7e5f]' : 'group-hover:text-[#0d694f]'}`} />
            </button>
            <AnimatePresence>
              {activeAccordion === section.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <div className="px-8 pb-8 pt-2">
                    <div className="h-px w-full bg-[#0d694f]/5 mb-6"></div>
                    <p className="text-xs font-medium text-muted-foreground leading-loose animate-in fade-in slide-in-from-top-2 duration-500">
                      {section.content}
                    </p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProtocol(section);
                      }}
                      className="mt-6 flex items-center gap-2 text-[9px] font-black text-[#0d694f] hover:text-[#ff7e5f] uppercase tracking-[0.2em] transition-colors group/btn"
                    >
                      Read Detailed Protocol <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <motion.div variants={itemVariants} className="bg-[#0d694f] rounded-[3rem] p-10 relative overflow-hidden shadow-2xl shadow-[#0d694f]/30">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h2 className="text-2xl font-headline font-black text-white uppercase tracking-tight">Still Need Support?</h2>
            <p className="text-white/60 text-xs font-medium italic">Our creators are ready to assist with your educational mission.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
             <a href="mailto:support@skillnest.edu" className="w-full sm:w-auto">
               <Button className="w-full bg-[#ff7e5f] hover:bg-[#ff7e5f]/90 text-white rounded-2xl px-8 py-5 h-auto font-black text-[10px] tracking-widest uppercase shadow-lg border-none flex items-center gap-2 group transition-all">
                  <Mail className="h-4 w-4" />
                  Contact Creator
               </Button>
             </a>
             <a href="https://youtube.com/c/skillnest" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
               <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/10 rounded-2xl px-8 py-5 h-auto font-black text-[10px] tracking-widest uppercase flex items-center gap-2 transition-all">
                  <Youtube className="h-4 w-4" />
                  Tutorial Vault
               </Button>
             </a>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff7e5f]/20 rounded-full blur-[100px] -ml-32 -mb-32"></div>
      </motion.div>

      {/* Detailed Protocol Modal */}
      <AnimatePresence>
        {selectedProtocol && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-xl"
            onClick={() => setSelectedProtocol(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative shadow-2xl p-8 md:p-12 border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedProtocol(null)}
                className="absolute top-6 right-6 p-3 rounded-2xl bg-[#fcf8f1] text-[#0d694f] hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-primary-gradient text-white flex items-center justify-center shadow-lg">
                    <selectedProtocol.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-headline font-black text-[#0d694f] uppercase tracking-tighter">
                      {selectedProtocol.title}
                    </h2>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">Section ID: {selectedProtocol.id}</p>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="p-6 bg-[#fcf8f1] rounded-[2rem] border border-[#0d694f]/5 relative overflow-hidden">
                      <div className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Zap className="h-3 w-3" /> Mission Overview
                      </div>
                      <p className="text-sm font-medium text-[#0d694f]/80 italic relative z-10 leading-relaxed">
                        "{selectedProtocol.detailedProtocol.overview}"
                      </p>
                      <Globe className="absolute -bottom-4 -right-4 h-24 w-24 text-[#0d694f]/5 -rotate-12" />
                   </div>

                   <div className="space-y-6">
                      <div className="text-[10px] font-black text-[#0d694f] uppercase tracking-widest border-b border-[#0d694f]/5 pb-3">Execution Checklist</div>
                      <div className="space-y-5">
                         {selectedProtocol.detailedProtocol.steps.map((step, idx) => (
                           <div key={idx} className="flex gap-4 group">
                              <div className="w-6 h-6 rounded-full bg-[#0d694f] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-1 transition-transform group-hover:scale-110">
                                {idx + 1}
                              </div>
                              <p className="text-xs font-medium text-muted-foreground leading-loose">
                                {step}
                              </p>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="p-6 bg-[#0d694f]/5 rounded-[2rem] border border-dashed border-[#0d694f]/20">
                      <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="h-4 w-4 text-[#ff7e5f]" />
                        <span className="text-[10px] font-black text-[#0d694f] uppercase tracking-widest">Protocol Tip</span>
                      </div>
                      <p className="text-xs font-bold text-[#0d694f]/60 italic pl-7">
                        {selectedProtocol.detailedProtocol.proTip}
                      </p>
                   </div>
                </div>

                <Button 
                   onClick={() => setSelectedProtocol(null)}
                   className="w-full bg-[#0d694f] hover:bg-[#0b5c45] text-white rounded-2xl py-5 h-auto font-black text-[10px] tracking-[0.2em] uppercase shadow-3d border-none transition-all"
                >
                   Close Manifest
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InstructorHelp;
