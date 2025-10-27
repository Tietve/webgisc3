import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/token/', { email, password }),
  register: (email, password, password_confirm, role) =>
    api.post('/auth/register/', { email, password, password_confirm, role }),
  getProfile: () => api.get('/auth/profile/'),
};

// Classroom APIs
export const classroomAPI = {
  list: () => api.get('/classrooms/'),
  create: (name) => api.post('/classrooms/', { name }),
  get: (id) => api.get(`/classrooms/${id}/`),
  getStudents: (id) => api.get(`/classrooms/${id}/students/`),
  join: (enrollment_code) => api.post('/classrooms/enrollments/join/', { enrollment_code }),
};

// Lesson APIs
export const lessonAPI = {
  list: () => api.get('/lessons/'),
  get: (id) => api.get(`/lessons/${id}/`),
};

// Quiz APIs
export const quizAPI = {
  list: () => api.get('/quizzes/'),
  get: (id) => api.get(`/quizzes/${id}/`),
  getSession: (classId, quizId) => api.get(`/classrooms/${classId}/quiz_session/${quizId}/`),
  submit: (quizId, answers) => api.post('/quizzes/quiz_submissions/', { quiz_id: quizId, answers }),
};

// GIS APIs
export const gisAPI = {
  listLayers: () => api.get('/layers/'),
  getFeatures: (layerId, bbox) => {
    const params = bbox ? { bbox: bbox.join(',') } : {};
    return api.get(`/layers/${layerId}/features/`, { params });
  },
};

// Tools APIs
export const toolsAPI = {
  executeBuffer: (inputGeoJSON, distance, units = 'meters') =>
    api.post('/tools/buffer/execute/', {
      input_geojson: inputGeoJSON,
      parameters: { distance, units },
    }),
  executeIntersect: (inputGeoJSON, overlayGeoJSON) =>
    api.post('/tools/intersect/execute/', {
      input_geojson: inputGeoJSON,
      parameters: { overlay_geojson: overlayGeoJSON },
    }),
};

export default api;
