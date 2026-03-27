import { Search, User, LogOut } from "lucide-react";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { AuthContext } from "@/context/auth-context";
import { toast } from "react-toastify";

const StudentViewCommonHeader = () => {
  const navigate = useNavigate();

  const { resetCredentials, auth } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/home?tab=browse&search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogOut = () => {
    toast.success("Logged out successfully", { autoClose: 800 });
    resetCredentials();
    sessionStorage.clear();
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#fcf8f1]/80 backdrop-blur-xl border-b border-[#0d694f]/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-10">
          <Link to="/home" className="flex items-center gap-2 group">
             <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xl font-headline font-bold transition-transform group-hover:scale-110">
               S
             </div>
             <span className="text-2xl font-headline font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">
               SkillNest
             </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="pl-10 pr-4 py-2 w-48 lg:w-64 rounded-full bg-muted border-none focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-body"
            />
          </div>

          <div className="flex items-center gap-3">
            {auth?.authenticated ? (
              <>
                <Link 
                  to="/profile"
                  className="w-10 h-10 rounded-full bg-muted overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all cursor-pointer flex items-center justify-center"
                >
                  {auth?.user?.avatar ? (
                    <img src={auth?.user?.avatar} alt="User profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </Link>
                
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={handleLogOut}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                   onClick={() => navigate("/auth")}
                  className="rounded-xl font-headline font-bold text-sm border-primary text-primary hover:bg-primary/5 px-6 hidden sm:flex"
                >
                  Log in
                </Button>
                <Button 
                  onClick={() => navigate("/auth")}
                  className="rounded-xl font-headline font-bold text-sm bg-[#ff7e5f] hover:bg-[#ff6b4a] text-white px-6 shadow-md shadow-[#ff7e5f]/20"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StudentViewCommonHeader;
