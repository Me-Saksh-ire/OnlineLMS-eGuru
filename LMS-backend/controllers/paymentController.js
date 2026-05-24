import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Transfer from "../models/Transfer.js";
import User from "../models/User.js";

const PLATFORM_FEE_PERCENT = 20;

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/payment/create-order  (student)
// ══════════════════════════════════════════════════════════════════════════════
export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
      return res.json({
        success: false,
        message: "Payment gateway not configured. Contact admin.",
      });

    const course = await Course.findById(courseId);
    if (!course)
      return res.json({ success: false, message: "Course not found" });

    // Block duplicate paid enrollments
    const existing = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
      paymentStatus: "paid",
    });
    if (existing)
      return res.json({
        success: false,
        message: "Already enrolled in this course",
      });

    const razorpay = getRazorpay();

    const amount =
      course.discountPrice && course.discountPrice < course.price
        ? course.discountPrice
        : course.price;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay wants paise
      currency: process.env.CURRENCY || "INR",
      receipt: `receipt_${Date.now()}`,
    });

    await Payment.create({
      user: req.user.id,
      course: courseId,
      razorpayOrderId: order.id,
      amount,
      status: "pending",
    });

    return res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("createOrder error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/payment/verify  (student)
// ══════════════════════════════════════════════════════════════════════════════
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = req.body;

    // ── 1. Verify Razorpay signature ─────────────────────────────────────────
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.json({ success: false, message: "Invalid payment signature" });

    // ── 2. Mark Payment as paid ───────────────────────────────────────────────
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
      { new: true }, // return updated doc so we have payment._id + amount
    );

    // ── 3. Create or update Enrollment ───────────────────────────────────────
    const existing = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
    });

    let isNewPaidEnrollment = false;

    if (!existing) {
      await Enrollment.create({
        user: req.user.id,
        course: courseId,
        paymentStatus: "paid",
      });
      isNewPaidEnrollment = true;
    } else if (existing.paymentStatus !== "paid") {
      existing.paymentStatus = "paid";
      await existing.save();
      isNewPaidEnrollment = true;
    }

    if (isNewPaidEnrollment) {
      await Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } });
    }

    // ── 4. Razorpay Route — transfer instructor's share ──────────────────────
    await transferToInstructor({
      courseId,
      payment,
      razorpayPaymentId: razorpay_payment_id,
      studentId: req.user.id,
    });

    return res.json({
      success: true,
      message: "Payment verified. Enrolled successfully!",
    });
  } catch (error) {
    console.error("verifyPayment error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

const transferToInstructor = async ({
  courseId,
  payment,
  razorpayPaymentId,
  studentId,
}) => {
  try {
    // Fetch course + instructor
    const course = await Course.findById(courseId).populate(
      "instructor",
      "name email razorpayLinkedAccountId",
    );
    if (!course) throw new Error("Course not found for transfer");

    const instructor = course.instructor;
    const grossAmount = payment.amount; // in ₹

    // Calculate split
    const platformFee = parseFloat(
      ((grossAmount * PLATFORM_FEE_PERCENT) / 100).toFixed(2),
    );
    const instructorAmount = parseFloat((grossAmount - platformFee).toFixed(2));

    if (!instructor.razorpayLinkedAccountId) {
      await Transfer.create({
        instructor: instructor._id,
        course: courseId,
        payment: payment._id,
        student: studentId,
        razorpayPaymentId,
        grossAmount,
        platformFeePercent: PLATFORM_FEE_PERCENT,
        platformFee,
        instructorAmount,
        status: "skipped",
        failureReason: "Instructor has no linked Razorpay account yet",
      });
      console.warn(
        `Transfer skipped for instructor ${instructor._id} — no linked account`,
      );
      return;
    }

    // Call Razorpay Route API
    const razorpay = getRazorpay();
    const transfer = await razorpay.payments.transfer(razorpayPaymentId, {
      transfers: [
        {
          account: instructor.razorpayLinkedAccountId,
          amount: Math.round(instructorAmount * 100), // paise
          currency: "INR",
          notes: {
            course_title: course.title,
            course_id: String(courseId),
            instructor_id: String(instructor._id),
          },
          linked_account_notes: ["course_title"],
          on_hold: 0,
        },
      ],
    });

    const transferId = transfer?.items?.[0]?.id || null;

    await Transfer.create({
      instructor: instructor._id,
      course: courseId,
      payment: payment._id,
      student: studentId,
      razorpayPaymentId,
      razorpayTransferId: transferId,
      razorpayLinkedAccountId: instructor.razorpayLinkedAccountId,
      grossAmount,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      platformFee,
      instructorAmount,
      status: "processed",
    });

    console.log(
      `✅ Transfer ${transferId}: ₹${instructorAmount} → instructor ${instructor._id}`,
    );
  } catch (error) {
    console.error("transferToInstructor error:", error.message);
    try {
      const course = await Course.findById(courseId).select("instructor price");
      await Transfer.create({
        instructor: course?.instructor,
        course: courseId,
        payment: payment._id,
        student: studentId,
        razorpayPaymentId,
        grossAmount: payment.amount,
        platformFeePercent: PLATFORM_FEE_PERCENT,
        platformFee: parseFloat(
          ((payment.amount * PLATFORM_FEE_PERCENT) / 100).toFixed(2),
        ),
        instructorAmount: parseFloat(
          (payment.amount * (1 - PLATFORM_FEE_PERCENT / 100)).toFixed(2),
        ),
        status: "failed",
        failureReason: error.message,
      });
    } catch (logErr) {
      console.error("Also failed to log Transfer:", logErr.message);
    }
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user.id,
      status: "paid",
    }).populate("course", "title price thumbnail");
    return res.json({ success: true, payments });
  } catch (error) {
    console.error(error.message);
    return res.json({ success: false, message: error.message });
  }
};

export const getPendingTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find({
      status: { $in: ["skipped", "failed"] },
    })
      .populate("instructor", "name email")
      .populate("course", "title")
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, transfers });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
