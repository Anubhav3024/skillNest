const Stripe = require("stripe");
const Order = require("../../../models/Order");
const StudentCourses = require("../../../models/student-courses");
const Course = require("../../../models/course");
const { emitToInstructor } = require("../../../utils/socket-service");

// Safety check for Stripe Key
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.warn("WARNING: STRIPE_SECRET_KEY is missing in .env. Stripe features will be disabled.");
}
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              images: [course.image],
            },
            unit_amount: Math.round(parseFloat(course.pricing) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-return?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-return?status=cancel`,
      metadata: {
        courseId: String(course._id),
        userId: String(userId),
        instructorId: String(course.instructorId),
        courseTitle: course.title,
        coursePricing: String(course.pricing),
        userName: req.user.userName,
        userEmail: req.user.userEmail,
      },
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ success: false, message: "Error creating checkout session" });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Signature Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { courseId, userId, instructorId, courseTitle, coursePricing, userName, userEmail } = session.metadata;

    try {
      // 1. Create a successful Order
      const newOrder = new Order({
        userId,
        userName,
        userEmail,
        orderStatus: "confirmed",
        paymentMethod: "stripe",
        paymentStatus: "paid",
        orderDate: new Date(),
        paymentId: session.payment_intent,
        instructorId,
        courseTitle,
        courseId,
        coursePricing,
      });
      await newOrder.save();

      // 2. Enroll Student
      let studentCourses = await StudentCourses.findOne({ userId });
      if (studentCourses) {
        studentCourses.courses.push({
          courseId,
          title: courseTitle,
          instructorId,
          dateOfPurchase: new Date(),
        });
        await studentCourses.save();
      } else {
        const newStudentCourses = new StudentCourses({
          userId,
          courses: [{
            courseId,
            title: courseTitle,
            instructorId,
            dateOfPurchase: new Date(),
          }],
        });
        await newStudentCourses.save();
      }

      // 3. Update Course student list
      await Course.findByIdAndUpdate(courseId, {
        $push: {
          students: {
            studentId: userId,
            studentName: userName,
            studentEmail: userEmail,
            paidAmount: coursePricing,
          }
        }
      });

      // 4. Emit Real-time Update to Instructor
      emitToInstructor(instructorId, "dashboard-update", {
        type: "NEW_ENROLLMENT",
        message: `New student enrolled in ${courseTitle}`,
        revenue: coursePricing
      });

    } catch (dbError) {
      console.error("Webhook DB Processing Error:", dbError);
    }
  }

  res.json({ received: true });
};

module.exports = { createCheckoutSession, handleWebhook };
