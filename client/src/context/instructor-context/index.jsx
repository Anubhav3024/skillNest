import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { createContext, useState, useCallback } from "react";
import {
  fetchInstructorCourseListService,
  fetchInstructorAnalyticsService,
  deleteInstructorCourseService,
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
        currentEditedCourseId,
        setCurrentEditedCourseId,
        fetchInstructorCourseList,
        fetchInstructorAnalytics,
        deleteCourse,
      }}
    >
      {children}
    </InstructorContext.Provider>
  );
}

InstructorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
