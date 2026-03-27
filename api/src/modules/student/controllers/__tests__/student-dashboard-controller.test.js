/* eslint-env node, jest */
/* global describe, it, expect, beforeEach, jest */
const { getStudentDashboard } = require("../student-dashboard-controller");
const Course = require("../../../../models/course");
const StudentCourses = require("../../../../models/student-courses");
const CourseProgress = require("../../../../models/course-Progress");
const Order = require("../../../../models/Order");

// 1. Mock the Mongoose models
jest.mock("../../../../models/course");
jest.mock("../../../../models/student-courses");
jest.mock("../../../../models/course-Progress");
jest.mock("../../../../models/Order");

describe("Student Dashboard Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // 2. Setup mock Request and Response objects
    mockReq = {
      params: { userId: "user123" },
      user: { _id: "user123" },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(), // allows chaining like res.status(200).json()
      json: jest.fn(),
    };
  });

  it("should return 403 Forbidden if user ID does not match", async () => {
    // Arrange: Simulate a user trying to access someone else's dashboard
    mockReq.user._id = "differentUser456";

    // Act
    await getStudentDashboard(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Forbidden",
    });
  });

  it("should successfully fetch and format student dashboard data", async () => {
    // Arrange: Set up our mocked database responses
    const mockStudentCourses = {
      userId: "user123",
      courses: [{ courseId: "course1", dateOfPurchase: "2023-01-01" }],
    };
    
    const mockEnrolledCourses = [
      { _id: "course1", title: "Test Course", curriculum: [{}, {}] }
    ];

    const mockProgressDocs = [
      { 
        courseId: "course1", 
        completed: false, 
        lecturesProgress: [{ viewed: true, dateViewed: "2023-10-10" }] 
      }
    ];

    // Setup mock returns for the database calls
    StudentCourses.findOne.mockResolvedValue(mockStudentCourses);
    
    // Note: Mongoose chainable methods like .lean(), .sort(), .limit() require special mocking
    Course.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockEnrolledCourses),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis()
    });

    CourseProgress.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockProgressDocs)
    });

    Order.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([])
    });

    // Act
    await getStudentDashboard(mockReq, mockRes);

    // Assert
    expect(StudentCourses.findOne).toHaveBeenCalledWith({ userId: "user123" });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    
    // Check if the json response is structured correctly
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          stats: expect.objectContaining({
            totalEnrolled: 1,
          }),
          enrolledCourses: expect.any(Array)
        })
      })
    );
  });

  it("should return 500 if an error occurs during fetching", async () => {
    // Arrange: Force a database error
    StudentCourses.findOne.mockRejectedValue(new Error("Database connection failed"));

    // Act
    await getStudentDashboard(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Error fetching student dashboard data",
    });
  });
});
