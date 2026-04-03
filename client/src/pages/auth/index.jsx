import { AuthContext } from "@/context/auth-context";
import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { Github } from "lucide-react";
import { toast } from "react-toastify";
import { exchangeOAuthTicketService } from "@/services";
import { normalizeRole } from "@/utils/role";
import BackgroundDecorations from "@/components/background-decorations";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = () => {
    navigate("/");
  };

  const [activeTab, setActiveTab] = useState("signin");
  const [activeRole, setActiveRole] = useState("student"); // Default role

  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleloginUser,
  } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauth = params.get("oauth");
    const token = params.get("token");
    const ticket = params.get("ticket");
    const error = params.get("error");
    const reason = params.get("reason");

    if (oauth && error) {
      const provider =
        oauth === "google" ? "Google" : oauth === "github" ? "GitHub" : "OAuth";
      toast.error(
        reason
          ? decodeURIComponent(reason)
          : `${provider} login failed. Please try again.`,
      );
      return;
    }

    if (oauth && ticket) {
      (async () => {
        try {
          const data = await exchangeOAuthTicketService(ticket);
          if (data?.success && data?.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            if (data.user) {
              localStorage.setItem("user", JSON.stringify(data.user));
            } else {
              localStorage.removeItem("user");
            }
            const role = normalizeRole(data.user?.role);
            window.location.replace(role === "instructor" ? "/instructor" : "/");
            return;
          }

          toast.error(data?.message || "OAuth exchange failed. Please retry.");
        } catch (exchangeError) {
          console.error("OAuth exchange error:", exchangeError);
          toast.error(
            exchangeError?.response?.data?.message ||
              "OAuth exchange failed. Please retry.",
          );
        }
      })();
      return;
    }

    if (oauth && token) {
      localStorage.setItem("accessToken", token);
      localStorage.removeItem("user");
      window.location.replace("/");
    }

    const queryRole = params.get("role");
    if (queryRole) {
      const normalized = normalizeRole(queryRole);
      if (normalized === "instructor" || normalized === "student") {
        setActiveRole(normalized);
        setSignUpFormData((prev) => ({ ...prev, role: normalized }));
        setActiveTab("signup"); // Pre-select signup if role is provided
      }
    }
  }, [location.search, setSignUpFormData]);

  const handleGithubLogin = () => {
    const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();
    const role = activeRole || "student";
    window.location.href = `${baseUrl}/auth/github?role=${encodeURIComponent(role)}`;
  };

  const handleGoogleLogin = () => {
    const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();
    const role = activeRole || "student";
    window.location.href = `${baseUrl}/auth/google?role=${encodeURIComponent(role)}`;
  };

  // Synchronize initial role
  useEffect(() => {
    if (signUpFormData.role === "") {
      setSignUpFormData((prev) => ({ ...prev, role: "student" }));
    }
  }, [signUpFormData.role, setSignUpFormData]);

  const checkIfSignInFormValid = () => {
    return (
      (signInFormData?.userEmail?.trim() ?? "") !== "" &&
      (signInFormData?.userPassword?.trim() ?? "") !== ""
    );
  };

  const checkIfSignUpFormValid = () => {
    return (
      (signUpFormData?.userName?.trim() ?? "") !== "" &&
      (signUpFormData?.userEmail?.trim() ?? "") !== "" &&
      (signUpFormData?.userPassword?.trim() ?? "") !== ""
    );
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setSignUpFormData({ ...signUpFormData, role });
  };

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex flex-col relative overflow-hidden">
      <BackgroundDecorations />
      {/* Auth Main Canvas */}
      <main className="flex-1 flex items-start justify-center lg:items-center px-4 pt-8 pb-12 lg:py-4">
        {/* Asymmetric Bento-Style Container */}
        <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-10 lg:gap-14 items-center lg:items-stretch justify-center px-4 md:px-0">
          {/* Left Branding Side: Editorial Scale */}
          <div className="w-full lg:w-[42%] flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 lg:space-y-6 lg:pr-4">
            <div className="space-y-3">
              <div 
                onClick={handleNavigate}
                className="inline-flex items-center gap-2 text-primary cursor-pointer group"
              >
                <img src="/skillnestlog.png" alt="SkillNest Logo" className="w-[68px] h-[68px] object-contain transition-transform group-hover:scale-110" />
                <span className="font-headline font-extrabold text-2xl tracking-tighter transition-colors">
                  <span className="text-[#0d694f]">Skill</span><span className="text-[#ff7e5f]">Nest</span>
                </span>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                Cultivate your <span className="text-primary italic">potential.</span>
              </h1>
              <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                Join an elite sanctuary of digital craftsmen and educators. Your journey towards mastery begins in our curated learning atelier.
              </p>
            </div>
            {/* Featured Image */}
            <div className="relative h-48 lg:h-56 w-full rounded-xl overflow-hidden bg-muted group">
              <img 
                alt="Collaboration" 
                className="w-full h-full object-cover mix-blend-multiply opacity-80 transition-transform duration-700 group-hover:scale-105" 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
              />
              <div className="absolute inset-0 bg-primary/10"></div>
            </div>
          </div>

          {/* Right Auth Side: Functional UI */}
          <div className="w-full lg:w-[58%] flex flex-col justify-center items-center lg:items-start">
            <div className="bg-card rounded-xl shadow-[0_20px_40px_rgba(13,105,79,0.06)] p-4 md:p-6 border border-border w-full max-w-md lg:max-w-lg">
              {/* Role Selector */}
              <div className="flex p-1 bg-muted rounded-full mb-3 w-fit mx-auto md:mx-0">
                <button 
                   onClick={() => handleRoleChange("student")}
                   className={`px-4 py-1.5 rounded-full text-sm font-headline font-bold transition-all ${
                     activeRole === "student" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                   }`}
                >
                  I am a Student
                </button>
                <button 
                  onClick={() => handleRoleChange("instructor")}
                  className={`px-4 py-1.5 rounded-full text-sm font-headline font-bold transition-all ${
                    activeRole === "instructor" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I am an Educator
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <h2 className="font-headline text-lg font-bold tracking-tight mb-0.5">
                    {activeTab === "signin" ? "Welcome Back" : "Begin Your Journey"}
                  </h2>
                  <p className="text-muted-foreground font-body text-xs tracking-normal">
                    {activeTab === "signin" ? "Enter your credentials to access your atelier" : "Create your account to start learning"}
                  </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-border">
                  <button 
                    onClick={() => setActiveTab("signin")}
                    className={`pb-1.5 px-4 text-sm font-bold transition-all border-b-2 ${
                      activeTab === "signin" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setActiveTab("signup")}
                    className={`pb-1.5 px-4 text-sm font-bold transition-all border-b-2 ${
                      activeTab === "signup" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (activeTab === "signin") handleloginUser(e);
                    else handleRegisterUser(e);
                  }} 
                  className="space-y-2"
                >
                  <div className="space-y-2">
                    {activeTab === "signup" && (
                      <div className="space-y-1">
                        <label className="block font-label text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                        <input 
                          className="w-full px-4 py-2 rounded-lg bg-muted border-none focus:ring-2 focus:ring-primary/40 transition-all outline-none text-foreground font-body text-sm" 
                          placeholder="Your full name" 
                          type="text"
                          value={signUpFormData.userName}
                          onChange={(e) => setSignUpFormData({...signUpFormData, userName: e.target.value})}
                          required
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="block font-label text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                      <input 
                        className="w-full px-4 py-2 rounded-lg bg-muted border-none focus:ring-2 focus:ring-primary/40 transition-all outline-none text-foreground font-body text-sm" 
                        placeholder="name@domain.com" 
                        type="email"
                        value={activeTab === "signin" ? signInFormData.userEmail : signUpFormData.userEmail}
                        onChange={(e) => activeTab === "signin" ? setSignInFormData({...signInFormData, userEmail: e.target.value}) : setSignUpFormData({...signUpFormData, userEmail: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center px-1">
                        <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                        {activeTab === "signin" && (
                          <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot password?</a>
                        )}
                      </div>
                      <input 
                        className="w-full px-4 py-2 rounded-lg bg-muted border-none focus:ring-2 focus:ring-primary/40 transition-all outline-none text-foreground font-body text-sm" 
                        placeholder="••••••••" 
                        type="password"
                        value={activeTab === "signin" ? signInFormData.userPassword : signUpFormData.userPassword}
                        onChange={(e) => activeTab === "signin" ? setSignInFormData({...signInFormData, userPassword: e.target.value}) : setSignUpFormData({...signUpFormData, userPassword: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <button 
                    disabled={activeTab === "signin" ? !checkIfSignInFormValid() : !checkIfSignUpFormValid()}
                    className="w-full bg-primary-gradient py-2 rounded-full text-primary-foreground font-headline font-bold text-base shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                    type="submit"
                  >
                    {activeTab === "signin" ? "Sign In" : "Create Account"}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-4 text-xs font-label font-bold text-muted-foreground uppercase tracking-widest">Or continue with</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                {/* Social Logins */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground font-headline font-semibold text-sm hover:bg-muted/80 transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={handleGithubLogin}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground font-headline font-semibold text-sm hover:bg-muted/80 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </button>
                </div>

                {/* Toggle Link */}
                <p className="text-center text-sm text-muted-foreground">
                  {activeTab === "signin" ? (
                    <>New to SkillNest? <button onClick={() => setActiveTab("signup")} className="text-primary font-bold hover:underline">Create an account</button></>
                  ) : (
                    <>Already have an account? <button onClick={() => setActiveTab("signin")} className="text-primary font-bold hover:underline">Sign In</button></>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-card flex flex-col md:flex-row justify-between items-center px-8 py-2.5 gap-3 shrink-0">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <span className="font-headline font-bold">
            <span className="text-[#0d694f]">Skill</span><span className="text-[#ff7e5f]">Nest</span>
          </span>
          <p className="font-label text-xs tracking-wide uppercase text-muted-foreground">© 2024 SkillNest Academy. The Intellectual Sanctuary.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="font-label text-xs tracking-wide uppercase text-muted-foreground hover:text-primary transition-all" href="#">Terms</a>
          <a className="font-label text-xs tracking-wide uppercase text-muted-foreground hover:text-primary transition-all" href="#">Privacy</a>
          <a className="font-label text-xs tracking-wide uppercase text-muted-foreground hover:text-primary transition-all" href="#">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
