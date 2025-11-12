// Application Routes
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',

  // Protected routes
  DASHBOARD: '/dashboard',
  CLASSROOMS: '/classrooms',
  MAP: '/map',
  TOOLS: '/tools',
  LESSON: '/lessons/:id',
  QUIZ: '/quiz/:id',

  // Root
  ROOT: '/',
}

// Helper function to generate dynamic routes
export const getRoute = {
  lesson: (id) => `/lessons/${id}`,
  quiz: (id) => `/quiz/${id}`,
}
