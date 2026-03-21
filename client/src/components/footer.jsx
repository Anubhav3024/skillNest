import { Link } from "react-router-dom";
import { Globe, Mail, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-emerald-950 text-white border-t border-white/5 py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-lg font-headline font-bold">
              S
            </div>
            <span className="text-3xl font-headline font-black tracking-tighter block text-white">SkillNest</span>
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
            <span className="text-white text-xs mb-2">Platform</span>
            <Link to="/courses" className="hover:text-primary transition-colors">Browse</Link>
            <Link to="/instructor" className="hover:text-primary transition-colors">Teaching</Link>
            <Link to="/community" className="hover:text-primary transition-colors">Community</Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-white text-xs mb-2">Support</span>
            <Link to="/help" className="hover:text-primary transition-colors">Help Center</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
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
