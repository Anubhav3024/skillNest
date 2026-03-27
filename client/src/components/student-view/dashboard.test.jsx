/* eslint-env jest */
/* global jest, describe, it, expect, beforeEach */
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import StudentDashboard from "../dashboard";
import "@testing-library/jest-dom"; // Required for DOM assertions like toBeInTheDocument

// 1. Mock the router's navigation hook
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("StudentDashboard Component", () => {
  // 2. Setup reusable mock data for our Context providers
  const mockAuthContextValue = {
    auth: {
      user: {
        _id: "user123",
        userName: "jane doe", // Lowercase to test the capitalization function
        userEmail: "jane.doe@example.com",
        role: "student",
      },
    },
    resetCredentials: jest.fn(),
  };

  const mockStudentContextValue = {
    dashboardData: {
      activeCourse: {
        _id: "course1",
        title: "Advanced React Patterns",
        progressPercent: 60,
        completedLectures: 12,
        totalLectures: 20,
      },
      stats: {
        totalEnrolled: 3,
        totalInProgress: 2,
        totalCompleted: 1,
        totalLecturesCompleted: 45,
      },
      recommendations: [],
      enrolledCourses: [],
      recentOrders: [],
    },
    dashboardLoading: false,
    fetchDashboard: jest.fn(),
  };

  // 3. Helper function to wrap the component in necessary providers
  const renderDashboard = (
    authValue = mockAuthContextValue,
    studentValue = mockStudentContextValue,
  ) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <StudentContext.Provider value={studentValue}>
          <BrowserRouter>
            <StudentDashboard />
          </BrowserRouter>
        </StudentContext.Provider>
      </AuthContext.Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the loading state when dashboardLoading is true", () => {
    // Arrange: Force the loading state
    renderDashboard(mockAuthContextValue, {
      ...mockStudentContextValue,
      dashboardLoading: true,
    });

    // Assert: Check if the loading text is visible
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("should render the welcome message with properly capitalized username", () => {
    renderDashboard();

    // Assert: Capitalize function should change "jane doe" to "Jane Doe"
    expect(screen.getByText(/Welcome back, Jane Doe/i)).toBeInTheDocument();
    // It should pluralize "course(s)" since totalEnrolled is 3
    expect(
      screen.getByText(/You have 3 active courses. Keep going!/i),
    ).toBeInTheDocument();
  });

  it("should render the active course details on the Dashboard tab", () => {
    renderDashboard();

    expect(screen.getByText(/Advanced React Patterns/i)).toBeInTheDocument();
    expect(screen.getByText(/60% Complete/i)).toBeInTheDocument();
    expect(screen.getByText(/12 \/ 20 Lectures/i)).toBeInTheDocument();
  });

  it("should call fetchDashboard on mount if user id is present", () => {
    renderDashboard();
    expect(mockStudentContextValue.fetchDashboard).toHaveBeenCalledWith(
      "user123",
    );
  });

  it("should change tabs when clicking sidebar links", async () => {
    renderDashboard();

    // Act: Click on the Profile tab
    const profileLink = screen.getByRole("button", { name: /Profile/i });
    fireEvent.click(profileLink);

    // Assert: The user email from the auth context should now be visible on the Profile tab
    expect(await screen.findByText("jane.doe@example.com")).toBeInTheDocument();
  });
});
