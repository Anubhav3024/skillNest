const mongoose = require("mongoose");
const Course = require("../../../models/course");
const { deleteMediaFromCloudinary } = require("../../../utils/cloudinary");

const addNewCourse = async (req, res) => {
// ... existing code ...
  try {
    const savedCourse = await Course.create(req.body);

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

    if (!instructorId) {
      return res.status(400).json({
        success: false,
        message: "Instructor ID is required",
      });
    }

    const courseList = await Course.find({ instructorId });

    return res.status(200).json({
      success: true,
      message: "All courses fetched successfully",
      courseList,
    });
  } catch (error) {
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

    const updatedCourse = await Course.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Error updating course",
      });
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
