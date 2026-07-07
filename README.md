# eGuru — Learning Management System (LMS)

**Live Demo:** [eguru-learn.vercel.app](https://eguru-learn.vercel.app/)

eGuru is a full-stack Learning Management System that connects instructors and students on a single platform. Instructors can create and sell courses with secure payouts, while students can purchase, watch, and earn certificates for completed courses — all wrapped in a sleek dark-gold themed UI.

---

## ✨ Features

- **Role-Based Access Control** — Separate dashboards and permissions for **Students** and **Instructors**.
- **Course Purchases** — Students can browse, purchase, and access courses instantly.
- **Instructor Payouts** — Integrated with **Razorpay Route**, enabling automatic split payments so instructors get paid directly for course sales.
- **Video Anti-Skip Protection** — Custom logic (via `maxWatchedRef`) prevents students from skipping ahead in course videos, ensuring genuine content consumption before progress is marked complete.
- **Auto-Generated Certificates** — On course completion, a personalized certificate is generated client-side using `html2canvas` and made available for download.
- **Star Ratings & Reviews** — Students can rate and review courses after completion.
- **Purchase History** — Students can view all their past course purchases in one place.
- **Responsive, Modern UI** — Custom dark-gold design system for a premium learning experience.

---

## 🛠️ Tech Stack

**Frontend**
- React.js
- Tailwind CSS
- Fonts: **Sora** & **DM Sans**
- `html2canvas` (certificate generation)

**Backend**
- Node.js
- Express.js
- MongoDB Atlas (Mongoose ODM)

**Authentication**
- JWT-based authentication
- Role-based middleware (student/instructor)

**Payments**
- Razorpay Route (split payments for instructor payouts)

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 🎨 Design System

---

## 📂 Project Structure

```
eGuru/
├── client/                     # React frontend (deployed on Vercel)
│   ├── src/
│   │   ├── components/         # Reusable UI components (VideoPlayer, CourseCard, etc.)
│   │   ├── pages/               # Student & Instructor pages
│   │   ├── context/             # Auth & role-based context providers
│   │   ├── utils/                # Certificate generator, helpers
│   │   └── App.jsx
│   └── package.json
│
├── server/                     # Express backend (deployed on Render)
│   ├── controllers/            # Course, user, payment, certificate logic
│   ├── models/                 # Mongoose schemas (User, Course, Purchase, Review)
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Auth & role verification
│   ├── utils/                  # Razorpay Route helpers
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Razorpay account with **Route** enabled (for instructor payouts)

### 1. Clone the repository
```bash
git clone https://github.com/Me-Saksh-ire/eGuru.git
cd eGuru
```

### 2. Backend Setup
```bash
cd server
npm install
```

Run the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Run the frontend:
```bash
npm run dev
```

---

## 🔑 Core Workflows

### Student Journey
1. Sign up / log in as a student.
2. Browse available courses and purchase via Razorpay.
3. Watch course videos — progress only advances as far as actually watched (`maxWatchedRef` blocks skipping ahead).
4. On completing all lessons, a certificate is auto-generated and downloadable.
5. Leave a star rating and review for the course.
6. View full purchase history from the dashboard.

### Instructor Journey
1. Sign up / log in as an instructor.
2. Create and publish courses with video content.
3. Receive payouts automatically via **Razorpay Route** whenever a student purchases their course — no manual settlement needed.
4. Track course sales and student engagement from the instructor dashboard.

---

## 🔐 Security & Access Control

- JWT tokens issued at login, verified on every protected route.
- Middleware checks user role (student vs. instructor) before granting access to role-specific routes.
- CORS is explicitly scoped to trusted origins to prevent unauthorized cross-origin requests.

---

## 🚀 Deployment

- **Frontend:** [Vercel](https://vercel.com) — [eguru-learn.vercel.app](https://eguru-learn.vercel.app/)
- **Backend:** [Render](https://render.com)
- **Database:** MongoDB Atlas

---

## 📌 Future Improvements

- [ ] Add discussion forums / Q&A per course
- [ ] Instructor analytics dashboard (revenue trends, student engagement)
- [ ] Course progress notifications/reminders
- [ ] Mobile app version

---

## 👩‍💻 Author

**Sakshi**
MERN Stack Developer
[Portfolio](https://sakshi-portfolio-sepia.vercel.app)
[GitHub](https://github.com/Me-Saksh-ire)

---
