import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { createContext, useState, useCallback } from "react";
import {
  fetchInstructorCourseListService,
  fetchInstructorAnalyticsService,
} from "@/services";

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

  const [currentEditedCourseId, setCurrentEditedCourseId] = useState(null);

  const fetchInstructorCourseList = useCallback(async (instructorId) => {
    if (!instructorId) return;
    try {
      const response = await fetchInstructorCourseListService(instructorId);
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
      const response = await fetchInstructorAnalyticsService(instructorId, range);
      if (response?.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error("Error fetching instructor analytics:", error);
    }
  }, []);

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
        currentEditedCourseId,
        setCurrentEditedCourseId,
        fetchInstructorCourseList,
        fetchInstructorAnalytics,
      }}
    >
      {children}
    </InstructorContext.Provider>
  );
}
