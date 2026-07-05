**Live Demo: https://eguru-learn.vercel.app**

eGuru is a full-stack Learning Management System that connects instructors and students on a single platform. 
Instructors can create and sell courses with secure payouts, while students can purchase, watch, and earn certificates for completed courses all wrapped in a sleek dark-gold themed UI.

**✨ Features**

▪️Role-Based Access Control — Separate dashboards and permissions for Students and Instructors.

▪️Course Purchases — Students can browse, purchase, and access courses instantly.

▪️Instructor Payouts — Integrated with Razorpay Route, enabling automatic split payments so instructors get paid directly for course sales.

▪️Video Anti-Skip Protection — Custom logic (via maxWatchedRef) prevents students from skipping ahead in course videos, ensuring genuine content consumption before progress is marked complete.

▪️Auto-Generated Certificates — On course completion, a personalized certificate is generated client-side using html2canvas and made available for download.

▪️Star Ratings & Reviews — Students can rate and review courses after completion.

▪️Purchase History — Students can view all their past course purchases in one place.

▪️Responsive, Modern UI — Custom dark-gold design system for a premium learning experience.

**🛠️ Tech Stack**

**Frontend :**

React.js

Tailwind CSS

Fonts: Sora & DM Sans

html2canvas (certificate generation)

**Backend :**

▪️Node.js

▪️Express.js

▪️MongoDB Atlas (Mongoose ODM)

**Authentication :**

▪️JWT-based authentication

▪️Role-based middleware (student/instructor)

**Payments :** Razorpay Route (split payments for instructor payouts)

**Deployment :**

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas


**⚙️ Installation & Setup**

Prerequisites

Node.js (v16+)

MongoDB Atlas account

Razorpay account with Route enabled (for instructor payouts)


**1. Clone the repository**
git clone https://github.com/Me-Saksh-ire/eGuru.git
cd eGuru

**2. Backend Setup**

cd server
npm install

**🔑 Core Workflows**
Student Journey


▪️Sign up / log in as a student.

▪️Browse available courses and purchase via Razorpay.

▪️Watch course videos — progress only advances as far as actually watched (maxWatchedRef blocks skipping ahead).

▪️On completing all lessons, a certificate is auto-generated and downloadable.

▪️Leave a star rating and review for the course.

▪️View full purchase history from the dashboard.


**Instructor Journey**


▪️Sign up / log in as an instructor.

▪️Create and publish courses with video content.

▪️Receive payouts automatically via Razorpay Route whenever a student purchases their course — no manual settlement needed.

▪️Track course sales and student engagement from the instructor dashboard.




**🔐 Security & Access Control**


▪️JWT tokens issued at login, verified on every protected route.

▪️Middleware checks user role (student vs. instructor) before granting access to role-specific routes.

▪️CORS is explicitly scoped to trusted origins to prevent unauthorized cross-origin requests.



**📌 Future Improvements**


 ▪️Add discussion forums / Q&A per course
 
 ▪️Instructor analytics dashboard (revenue trends, student engagement)
 
 ▪️Course progress notifications/reminders
 
 ▪️Mobile app version

 ▪️Bulk certificate verification page (public certificate ID lookup)
