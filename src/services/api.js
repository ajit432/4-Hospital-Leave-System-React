import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('📤 Request Data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Log response details
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('📥 Response Data:', response.data);
    
    return response;
  },
  (error) => {
    // Log error details
    console.error('❌ API Error:', error.response?.status, error.response?.data?.message || error.message);
    
    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Doctor API calls
export const doctorAPI = {
  getDashboard: () => api.get('/doctor/dashboard'),
  updateProfile: (profileData) => api.put('/doctor/profile', profileData),
  changePassword: (passwordData) => api.put('/doctor/change-password', passwordData),
  uploadProfilePicture: (formData) => 
    api.post('/doctor/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  removeProfilePicture: () => api.delete('/doctor/remove-profile-picture'),
  getAllDoctors: () => api.get('/doctor/all'),
};

// Leave API calls
export const leaveAPI = {
  getCategories: () => api.get('/leave/categories'),
  applyLeave: (leaveData) => api.post('/leave/apply', leaveData),
  getMyLeaves: (params) => api.get('/leave/my-leaves', { params }),
  getLeaveBalance: () => api.get('/leave/balance'),
  getAllLeaves: (params) => api.get('/leave/all', { params }),
  reviewLeave: (id, reviewData) => api.put(`/leave/${id}/review`, reviewData),
  // Admin specific endpoints
  getAllDoctors: () => api.get('/leave/doctors'),
  getDoctorLeaveBalance: (doctorId, params) => api.get(`/leave/doctors/${doctorId}/balance`, { 
    params: { 
      ...params, 
      _t: Date.now() // Cache busting parameter 
    } 
  }),
  setDoctorLeaveAllocation: (doctorId, allocationData) => api.put(`/leave/doctors/${doctorId}/allocation`, allocationData),
  getLeaveSummary: (params) => api.get('/leave/summary', { params }),
  // Leave category management (admin only)
  createLeaveCategory: (categoryData) => api.post('/leave/categories', categoryData),
  updateLeaveCategory: (id, categoryData) => api.put(`/leave/categories/${id}`, categoryData),
  deleteLeaveCategory: (id) => api.delete(`/leave/categories/${id}`),
};

export default api;
