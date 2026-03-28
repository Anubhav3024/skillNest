import { AuthContext } from "@/context/auth-context";
import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { Github } from "lucide-react";
import { toast } from "react-toastify";
import { exchangeOAuthTicketService } from "@/services";
import { normalizeRole } from "@/utils/role";

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
  }, [location.search]);

  const handleGithubLogin = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const role = activeRole || "student";
    window.location.href = `${baseUrl}/auth/github?role=${encodeURIComponent(role)}`;
  };

  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
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
    <div className="bg-background font-body text-on-surface min-h-screen flex flex-col">
      {/* Auth Main Canvas */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 md:py-24">
        {/* Asymmetric Bento-Style Container */}
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Branding Side: Editorial Scale */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-8 p-4 lg:p-0">
            <div className="space-y-4">
              <div 
                onClick={handleNavigate}
                className="inline-flex items-center gap-2 text-primary cursor-pointer group"
              >
                <span className="material-symbols-outlined text-3xl transition-transform group-hover:scale-110">nest_eco_leaf</span>
                <span className="font-headline font-extrabold text-2xl tracking-tighter text-foreground">SkillNest</span>
              </div>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                Cultivate your <span className="text-primary italic">potential.</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                Join an elite sanctuary of digital craftsmen and educators. Your journey towards mastery begins in our curated learning atelier.
              </p>
            </div>
            {/* Featured Image */}
            <div className="relative h-64 lg:h-80 w-full rounded-xl overflow-hidden bg-muted group">
              <img 
                alt="Collaboration" 
                className="w-full h-full object-cover mix-blend-multiply opacity-80 transition-transform duration-700 group-hover:scale-105" 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
              />
              <div className="absolute inset-0 bg-primary/10"></div>
            </div>
          </div>

          {/* Right Auth Side: Functional UI */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="bg-card rounded-xl shadow-[0_20px_40px_rgba(13,105,79,0.06)] p-8 md:p-12 border border-border">
              {/* Role Selector */}
              <div className="flex p-1.5 bg-muted rounded-full mb-10 w-fit mx-auto md:mx-0">
                <button 
                  onClick={() => handleRoleChange("student")}
                  className={`px-8 py-2.5 rounded-full text-sm font-headline font-bold transition-all ${
                    activeRole === "student" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I am a Student
                </button>
                <button 
                  onClick={() => handleRoleChange("instructor")}
                  className={`px-8 py-2.5 rounded-full text-sm font-headline font-bold transition-all ${
                    activeRole === "instructor" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I am an Educator
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="font-headline text-3xl font-bold tracking-tight mb-2">
                    {activeTab === "signin" ? "Welcome Back" : "Begin Your Journey"}
                  </h2>
                  <p className="text-muted-foreground font-label text-sm tracking-wide uppercase">
                    {activeTab === "signin" ? "Enter your credentials to access your atelier" : "Create your account to start learning"}
                  </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-border">
                  <button 
                    onClick={() => setActiveTab("signin")}
                    className={`pb-4 px-6 text-sm font-bold transition-all border-b-2 ${
                      activeTab === "signin" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setActiveTab("signup")}
                    className={`pb-4 px-6 text-sm font-bold transition-all border-b-2 ${
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
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {activeTab === "signup" && (
                      <div className="space-y-2">
                        <label className="block font-label text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                        <input 
                          className="w-full px-5 py-4 rounded-xl bg-muted border-none focus:ring-2 focus:ring-primary/40 transition-all outline-none text-foreground font-body" 
                          placeholder="Your full name" 
                          type="text"
                          value={signUpFormData.userName}
                          onChange={(e) => setSignUpFormData({...signUpFormData, userName: e.target.value})}
                          required
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="block font-label text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                      <input 
                        className="w-full px-5 py-4 rounded-xl bg-muted border-none focus:ring-2 focus:ring-primary/40 transition-all outline-none text-foreground font-body" 
                        placeholder="name@domain.com" 
                        type="email"
                        value={activeTab === "signin" ? signInFormData.userEmail : signUpFormData.userEmail}
                        onChange={(e) => activeTab === "signin" ? setSignInFormData({...signInFormData, userEmail: e.target.value}) : setSignUpFormData({...signUpFormData, userEmail: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                        {activeTab === "signin" && (
                          <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot password?</a>
                        )}
                      </div>
                      <input 
                        className="w-full px-5 py-4 rounded-xl bg-muted border-none focus:ring-2 focus:ring-primary/40 transition-all outline-none text-foreground font-body" 
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
                    className="w-full bg-primary-gradient py-4 rounded-full text-primary-foreground font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                    type="submit"
                  >
                    {activeTab === "signin" ? "Sign In" : "Create Account"}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-4 text-xs font-label font-bold text-muted-foreground uppercase tracking-widest">Or continue with</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                {/* Social Logins */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-muted text-foreground font-headline font-semibold text-sm hover:bg-muted/80 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">google</span>
                    Google
                  </button>
                  <button
                    onClick={handleGithubLogin}
                    className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-muted text-foreground font-headline font-semibold text-sm hover:bg-muted/80 transition-colors"
                  >
                    <Github className="h-5 w-5" />
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
      <footer className="w-full border-t border-border bg-card flex flex-col md:flex-row justify-between items-center px-12 py-8 gap-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <span className="font-headline font-bold text-primary">SkillNest</span>
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


