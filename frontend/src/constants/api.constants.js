// API Configuration
// In production, use relative path so it works on any domain
// In development, use localhost:8080
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? '/api/v1' : 'http://localhost:8080/api/v1')

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/token/',
    REGISTER: '/auth/register/',
    REFRESH: '/auth/token/refresh/',
    PROFILE: '/auth/profile/',
  },

  // Classrooms
  CLASSROOMS: {
    LIST: '/classrooms/',
    CREATE: '/classrooms/',
    DETAIL: (id) => `/classrooms/${id}/`,
    STUDENTS: (id) => `/classrooms/${id}/students/`,
    ENROLL: '/classrooms/enrollments/join/',
  },

  // Lessons
  LESSONS: {
    LIST: '/lessons/',
    DETAIL: (id) => `/lessons/${id}/`,
  },

  // Quizzes
  QUIZZES: {
    LIST: '/quizzes/',
    DETAIL: (id) => `/quizzes/${id}/`,
    SESSION: (classId, quizId) => `/classrooms/${classId}/quiz_session/${quizId}/`,
    SUBMIT: '/quizzes/quiz_submissions/',
    DEADLINES: '/quizzes/deadlines/',
  },

  // Assignments
  ASSIGNMENTS: {
    LIST: (classroomId) => `/classrooms/${classroomId}/assignments/`,
    CREATE: (classroomId) => `/classrooms/${classroomId}/assignments/`,
    DETAIL: (classroomId, id) => `/classrooms/${classroomId}/assignments/${id}/`,
    SUBMISSIONS: (classroomId, assignmentId) => `/classrooms/${classroomId}/assignments/${assignmentId}/submissions/`,
    SUBMISSION_STATUS: (classroomId, assignmentId) => `/classrooms/${classroomId}/assignments/${assignmentId}/submission_status/`,
  },

  // Submissions
  SUBMISSIONS: {
    CREATE: (classroomId, assignmentId) => `/classrooms/${classroomId}/assignments/${assignmentId}/submissions/submit/`,
    DETAIL: (id) => `/submissions/${id}/`,
    GRADE: (id) => `/submissions/${id}/grade/`,
    MY_SUBMISSIONS: (classroomId) => `/classrooms/${classroomId}/my-submissions/`,
  },

  // Deadlines (aggregated assignments + quizzes)
  DEADLINES: {
    LIST: '/quizzes/deadlines/',
  },

  // GIS
  GIS: {
    LAYERS: '/layers/',
    LAYER_DETAIL: (id) => `/layers/${id}/`,
    FEATURES: (id) => `/layers/${id}/features/`,
  },

  // Tools
  TOOLS: {
    EXECUTE: (toolName) => `/tools/${toolName}/execute/`,
  },
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
}
