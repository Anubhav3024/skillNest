import { createContext, useState, useCallback } from "react";
import { fetchStudentDashboardService } from "@/services";

export const StudentContext = createContext(null);

export default function StudentProvider({ children }) {
  const [studentViewCoursesList, setStudentViewCoursesList] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [studentViewCourseDetails, setStudentViewCourseDetails] = useState(null);
  const [currentCourseDetailsId, setCurrentCourseDetailsId] = useState(null);
  const [studentBoughtCoursesList, setStudentBoughtCoursesList] = useState([]);
  const [studentCurrentCourseProgress, setStudentCurrentCourseProgress] = useState({});

  // Dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const fetchDashboard = useCallback(async (userId) => {
    if (!userId) return;
    try {
      setDashboardLoading(true);
      const res = await fetchStudentDashboardService(userId);
      if (res?.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  return (
    <StudentContext.Provider
      value={{
        studentViewCoursesList,
        setStudentViewCoursesList,
        loadingState,
        setLoadingState,
        studentViewCourseDetails,
        setStudentViewCourseDetails,
        currentCourseDetailsId,
        setCurrentCourseDetailsId,
        studentBoughtCoursesList,
        setStudentBoughtCoursesList,
        studentCurrentCourseProgress,
        setStudentCurrentCourseProgress,
        dashboardData,
        dashboardLoading,
        fetchDashboard,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}
