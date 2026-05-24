import logo from "./logo.png";
import sarah from "./sarah.png";
import emily from "./emily.png";
import user_profile from "./user_profile.png";
import bagIcon from "./bag-icon.svg";
import dashboardIcon from "./dashboardIcon.svg";
import dashboardIconColored from "./dashboardIconColored.svg";
import inboxIcon from "./inboxIcon.svg";
import inboxIconColored from "./inboxIconColored.svg";
import lessonIcon from "./lessonIcon.svg";
import lessonIconColored from "./lessonIconColored.svg";
import coursesIcon from "./coursesIcon.svg";
import coursesIconColored from "./coursesIconColored.svg";
import scheduleIcon from "./scheduleIcon.svg";
import scheduleIconColored from "./scheduleIconColored.svg";
import shoppingCart from "./shopping-cart.svg";
import trash from "./trash-2.svg";
import funnel from "./funnel.svg";
import searchIcon from "./searchIcon.svg";
import eguruSignature from "./eguru-signature.png";

export const assets = {
  logo,
  user_profile,
  sarah,
  emily,
  bagIcon,
  dashboardIcon,
  dashboardIconColored,
  inboxIcon,
  inboxIconColored,
  lessonIcon,
  lessonIconColored,
  coursesIcon,
  coursesIconColored,
  scheduleIcon,
  scheduleIconColored,
  shoppingCart,
  trash,
  funnel,
  searchIcon,
  eguruSignature,
};

export const ownerMenuLinks = [
  {
    name: "Dashboard",
    path: "/teacher",
    icon: dashboardIcon,
    coloredIcon: dashboardIconColored,
  },
  {
    name: "Inbox",
    path: "/teacher/inbox",
    icon: inboxIcon,
    coloredIcon: inboxIconColored,
  },
  {
    name: "My Courses",
    path: "/teacher/my-courses",
    icon: coursesIcon,
    coloredIcon: coursesIconColored,
  },
  {
    name: "Upload Video",
    path: "/teacher/upload",
    icon: lessonIcon,
    coloredIcon: lessonIconColored,
  },
  {
    name: "Schedule",
    path: "/teacher/schedule",
    icon: scheduleIcon,
    coloredIcon: scheduleIconColored,
  },
];

export const dummyUserData = {
  _id: "user_001",
  name: "Nick Johnson",
  email: "nick@gmail.com",
  role: "student",
  image: emily,
  enrolledCourses: [1, 2],
  purchaseHistory: [],
};

export const teacherData = {
  _id: "teacher_001",
  name: "John Smith",
  email: "john@eguru.com",
  role: "teacher",
  image: user_profile,
  bio: "Full-stack developer with 10 years of experience",
  totalStudents: 15420,
  totalCourses: 8,
  rating: 4.8,
};

// Courses data
export const courses = [
  {
    id: 1,
    title: "Complete React Developer Course",
    description:
      "Master React from basics to advanced concepts. Build real-world projects and learn best practices.",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
    category: "Development",
    level: "Beginner to Advanced",
    price: 899.99,
    discountPrice: 499.99,
    rating: 4.8,
    totalReviews: 2340,
    totalStudents: 15420,
    totalLessons: 12,
    totalDuration: "24h 30m",
    instructor: {
      id: "teacher_001",
      name: "John Smith",
      avatar: user_profile,
    },
    syllabus: [
      "Introduction to React",
      "Components and Props",
      "State Management",
      "Hooks in Detail",
      "React Router",
      "API Integration",
      "Advanced Patterns",
      "Testing React Apps",
    ],
    lastUpdated: "2024-01-15",
    language: "English",
    requirements: ["Basic JavaScript knowledge", "HTML & CSS fundamentals"],
    whatYouWillLearn: [
      "Build modern React applications",
      "Understand component lifecycle",
      "Master React Hooks",
      "Implement routing and navigation",
      "Work with APIs and async data",
      "Deploy React applications",
    ],
  },
  {
    id: 2,
    title: "UI/UX Design Masterclass with Figma",
    description:
      "Learn professional UI/UX design principles and master Figma from scratch.",
    thumbnail:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
    category: "Design",
    level: "Beginner",
    price: 799.99,
    discountPrice: 399.99,
    rating: 4.9,
    totalReviews: 1850,
    totalStudents: 8900,
    totalLessons: 8,
    totalDuration: "18h 45m",
    instructor: {
      id: "teacher_002",
      name: "Sarah Johnson",
      avatar: sarah,
    },
    syllabus: [
      "Design Fundamentals",
      "Figma Interface",
      "Components & Variants",
      "Design Systems",
      "Prototyping",
      "User Research",
      "Responsive Design",
      "Portfolio Building",
    ],
    lastUpdated: "2024-01-10",
    language: "English",
    requirements: ["No prior design experience needed"],
    whatYouWillLearn: [
      "Master Figma tools and features",
      "Create professional designs",
      "Build design systems",
      "Prototype interactive designs",
      "Conduct user research",
      "Build a stunning portfolio",
    ],
  },
  {
    id: 3,
    title: "Python for Data Science & Machine Learning",
    description:
      "Complete Python course covering data analysis, visualization, and machine learning.",
    thumbnail:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop",
    category: "Data Science",
    level: "Intermediate",
    price: 989.99,
    discountPrice: 589.99,
    rating: 4.7,
    totalReviews: 3200,
    totalStudents: 12500,
    totalLessons: 15,
    totalDuration: "32h 15m",
    instructor: {
      id: "teacher_003",
      name: "Dr. Emily Chen",
      avatar: emily,
    },
    syllabus: [
      "Python Basics",
      "NumPy & Pandas",
      "Data Visualization",
      "Statistical Analysis",
      "Machine Learning Intro",
      "Supervised Learning",
      "Unsupervised Learning",
      "Deep Learning Basics",
    ],
    lastUpdated: "2024-01-20",
    language: "English",
    requirements: ["Basic programming knowledge helpful but not required"],
    whatYouWillLearn: [
      "Master Python programming",
      "Analyze data with Pandas",
      "Create visualizations",
      "Build ML models",
      "Understand algorithms",
      "Work on real projects",
    ],
  },
  {
    id: 4,
    title: "Full-Stack Web Development Bootcamp",
    description:
      "Become a full-stack developer. Learn frontend, backend, databases, and deployment.",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
    category: "Development",
    level: "Beginner to Advanced",
    price: 1209.99,
    discountPrice: 999.99,
    rating: 4.9,
    totalReviews: 4100,
    totalStudents: 18900,
    totalLessons: 20,
    totalDuration: "45h 20m",
    instructor: {
      id: "teacher_001",
      name: "John Smith",
      avatar: user_profile,
    },
    syllabus: [
      "HTML & CSS Mastery",
      "JavaScript ES6+",
      "React Frontend",
      "Node.js & Express",
      "MongoDB Database",
      "RESTful APIs",
      "Authentication",
      "Deployment & DevOps",
    ],
    lastUpdated: "2024-01-18",
    language: "English",
    requirements: ["Computer with internet connection", "Willingness to learn"],
    whatYouWillLearn: [
      "Build complete web applications",
      "Frontend with React",
      "Backend with Node.js",
      "Database design",
      "API development",
      "Deploy applications",
    ],
  },
];

// Videos data with placeholder URLs
export const videos = [
  {
    id: 1,
    title: "Introduction to React - Getting Started",
    description:
      "Learn the basics of React and set up your first project. We'll cover installation, create-react-app, and your first component.",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: "15:30",
    courseId: 1,
    lessonNumber: 1,
    category: "Development",
    instructor: "John Smith",
    views: 15420,
    uploadDate: "2024-01-15",
    tags: ["react", "javascript", "beginner"],
    completed: false,
    resources: [
      { name: "Slides.pdf", url: "#" },
      { name: "Code Files", url: "#" },
    ],
  },
  {
    id: 2,
    title: "React Components and Props",
    description:
      "Understanding components, props, and component composition. Learn how to build reusable UI elements.",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: "22:15",
    courseId: 1,
    lessonNumber: 2,
    category: "Development",
    instructor: "John Smith",
    views: 12340,
    uploadDate: "2024-01-16",
    tags: ["react", "components", "props"],
    completed: false,
    resources: [{ name: "Component Examples", url: "#" }],
  },
  {
    id: 3,
    title: "State Management with useState",
    description:
      "Learn how to manage component state using React hooks. Master the useState hook with practical examples.",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "18:45",
    courseId: 1,
    lessonNumber: 3,
    category: "Development",
    instructor: "John Smith",
    views: 10230,
    uploadDate: "2024-01-18",
    tags: ["react", "hooks", "state"],
    completed: false,
    resources: [],
  },
  {
    id: 4,
    title: "useEffect Hook Deep Dive",
    description:
      "Master the useEffect hook for side effects, API calls, and lifecycle management.",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    duration: "25:10",
    courseId: 1,
    lessonNumber: 4,
    category: "Development",
    instructor: "John Smith",
    views: 9800,
    uploadDate: "2024-01-19",
    tags: ["react", "hooks", "useEffect"],
    completed: false,
    resources: [],
  },
  {
    id: 5,
    title: "Figma Basics for UI Design",
    description:
      "Get started with Figma and learn essential design tools. Perfect for beginners.",
    thumbnail:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    duration: "25:00",
    courseId: 2,
    lessonNumber: 1,
    category: "Design",
    instructor: "Sarah Johnson",
    views: 8900,
    uploadDate: "2024-01-10",
    tags: ["figma", "ui-design", "design-tools"],
    completed: false,
    resources: [{ name: "Figma Template", url: "#" }],
  },
  {
    id: 6,
    title: "Design Systems and Components",
    description:
      "Creating reusable design systems in Figma. Learn component architecture.",
    thumbnail:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    duration: "30:20",
    courseId: 2,
    lessonNumber: 2,
    category: "Design",
    instructor: "Sarah Johnson",
    views: 7650,
    uploadDate: "2024-01-12",
    tags: ["design-systems", "figma", "components"],
    completed: false,
    resources: [],
  },
];

// User progress tracking
export const userProgress = [
  {
    userId: "user_001",
    courseId: 1,
    progress: 65,
    completedLessons: [1, 2, 3],
    totalTimeSpent: "8h 30m",
    lastAccessed: "2024-01-19",
    currentLesson: 4,
    quiz_scores: [95, 88, 92],
  },
  {
    userId: "user_001",
    courseId: 2,
    progress: 25,
    completedLessons: [1],
    totalTimeSpent: "2h 15m",
    lastAccessed: "2024-01-18",
    currentLesson: 2,
    quiz_scores: [90],
  },
];

// Purchase history
export const purchaseHistory = [
  {
    id: "order_001",
    userId: "user_001",
    courseId: 1,
    courseName: "Complete React Developer Course",
    purchaseDate: "2024-01-10",
    amount: 49.99,
    paymentMethod: "Credit Card",
    status: "completed",
  },
  {
    id: "order_002",
    userId: "user_001",
    courseId: 2,
    courseName: "UI/UX Design Masterclass with Figma",
    purchaseDate: "2024-01-15",
    amount: 39.99,
    paymentMethod: "PayPal",
    status: "completed",
  },
];

// Cart data (stored in localStorage in real app)
export let cart = [];

// Helper Functions
export const getVideoById = (videoId) => {
  return videos.find((video) => video.id === parseInt(videoId));
};

export const getCourseById = (courseId) => {
  return courses.find((course) => course.id === parseInt(courseId));
};

export const getVideosByCourse = (courseId) => {
  return videos.filter((video) => video.courseId === parseInt(courseId));
};

export const getUserProgress = (userId, courseId) => {
  return userProgress.find(
    (progress) =>
      progress.userId === userId && progress.courseId === parseInt(courseId),
  );
};

export const getUserCourses = (userId) => {
  const userProgressData = userProgress.filter(
    (progress) => progress.userId === userId,
  );
  return userProgressData.map((progress) => {
    const course = getCourseById(progress.courseId);
    return { ...course, progress: progress.progress };
  });
};

export const addToCart = (courseId) => {
  const course = getCourseById(courseId);
  if (course && !cart.find((item) => item.id === courseId)) {
    cart.push(course);
    return true;
  }
  return false;
};

export const removeFromCart = (courseId) => {
  cart = cart.filter((item) => item.id !== courseId);
};

export const getCartTotal = () => {
  return cart.reduce(
    (total, item) => total + (item.discountPrice || item.price),
    0,
  );
};

export const searchCourses = (query, category = null) => {
  let results = courses;

  if (category && category !== "all") {
    results = results.filter(
      (course) => course.category.toLowerCase() === category.toLowerCase(),
    );
  }

  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(
      (course) =>
        course.title.toLowerCase().includes(lowerQuery) ||
        course.description.toLowerCase().includes(lowerQuery) ||
        course.category.toLowerCase().includes(lowerQuery),
    );
  }

  return results;
};

export const categories = [
  "All",
  "Development",
  "Design",
  "Data Science",
  "Business",
  "Marketing",
];
