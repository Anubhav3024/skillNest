import axiosInstance from "@/api/axiosInstance";

export const registerService = async (formData) => {
  const res = await axiosInstance.post("/auth/register", {
    ...formData,
  });
  return res.data;
};

export const loginService = async (formData) => {
  const res = await axiosInstance.post("/auth/login", formData);
  return res.data;
};

export const logoutService = async () => {
  const res = await axiosInstance.post("/auth/logout");
  return res.data;
};

export const refreshTokenService = async () => {
  const res = await axiosInstance.post("/auth/refresh-token");
  return res.data;
};

export const getCurrentUserService = async () => {
  const res = await axiosInstance.get("/auth/me");
  return res.data;
};

export const checkAuthService = async () => {
  const res = await axiosInstance.get("/auth/check-auth");
  return res.data;
};

export const mediaUploadService = async (formData, onProgressCallBack) => {
  const res = await axiosInstance.post("/media/upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );
      onProgressCallBack(percentCompleted);
    },
  });
  return res.data;
};

export const mediaDeleteService = async (id) => {
  const res = await axiosInstance.delete(`/media/delete/${id}`);
  return res.data;
};

export const fetchInstructorCourseListService = async (instructorId, queryString = "") => {
  const url = `/instructor/course/get/${instructorId}${queryString ? `?${queryString}` : ""}`;
  const res = await axiosInstance.get(url);
  return res.data;
};

export const addNewCourseService = async (formData) => {
  const res = await axiosInstance.post("/instructor/course/add", formData);
  return res.data;
};

export const fetchInstructorCourseDetailsService = async (id) => {
  const res = await axiosInstance.get(`/instructor/course/get/details/${id}`);
  return res.data;
};

export const updateCourseByIdService = async (id, formData) => {
  const res = await axiosInstance.put(
    `/instructor/course/update/${id}`,
    formData,
  );
  return res.data;
};

export const deleteInstructorCourseService = async (id) => {
  const res = await axiosInstance.delete(`/instructor/course/delete/${id}`);
  return res.data;
};

export const reorderInstructorCourseLecturesService = async (
  id,
  curriculum,
) => {
  const res = await axiosInstance.put(
    `/instructor/course/reorder-lectures/${id}`,
    {
      curriculum,
    },
  );
  return res.data;
};

export const fetchInstructorAnalyticsService = async (instructorId, range = "6m") => {
  const res = await axiosInstance.get(`/instructor/analytics/${instructorId}?range=${range}`);
  return res.data;
};

export const fetchInstructorRevenueService = async (instructorId) => {
  const res = await axiosInstance.get(`/instructor/revenue/${instructorId}`);
  return res.data;
};

export const fetchInstructorStudentsService = async (instructorId) => {
  const res = await axiosInstance.get(`/instructor/students/${instructorId}`);
  return res.data;
};

// SaaS Analytics Services
export const fetchSaaSAnalyticsSummaryService = async () => {
  const res = await axiosInstance.get("/api/analytics/summary");
  return res.data;
};

export const fetchSaaSAnalyticsTrajectoryService = async (type = "monthly") => {
  const res = await axiosInstance.get(`/api/analytics/trajectory?type=${type}`);
  return res.data;
};

export const fetchSaaSAnalyticsTransactionsService = async () => {
  const res = await axiosInstance.get("/api/analytics/transactions");
  return res.data;
};

export const createStripeCheckoutService = async (courseId) => {
  const res = await axiosInstance.post("/api/analytics/checkout", { courseId });
  return res.data;
};

export const mediaBulkUploadService = async (formData, onProgressCallBack) => {
  const res = await axiosInstance.post("/media/bulk-upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );
      onProgressCallBack(percentCompleted);
    },
  });

  return res.data;
};

export const fetchStudentViewCourseListService = async (query) => {
  const res = await axiosInstance.get(`/student/course/get?${query}`);
  return res.data;
};

export const fetchStudentViewCourseDetailsService = async (courseId) => {
  const res = await axiosInstance.get(
    `/student/course/get/details/${courseId}`,
  );
  return res.data;
};

export const createPaymentService = async (formData) => {
  const res = await axiosInstance.post(`/student/order/create`, formData);
  return res.data;
};

export const captureAndFinalizePaymentService = async (formData) => {
  const res = await axiosInstance.post(`/student/order/capture`, formData);
  return res.data;
};

export const fetchStudentOrderHistoryService = async (userId) => {
  const res = await axiosInstance.get(`/student/order/history/${userId}`);
  return res.data;
};

export const fetchStudentBoughtCoursesService = async (studentId) => {
  const res = await axiosInstance.get(
    `/student/courses-bought/get/${studentId}`,
  );
  return res.data;
};

export const checkCoursePurchaseInfoService = async (courseId, studentId) => {
  const res = await axiosInstance.get(
    `/student/course/purchase-info/${courseId}/${studentId}`,
  );
  return res.data;
};

export const getStudentCurrentCourseProgressService = async (
  userId,
  courseId,
) => {
  const res = await axiosInstance.get(
    `/student/course-progress/get/${userId}/${courseId}`,
  );
  return res.data;
};

export const markLectureAsViewedService = async (
  userId,
  courseId,
  lectureId,
) => {
  const res = await axiosInstance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      userId,
      courseId,
      lectureId,
    },
  );
  return res.data;
};

export const resetCourseProgressService = async (userId, courseId) => {
  const res = await axiosInstance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    },
  );
  return res.data;
};

// New Services
export const updateUserProfileService = async (formData) => {
  const res = await axiosInstance.put("/user/update-profile", formData);
  return res.data;
};

export const getUserProfileService = async () => {
  const res = await axiosInstance.get("/user/profile");
  return res.data;
};

export const getUserEnrolledCoursesService = async (userId) => {
  const res = await axiosInstance.get(`/user/enrolled-courses/${userId}`);
  return res.data;
};

export const getUserPaymentHistoryService = async (userId) => {
  const res = await axiosInstance.get(`/user/payment-history/${userId}`);
  return res.data;
};

export const deleteUserAccountService = async (userId) => {
  const res = await axiosInstance.delete(`/user/delete-account/${userId}`);
  return res.data;
};

export const changePasswordService = async (formData) => {
  const res = await axiosInstance.put("/user/change-password", formData);
  return res.data;
};

export const addReviewService = async (formData) => {
  const res = await axiosInstance.post("/student/course/reviews/add", formData);
  return res.data;
};

export const getReviewsService = async (courseId) => {
  const res = await axiosInstance.get(
    `/student/course/reviews/get/${courseId}`,
  );
  return res.data;
};

export const searchCoursesService = async (query) => {
  const res = await axiosInstance.get(
    `/student/discovery/search?query=${encodeURIComponent(query)}`,
  );
  return res.data;
};

export const getAllCategoriesService = async () => {
  const res = await axiosInstance.get("/student/discovery/categories");
  return res.data;
};

export const getAllInstructorsService = async () => {
  const res = await axiosInstance.get("/student/discovery/instructors");
  return res.data;
};

export const getAllUsersService = async () => {
  const res = await axiosInstance.get("/admin/users/all");
  return res.data;
};

export const deleteUserService = async (userId) => {
  const res = await axiosInstance.delete(`/admin/users/delete/${userId}`);
  return res.data;
};
