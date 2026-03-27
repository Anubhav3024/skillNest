import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { createContext, useState, useCallback } from "react";
import {
  fetchInstructorCourseListService,
  fetchInstructorAnalyticsService,
  deleteInstructorCourseService,
  fetchSaaSAnalyticsSummaryService,
  fetchSaaSAnalyticsTrajectoryService,
  fetchSaaSAnalyticsTransactionsService,
} from "@/services";
import PropTypes from "prop-types";

export const InstructorContext = createContext(null);

export default function InstructorProvider({ children }) {
  const [courseLandingFormData, setCourseLandingFormData] = useState(
    courseLandingInitialFormData
  );

  const [courseCurriculumFormData, setCourseCurriculumFormData] = useState(
    courseCurriculumInitialFormData
  );

  const [mediaUploadProgress, setMediaUploadProgress] = useState(false);
  const [mediaUploadProgressPercentage, setMediaUploadProgressPercentage] =
    useState(0);

  const [instructorCoursesList, setInstructorCoursesList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [saasAnalytics, setSaasAnalytics] = useState({
    summary: null,
    trajectory: [],
    transactions: [],
  });

  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [currentEditedCourseId, setCurrentEditedCourseId] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const fetchInstructorCourseList = useCallback(async (instructorId, search = "", sort = "") => {
    if (!instructorId) return;
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (sort) queryParams.set("sort", sort);

      const queryString = queryParams.toString();
      const response = await fetchInstructorCourseListService(instructorId, queryString);
      
      if (response?.success) {
        setInstructorCoursesList(response.courseList);
      }
    } catch (error) {
      console.error("Error fetching instructor course list:", error);
    }
  }, []);

  const fetchInstructorAnalytics = useCallback(async (instructorId, range = "6m") => {
    if (!instructorId) return;
    try {
      // Legacy Analytics
      const response = await fetchInstructorAnalyticsService(instructorId, range);
      if (response?.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error("Error fetching instructor analytics:", error);
    }
  }, []);

  const fetchSaaSAnalytics = useCallback(async (trajectoryType = "monthly") => {
    try {
      const [summaryRes, trajectoryRes, transactionsRes] = await Promise.all([
        fetchSaaSAnalyticsSummaryService(),
        fetchSaaSAnalyticsTrajectoryService(trajectoryType),
        fetchSaaSAnalyticsTransactionsService(),
      ]);

      if (summaryRes.success && trajectoryRes.success && transactionsRes.success) {
        setSaasAnalytics({
          summary: summaryRes.data,
          trajectory: trajectoryRes.data,
          transactions: transactionsRes.data,
        });
      }
    } catch (error) {
      console.error("Error fetching SaaS Analytics:", error);
    }
  }, []);

  const deleteCourse = useCallback(async (courseId, instructorId) => {
    try {
      const response = await deleteInstructorCourseService(courseId);
      if (response?.success) {
        fetchInstructorCourseList(instructorId);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting course:", error);
      return false;
    }
  }, [fetchInstructorCourseList]);

  return (
    <InstructorContext.Provider
      value={{
        courseLandingFormData,
        setCourseLandingFormData,
        courseCurriculumFormData,
        setCourseCurriculumFormData,
        mediaUploadProgress,
        setMediaUploadProgress,
        mediaUploadProgressPercentage,
        setMediaUploadProgressPercentage,
        instructorCoursesList,
        setInstructorCoursesList,
        analytics,
        setAnalytics,
        saasAnalytics,
        setSaasAnalytics,
        globalSearchTerm,
        setGlobalSearchTerm,
        currentEditedCourseId,
        setCurrentEditedCourseId,
        fetchInstructorCourseList,
        fetchInstructorAnalytics,
        fetchSaaSAnalytics,
        deleteCourse,
        activeTab,
        setActiveTab,
        resetInstructorState: () => {
          setInstructorCoursesList([]);
          setAnalytics(null);
          setSaasAnalytics({
            summary: null,
            trajectory: [],
            transactions: [],
          });
          setGlobalSearchTerm("");
        }
      }}
    >
      {children}
    </InstructorContext.Provider>
  );
}

InstructorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
