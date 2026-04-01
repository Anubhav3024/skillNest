const mongoose = require("mongoose");
require("dotenv").config();
const HelpCategory = require("../src/models/help-category");
const HelpArticle = require("../src/models/help-article");
const LegalDocument = require("../src/models/legal-document");

const categories = [
  { name: "Platform Guide", slug: "platform-guide", icon: "Rocket", description: "How to use SkillNest sections" },
  { name: "Student Experience", slug: "student", icon: "User", description: "Learn as a student" },
  { name: "Educator Experience", slug: "educator", icon: "GraduationCap", description: "Teach as an instructor" },
  { name: "Auth & Account", slug: "auth", icon: "Settings", description: "Registration and login guide" },
  { name: "Dashboard & Tools", slug: "dashboard", icon: "BookOpen", description: "Understanding your workspace" },
  { name: "Transactions & Support", slug: "transactions", icon: "CreditCard", description: "Payments and billing formats" },
];

const articles = [
  {
    categorySlug: "platform-guide",
    title: "How to navigate SkillNest",
    slug: "how-to-navigate",
    content: `
# Navigating SkillNest
SkillNest is divided into several main sections to help you learn and teach effectively:

- **Landing Page**: Your starting point to explore categories and the brand story.
- **Student Section**: Access your enrolled courses and track progress.
- **Educator Section (Instructor)**: Create courses, manage students, and view revenue analytics.
- **Course Discovery**: Use the Browse tab to find new learning opportunities.
`,
    tags: ["navigation", "guide", "overview"],
    isFeatured: true
  },
  {
    categorySlug: "auth",
    title: "How to register and login",
    slug: "registration-guide",
    content: `
# Registration & Authentication
Joining SkillNest is straightforward:

1. **Sign Up**: Click 'Sign Up' in the footer or menu.
2. **Select Role**: Choose 'Student' to learn or 'Educator' to teach.
3. **Methods**: You can register using your email or via GitHub/Google for instant access.
4. **Login**: Use your credentials on the 'Sign In' tab to return to your dashboard.
`,
    tags: ["signup", "login", "auth"]
  },
  {
    categorySlug: "dashboard",
    title: "Understanding your Dashboard",
    slug: "dashboard-guide",
    content: `
# Dashboard Overview
Your dashboard is your personalized command center on SkillNest:

- **Student Dashboard**: View 'My Courses' to resume learning, check activity feeds, and manage your profile.
- **Instructor Dashboard**: Manage your 'Course Vault', track 'Student Enrollments', and view real-time 'Revenue Milestones'.
- **Settings**: Customize notifications, security (2FA), and public profile visibility.
`,
    tags: ["dashboard", "student-view", "instructor-view"]
  },
  {
    categorySlug: "transactions",
    title: "Transaction formats & history",
    slug: "transaction-format",
    content: `
# Transaction History
SkillNest ensures secure and transparent billing:

- **Purchase History**: Located in your Student Profile under the 'Transactions' tab.
- **Format**: Each transaction includes a unique ID, product name, date, and payment status.
- **Payment Methods**: We support Stripe and PayPal for global, high-security transaction processing.
`,
    tags: ["billing", "payments", "receipts"]
  }
];

const privacyContent = `
# Privacy Policy
Last Updated: April 2026

SkillNest (“we”, “our”, “us”) is committed to protecting your privacy and ensuring a secure learning experience. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.

## 1. Information We Collect
We collect the following types of information:

### a. Personal Information
- Name
- Email address
- Profile details (photo, bio, preferences)

### b. Account & Usage Data
- Courses enrolled
- Learning progress
- Activity history (lectures watched, interactions)

### c. Payment Information
- Transaction details (handled securely via third-party providers)
- We do NOT store card details

### d. Device & Technical Data
- IP address
- Browser type
- Device information
- Cookies and tracking data

## 2. How We Use Your Information
We use your data to:
- Provide and personalize your learning experience
- Recommend relevant courses and content
- Track progress and performance analytics
- Improve platform features and performance
- Process payments and manage subscriptions
- Communicate updates, support, and notifications

## 3. Sharing of Information
We do NOT sell your personal data. We may share information with:
- Service providers (payment gateways, hosting, analytics)
- Educators (only necessary learning-related data)
- Legal authorities (if required by law)

## 4. Cookies & Tracking Technologies
SkillNest uses cookies to:
- Enhance user experience
- Remember preferences
- Analyze platform usage
You can control cookies via your browser settings.

## 5. Data Security
We implement industry-standard security measures:
- Encrypted data transmission (HTTPS)
- Secure authentication systems
- Access control and monitoring
However, no system is 100% secure.

## 6. Your Rights
You have the right to:
- Access your personal data
- Update or correct your information
- Delete your account
- Opt out of marketing communications

To request any changes, contact us at: support@skillnest.com

## 7. Data Retention
We retain your data:
- As long as your account is active
- As required for legal or operational purposes

## 8. Third-Party Services
SkillNest may use third-party tools such as:
- Payment gateways
- Analytics services
- Cloud hosting providers
These services follow their own privacy policies.

## 9. Children’s Privacy
SkillNest is not intended for users under the age of 13. We do not knowingly collect data from children.

## 10. Updates to This Policy
We may update this Privacy Policy periodically. Changes will be reflected with a revised “Last Updated” date.

## 11. Contact Us
If you have any questions regarding this Privacy Policy:
- 📧 Email: support@skillnest.com
- 🌐 Platform: SkillNest Support Center
`;

const termsContent = `
# Terms of Service
Last Updated: April 2026

Welcome to SkillNest. By accessing or using our platform, you agree to comply with these Terms of Service (“Terms”). Please read them carefully before using our services.

## 1. Acceptance of Terms
By creating an account or using SkillNest, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not use the platform.

## 2. User Accounts
- You must provide accurate and complete information
- You are responsible for maintaining account confidentiality
- You are responsible for all activities under your account
- SkillNest reserves the right to suspend or terminate accounts for violations

## 3. Use of Platform
You agree NOT to:
- Use the platform for illegal or unauthorized purposes
- Copy, distribute, or resell course content without permission
- Attempt to hack, disrupt, or misuse the system
- Upload harmful, abusive, or misleading content

## 4. Courses & Learning Content
- Courses are provided by SkillNest and/or educators
- Content is for personal, non-commercial use only
- SkillNest does not guarantee job placement or outcomes
- Course availability may change without notice

## 5. Payments & Refunds
- All payments must be made through approved methods
- Pricing is subject to change at any time
- Refunds are governed by our refund policy (if applicable)
- Failure of transactions may require reprocessing

## 6. Intellectual Property
- All content (courses, design, branding) belongs to SkillNest or its licensors
- You may not copy, reproduce, or distribute without permission
- Unauthorized use may result in legal action

## 7. Account Suspension & Termination
We reserve the right to:
- Suspend or terminate accounts violating these Terms
- Remove content that breaches policies
- Restrict access without prior notice in severe cases

## 8. Limitation of Liability
SkillNest is not liable for:
- Any indirect or consequential damages
- Loss of data, progress, or opportunities
- Interruptions or errors in platform availability
Use of the platform is at your own risk.

## 9. Third-Party Services
SkillNest may integrate third-party services (payments, analytics, etc.). We are not responsible for their policies or actions.

## 10. Changes to Terms
We may update these Terms periodically. Continued use of the platform after changes implies acceptance of the updated Terms.

## 11. Governing Law
These Terms are governed by applicable laws of your jurisdiction.

## 12. Contact Information
For any questions regarding these Terms:
- 📧 Email: support@skillnest.com
- 🌐 SkillNest Help Center
`;

const seed = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || "mongodb+srv://admin:admin@cluster0.mongodb.net/skillnest";
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB for advanced seeding...");

    // Clear existing
    await HelpCategory.deleteMany({});
    await HelpArticle.deleteMany({});
    await LegalDocument.deleteMany({});

    // Seed Categories
    const savedCategories = await HelpCategory.insertMany(categories);
    console.log("Categories seeded!");

    // Seed Articles
    for (const art of articles) {
      const cat = savedCategories.find(c => c.slug === art.categorySlug);
      if (cat) {
        await HelpArticle.create({ ...art, categoryId: cat._id });
      }
    }
    console.log("Articles seeded!");

    // Seed Legal
    await LegalDocument.create({ type: "privacy", content: privacyContent });
    await LegalDocument.create({ type: "terms", content: termsContent });
    console.log("Legal documents seeded!");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seed();
