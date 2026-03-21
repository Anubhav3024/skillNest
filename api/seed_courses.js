require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("./modals/course");

const sampleCourses = [
  {
    instructorId: "64f1a2b3c4d5e6f7a8b9c0d1",
    instructorName: "John Doe",
    date: new Date(),
    title: "Full Stack Web Development",
    category: "web-development",
    level: "beginner",
    primaryLanguage: "english",
    subtitle: "Master HTML, CSS, React and Node.js",
    description: "Learn how to build modern web applications from scratch.",
    pricing: 49.99,
    objectives:
      "Build a portfolio project, Understand REST APIs, Deploy web apps.",
    welcomeMessage: "Welcome to the Full Stack course!",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    imagePublicId: "web-dev-course",
    curriculum: [
      {
        title: "Introduction",
        videoUrl: "https://example.com/video1",
        freePreview: true,
        public_id: "vid1",
      },
      {
        title: "HTML Basics",
        videoUrl: "https://example.com/video2",
        freePreview: false,
        public_id: "vid2",
      },
    ],
    isPublished: true,
  },
  {
    instructorId: "64f1a2b3c4d5e6f7a8b9c0d2",
    instructorName: "Jane Smith",
    date: new Date(),
    title: "Advanced Node.js Patterns",
    category: "backend-development",
    level: "advanced",
    primaryLanguage: "english",
    subtitle: "Deep dive into Node.js architecture",
    description:
      "Learn advanced patterns like Microservices, Caching, and Streaming.",
    pricing: 79.99,
    objectives: "Scale Node.js apps, Master asynchronous patterns.",
    welcomeMessage: "Welcome to advanced backend development!",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    imagePublicId: "node-adv-course",
    curriculum: [
      {
        title: "Event Loop Deep Dive",
        videoUrl: "https://example.com/video3",
        freePreview: true,
        public_id: "vid3",
      },
    ],
    isPublished: true,
  },
  {
    instructorId: "64f1a2b3c4d5e6f7a8b9c0d3",
    instructorName: "Elon Tech",
    date: new Date(),
    title: "Python for Data Science",
    category: "data-science",
    level: "beginner",
    primaryLanguage: "english",
    subtitle: "Analyze data like a pro",
    description:
      "Use Pandas, Matplotlib, and Seaborn to gain insights from data.",
    pricing: 59.99,
    objectives: "Visualize data, Clean datasets.",
    welcomeMessage: "Get ready to explore data!",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    imagePublicId: "data-science-course",
    curriculum: [
      {
        title: "Setting up Environment",
        videoUrl: "https://example.com/video4",
        freePreview: true,
        public_id: "vid4",
      },
    ],
    isPublished: true,
  },
];

async function seedData() {
  let connected = false;
  try {
    if (!process.env.MONGO_URL || !process.env.MONGO_URL.trim()) {
      console.error("Missing required environment variable: MONGO_URL");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URL);
    connected = true;
    console.log("Connected to MongoDB");

    await Course.deleteMany({}); // Optional: Clear existing courses
    console.log("Cleared existing courses");

    await Course.insertMany(sampleCourses);
    console.log("Seeded sample courses successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exitCode = 1;
  } finally {
    if (connected) {
      await mongoose.disconnect();
    }
    if (process.exitCode === 1) {
      process.exit(1);
    }
  }
}

seedData();
