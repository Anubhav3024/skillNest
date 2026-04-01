import { Navigate, Route, Routes } from "react-router-dom";
import { useContext, lazy, Suspense } from "react";
import { AuthContext } from "@/context/auth-context";
import RouteGuard from "./components/route-guard";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import NotFoundPage from "./pages/not-found";


import Loader from "./components/common/loader";
import StudentHomePage from "./pages/student/home";
import { ToastContainer } from "react-toastify";

const AuthPage = lazy(() => import("./pages/auth"));
const InstructorDashboardPage = lazy(() => import("./pages/instructor"));
const AddNewCoursePage = lazy(() =>
  import("./pages/instructor/add-new-course")
);
const StudentViewCourseDetailsPage = lazy(() =>
  import("./pages/student/course-details")
);
const PaypalPaymentReturnPage = lazy(() =>
  import("./pages/student/payment-return")
);
const StudentCourseProgress = lazy(() =>
  import("./pages/student/course-progress")
);
const StudentProfilePage = lazy(() => import("./pages/student/profile"));
const AboutPage = lazy(() => import("./pages/student/about"));
const SupportHubPage = lazy(() => import("./pages/student/legal"));

function App() {
  const authContext = useContext(AuthContext);
  const auth = authContext?.auth;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      }
    >
      <ToastContainer/>
      <Routes>
        <Route
          path="/auth"
          element={
            <RouteGuard
              element={<AuthPage />}
              authenticated={auth?.authenticated}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor"
          element={
            <RouteGuard
              element={<InstructorDashboardPage />}
              authenticated={auth?.authenticated}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/create-new-course"
          element={
            <RouteGuard
              element={<AddNewCoursePage />}
              authenticated={auth?.authenticated}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/edit-course/:courseId"
          element={
            <RouteGuard
              element={<AddNewCoursePage />}
              authenticated={auth?.authenticated}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/"
          element={
            <RouteGuard
              element={<StudentViewCommonLayout />}
              authenticated={auth?.authenticated}
              user={auth?.user}
            />
          }
        >
          <Route index element={<StudentHomePage />} />
          <Route path="/courses" element={<Navigate to="/home?tab=browse" replace />} />
          <Route path="home" element={<StudentHomePage />} />
          <Route path="/payment-return" element={<PaypalPaymentReturnPage />} />
          <Route path="/student-courses" element={<Navigate to="/home?tab=my-courses" replace />} />
          <Route
            path="/course-progress/:id"
            element={<StudentCourseProgress />}
          />
          <Route
            path="/course/details/:id"
            element={<StudentViewCourseDetailsPage />}
          />
          <Route path="/profile" element={<StudentProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help-center" element={<SupportHubPage />} />
          <Route path="/privacy-policy" element={<SupportHubPage />} />
          <Route path="/terms-of-service" element={<SupportHubPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
