import { Outlet, useLocation } from "react-router-dom";
import StudentViewCommonHeader from "./header";
import Footer from "../footer";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";

const StudentViewCommonLayout = () => {
  const location = useLocation();
  const { auth } = useContext(AuthContext);

  const isDashboard = auth?.authenticated && (location.pathname === "/" || location.pathname === "/home");
  const isCourseProgress = location.pathname.includes("course-progress");
  const isStudentShellPage =
    auth?.authenticated &&
    (
      location.pathname === "/courses" ||
      location.pathname === "/student-courses" ||
      location.pathname.includes("course/details")
    );
  const hideChrome = isDashboard || isCourseProgress || isStudentShellPage;

  return (
    <div className="flex flex-col min-h-screen">
      {!hideChrome && <StudentViewCommonHeader />}

      <main className={hideChrome ? "" : "flex-grow pt-20"}>
        <Outlet />
      </main>

      {!hideChrome && <Footer />}
    </div>
  );
};

export default StudentViewCommonLayout;
