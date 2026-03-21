import { Outlet, useLocation } from "react-router-dom";
import StudentViewCommonHeader from "./header";
import Footer from "../footer";

const StudentViewCommonLayout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {!location.pathname.includes("course-progress") ? (
        <StudentViewCommonHeader />
       ) : null}

      <main className="flex-grow pt-20">
        <Outlet />
      </main>

      {!location.pathname.includes("course-progress") ? (
        <Footer />
      ) : null}
    </div>
  );
};

export default StudentViewCommonLayout;
