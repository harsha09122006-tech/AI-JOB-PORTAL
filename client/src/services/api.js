import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Catch 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If expired session on protected routes, can clear storage
      const currentPath = window.location.pathname;
      if (
        currentPath.startsWith('/candidate') ||
        currentPath.startsWith('/recruiter') ||
        currentPath.startsWith('/admin')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// 1. Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

// 2. Jobs API
export const jobAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getFeaturedJobs: () => api.get('/jobs/featured'),
  getCategories: () => api.get('/jobs/categories'),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  toggleJobStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }),
};

// 3. Applications API
export const applicationAPI = {
  apply: (data) => api.post('/applications', data),
  getMyApplications: () => api.get('/applications/my'),
  getRecruiterApplications: (params) => api.get('/applications/recruiter', { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  withdraw: (id) => api.delete(`/applications/${id}`),
};

// 4. Candidates API
export const candidateAPI = {
  getProfile: () => api.get('/candidates/profile'),
  updateProfile: (data) => api.put('/candidates/profile', data),
  uploadResume: (formData) =>
    api.post('/candidates/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getCandidates: (params) => api.get('/candidates', { params }),
  getCandidateById: (id) => api.get(`/candidates/${id}`),
};

// 5. Recruiters API
export const recruiterAPI = {
  getProfile: () => api.get('/recruiters/profile'),
  updateProfile: (data) => api.put('/recruiters/profile', data),
  getDashboard: () => api.get('/recruiters/dashboard'),
  getAnalytics: () => api.get('/recruiters/analytics'),
};

// 6. Companies API
export const companyAPI = {
  getCompanies: (params) => api.get('/companies', { params }),
  getCompanyById: (id) => api.get(`/companies/${id}`),
  createCompany: (data) => api.post('/companies', data),
  updateCompany: (id, data) => api.put(`/companies/${id}`, data),
  uploadLogo: (id, formData) =>
    api.post(`/companies/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// 7. Saved Jobs API
export const savedJobAPI = {
  saveJob: (jobId) => api.post('/saved-jobs', { jobId }),
  getSavedJobs: () => api.get('/saved-jobs'),
  removeSavedJob: (id) => api.delete(`/saved-jobs/${id}`),
};

// 8. AI API
export const aiAPI = {
  analyzeResume: (formDataOrData) => {
    const isFormData = formDataOrData instanceof FormData;
    return api.post('/ai/resume-analysis', formDataOrData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },
  matchJob: (data) => api.post('/ai/job-match', data),
  getRecommendations: (params) => api.get('/ai/recommendations', { params }),
  careerAssistant: (data) => api.post('/ai/career-assistant', data),
};

// 9. Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id, isBlocked) => api.patch(`/admin/users/${id}/status`, { isBlocked }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  updateJobApproval: (id, approvalStatus) => api.patch(`/admin/jobs/${id}/approval`, { approvalStatus }),
  getApplications: (params) => api.get('/admin/applications', { params }),
  getReports: () => api.get('/admin/reports'),
  updateReport: (id, data) => api.patch(`/admin/reports/${id}`, data),
};

// 10. Notifications API
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export default api;

