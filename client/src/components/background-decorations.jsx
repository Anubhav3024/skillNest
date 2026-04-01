import { Code, DollarSign, BookOpen, PenTool, Laptop, Briefcase, GraduationCap, TrendingUp } from "lucide-react";

const BackgroundDecorations = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Scattered Icons with 60% transparency effect (opacity-40) */}
      <div className="absolute top-[10%] left-[5%] text-primary/10 animate-float">
        <Code size={120} />
      </div>
      
      <div className="absolute top-[15%] right-[10%] text-secondary/10 animate-float-delayed">
        <DollarSign size={100} />
      </div>
      
      <div className="absolute bottom-[20%] left-[15%] text-primary/10 animate-float-slow">
        <BookOpen size={90} />
      </div>
      
      <div className="absolute bottom-[25%] right-[15%] text-secondary/10 animate-float">
        <PenTool size={110} />
      </div>

      {/* Additional smaller icons for depth */}
      <div className="absolute top-[40%] left-[25%] text-primary/5 animate-pulse hidden lg:block">
        <Laptop size={60} />
      </div>
      
      <div className="absolute top-[60%] right-[30%] text-secondary/5 animate-float-delayed hidden lg:block">
        <Briefcase size={70} />
      </div>

      <div className="absolute top-[5%] left-[50%] -translate-x-1/2 text-primary/5 animate-float-slow">
        <GraduationCap size={150} />
      </div>

      <div className="absolute bottom-[5%] right-[45%] text-secondary/5 animate-float">
        <TrendingUp size={130} />
      </div>
    </div>
  );
};

export default BackgroundDecorations;
