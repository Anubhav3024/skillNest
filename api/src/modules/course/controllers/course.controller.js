const mongoose = require("mongoose");
const Course = require("../../../models/course");
const { deleteMediaFromCloudinary } = require("../../../utils/cloudinary");
const { createBulkNotifications } = require("../../../utils/notification-service");

const hasMeaningfulValue = (value) =>
  value !== undefined && value !== null && !(typeof value === "string" && value.trim() === "");

const formatReadableDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const buildCourseChangeNotifications = ({ previousCourse, updatedCourse, sender }) => {
  const recipients = (previousCourse.students || [])
    .map((student) => student.studentId)
    .filter(Boolean);

  if (recipients.length === 0) {
    return [];
  }

  const notificationTemplates = [];
  const previousLectures = previousCourse.curriculum || [];
  const nextLectures = updatedCourse.curriculum || [];
  const curriculumChanged =
    JSON.stringify(previousLectures) !== JSON.stringify(nextLectures);
  const newLectures = nextLectures.filter(
    (lecture) =>
      !previousLectures.some(
        (oldLecture) =>
          String(oldLecture._id) === String(lecture._id) ||
          (oldLecture.videoUrl && oldLecture.videoUrl === lecture.videoUrl),
      ),
  );

  if (newLectures.length > 0) {
    const firstNewLecture = newLectures[0];
    notificationTemplates.push({
      title: "New lecture added",
      message:
        newLectures.length === 1
          ? `${sender.senderName} added "${firstNewLecture.title || "a new lecture"}" to "${updatedCourse.title}".`
          : `${sender.senderName} added ${newLectures.length} new lectures to "${updatedCourse.title}".`,
      type: "NEW_LECTURE",
      link: `/course/details/${updatedCourse._id}`,
      metadata: {
        courseTitle: updatedCourse.title,
        lectureTitles: newLectures.map((lecture) => lecture.title).filter(Boolean),
      },
    });
  }

  const previousDate = formatReadableDate(previousCourse.date);
  const nextDate = formatReadableDate(updatedCourse.date);
  if (previousDate !== nextDate && nextDate) {
    notificationTemplates.push({
      title: "Course schedule updated",
      message: `${sender.senderName} scheduled a new session date for "${updatedCourse.title}" on ${nextDate}.`,
      type: "COURSE_SCHEDULE",
      link: `/course/details/${updatedCourse._id}`,
      metadata: {
        courseTitle: updatedCourse.title,
        scheduledFor: nextDate,
      },
    });
  }

  const updatedFields = [];
  if (hasMeaningfulValue(updatedCourse.subtitle) && previousCourse.subtitle !== updatedCourse.subtitle) {
    updatedFields.push("course summary");
  }
  if (hasMeaningfulValue(updatedCourse.welcomeMessage) && previousCourse.welcomeMessage !== updatedCourse.welcomeMessage) {
    updatedFields.push("welcome note");
  }
  if (hasMeaningfulValue(updatedCourse.description) && previousCourse.description !== updatedCourse.description) {
    updatedFields.push("course details");
  }
  if (hasMeaningfulValue(updatedCourse.objectives) && previousCourse.objectives !== updatedCourse.objectives) {
    updatedFields.push("learning goals");
  }
  if (curriculumChanged && newLectures.length === 0) {
    updatedFields.push("course materials");
  }
  if (previousCourse.status !== updatedCourse.status && hasMeaningfulValue(updatedCourse.status)) {
    updatedFields.push("availability status");
  }

  if (updatedFields.length > 0) {
    notificationTemplates.push({
      title: "Course details refreshed",
      message: `${sender.senderName} updated ${updatedFields.join(", ")} for "${updatedCourse.title}".`,
      type: "COURSE_UPDATE",
      link: `/course/details/${updatedCourse._id}`,
      metadata: {
        courseTitle: updatedCourse.title,
        updatedFields,
      },
    });
  }

  return notificationTemplates.flatMap((template) =>
    recipients.map((recipientId) => ({
      recipientId,
      recipientRole: "student",
      senderId: sender.senderId,
      senderName: sender.senderName,
      courseId: updatedCourse._id,
      entityType: "course",
      entityId: String(updatedCourse._id),
      ...template,
    })),
  );
};

const addNewCourse = async (req, res) => {
// ... existing code ...
  try {
    const courseData = {
      ...req.body,
      instructorId: req.user?._id || req.body.instructorId,
      instructorName: req.user?.userName || req.body.instructorName,
    };
    const savedCourse = await Course.create(courseData);

    return res.status(201).json({
      success: true,
      message: "New Course created successfully",
      course: savedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating new course",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { search = "", sort = "" } = req.query;
    const requesterId = String(req.user?._id || "");

    if (!instructorId) {
      return res.status(400).json({
        success: false,
        message: "Instructor ID is required",
      });
    }

    // Ownership Check: Strictly enforce data isolation
    if (String(instructorId) !== requesterId && req.user?.role !== "admin") {
      console.warn(`Unauthorized course access attempt: ${requesterId} tried to access ${instructorId}`);
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only access your own manifests",
      });
    }

    // Prepare match stage for filtering
    let matchQuery = { instructorId: String(instructorId) };
    if (search) {
      matchQuery.title = { $regex: search, $options: "i" };
    }

    // Aggregation pipeline for advanced sorting and calculated fields
    const pipeline = [
      { $match: matchQuery },
      {
        $addFields: {
          revenue: { $sum: "$students.paidAmount" },
          studentCount: { $size: "$students" }
        }
      }
    ];

    // Sorting logic based on sort parameter
    let sortStage = { $sort: { createdAt: -1 } }; // Default: Newest first

    switch (sort.toLowerCase()) {
      case "mostpopular":
        sortStage = { $sort: { studentCount: -1, createdAt: -1 } };
        break;
      case "recententries":
        sortStage = { $sort: { createdAt: -1 } };
        break;
      case "maxrevenue":
        sortStage = { $sort: { revenue: -1, createdAt: -1 } };
        break;
      default:
        sortStage = { $sort: { createdAt: -1 } };
    }

    pipeline.push(sortStage);

    const courseList = await Course.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      message: "All courses fetched successfully",
      courseList,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching all courses",
    });
  }
};

const getCourseDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Error fetching course details",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      courseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching course details",
    });
  }
};

const updateCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const requesterId = String(req.user?._id || "");
    console.log("Update attempt:", { courseId: id, requesterId });

    const course = await Course.findById(id);

    if (!course) {
      console.log("Update failed: Course not found", id);
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    console.log("Course owner check:", { ownerId: course.instructorId, requesterId });
    if (String(course.instructorId) !== requesterId) {
      console.log("Update failed: Permission denied", { ownerId: course.instructorId, requesterId });
      return res.status(403).json({
        success: false,
        message: "Forbidden: you can only update your own courses",
      });
    }

    const previousCourseSnapshot = course.toObject();

    const updatedCourse = await Course.findByIdAndUpdate(id, update, {
      new: true,
    });

    const notifications = buildCourseChangeNotifications({
      previousCourse: previousCourseSnapshot,
      updatedCourse,
      sender: {
        senderId: requesterId,
        senderName: req.user?.userName || course.instructorName,
      },
    });

    if (notifications.length > 0) {
      await createBulkNotifications(notifications);
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating course",
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = String(req.user?._id || "");

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (String(course.instructorId) !== requesterId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you can only delete your own courses",
      });
    }

    // Cascading Delete: Purge Cloudinary Assets
    try {
      // 1. Delete course thumbnail
      if (course.imagePublicId) {
        await deleteMediaFromCloudinary(course.imagePublicId);
      }

      // 2. Delete curriculum media (Videos and Resources)
      if (course.curriculum && course.curriculum.length > 0) {
        for (const lecture of course.curriculum) {
          // Delete video
          if (lecture.public_id) {
            await deleteMediaFromCloudinary(lecture.public_id);
          }
          // Delete resources
          if (lecture.resources && lecture.resources.length > 0) {
            for (const resource of lecture.resources) {
              if (resource.public_id) {
                await deleteMediaFromCloudinary(resource.public_id);
              }
            }
          }
        }
      }
    } catch (mediaError) {
      console.error("Error purging media assets during course deletion:", mediaError);
      // We continue deletion of the DB record even if media purging fails partly
    }

    const deleted = await Course.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course and associated media deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting course",
    });
  }
};

const reorderLectures = async (req, res) => {
  try {
    const { id } = req.params;
    const { curriculum } = req.body;
    const requesterId = String(req.user?._id || "");

    const course = await Course.findById(id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (String(course.instructorId) !== requesterId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you can only reorder your own course lectures",
      });
    }

    if (
      !Array.isArray(curriculum) ||
      curriculum.length !== course.curriculum.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid curriculum payload",
      });
    }

    const existingLectureIds = new Set(
      course.curriculum.map((lecture) => String(lecture._id)),
    );

    const isValidCurriculum = curriculum.every(
      (lecture) =>
        lecture &&
        typeof lecture === "object" &&
        lecture._id &&
        typeof lecture.title === "string" &&
        typeof lecture.videoUrl === "string" &&
        typeof lecture.freePreview === "boolean" &&
        existingLectureIds.has(String(lecture._id)),
    );

    if (!isValidCurriculum) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid lecture data. Ensure all lectures belong to this course.",
      });
    }

    course.curriculum = curriculum;
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Lectures reordered successfully",
      curriculum: course.curriculum,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error reordering lectures",
    });
  }
};

module.exports = {
  addNewCourse,
  getAllCourses,
  getCourseDetailsById,
  updateCourseById,
  deleteCourse,
  reorderLectures,
};
