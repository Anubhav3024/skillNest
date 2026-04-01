import { Link, useNavigate, useLocation } from "react-router-dom";
import { Globe, Mail, Twitter } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/" || location.pathname === "/home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };
  return (
    <footer className="w-full bg-emerald-950 text-white border-t border-white/5 py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <img src="/skillnestlog.png" alt="SkillNest Logo" className="w-[60px] h-[60px] object-contain transition-transform group-hover:scale-110" />
            <span className="text-3xl font-headline font-black tracking-tighter block transition-colors">
              <span className="text-[#0d694f]">Skill</span><span className="text-[#ff7e5f]">Nest</span>
            </span>
          </div>
          <p className="text-emerald-100/40 font-medium max-w-xs leading-relaxed text-sm">
            The global sanctuary for high-end digital learning and intellectual growth. Cultivate your potential with our curated atelier.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer group">
              <Globe className="h-4 w-4 text-emerald-100/60 group-hover:text-white" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer group">
              <Mail className="h-4 w-4 text-emerald-100/60 group-hover:text-white" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer group">
              <Twitter className="h-4 w-4 text-emerald-100/60 group-hover:text-white" />
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 text-sm font-headline font-bold uppercase tracking-widest text-emerald-100/60">
          <div className="flex flex-col gap-4">
            <span className="text-white text-xs mb-2 tracking-widest font-black uppercase">Platform</span>
            <a 
              href="/" 
              onClick={handleHomeClick}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Home
            </a>
            <Link to="/auth?role=instructor" className="hover:text-primary transition-colors">Teacher</Link>
            <Link to="/auth?role=student" className="hover:text-primary transition-colors">Student</Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-white text-xs mb-2 tracking-widest font-black uppercase">Support</span>
            <Link to="/help-center" className="hover:text-primary transition-colors">Help Center</Link>
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-headline font-black uppercase tracking-widest text-emerald-100/30 gap-4 text-center md:text-left">
        <span>© 2024 SkillNest Academy. All Rights Reserved.</span>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Accessibility</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
