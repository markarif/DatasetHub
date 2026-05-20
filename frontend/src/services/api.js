import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getDomains = () => api.get("/domains");

export const addDomain = (data) => api.post("/domains", data);

export const updateDomain = (id, data) => api.put(`/domains/${id}`, data);

export const deleteDomain = (id) => api.delete(`/domains/${id}`);

export const getDatasets = () => api.get("/datasets");

export const getDatasetById = (id, userId = null) =>
  api.get(`/datasets/${id}${userId ? `?user_id=${userId}` : ""}`);

export const addDataset = (data) => api.post("/datasets", data);

export const updateDataset = (id, data) => api.put(`/datasets/${id}`, data);

export const deleteDataset = (id) => api.delete(`/datasets/${id}`);

export const trackDownload = (id, userId = null) =>
  api.post(`/datasets/${id}/download`, { user_id: userId });

export const submitFeedback = (data) => api.post("/feedback", data);

export const getAnalytics = () => api.get("/admin/analytics");

export const generateAiGapReport = () => api.post("/ai-gap-report/generate");

export const getAiGapReports = () => api.get("/ai-gap-reports");

export const runN8nAiGapAnalysis = () => api.post("/ai-gap-report/n8n");

export const getFeedbackReports = () => api.get("/admin/feedback-reports");

export const getUserProfile = (id) => api.get(`/users/${id}/profile`);

export const submitAccessRequest = (data) => api.post("/access-requests", data);

export const getAccessRequests = () => api.get("/admin/access-requests");

export const updateAccessRequestStatus = (id, status) =>
  api.put(`/admin/access-requests/${id}`, { status });

export const checkDatasetAccess = (userId, datasetId) =>
  api.get(`/access-requests/check?user_id=${userId}&dataset_id=${datasetId}`);
  export const getUsers = () => api.get("/admin/users");

export const updateUserRole = (id, role) =>
  api.put(`/admin/users/${id}/role`, { role });

export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const addUser = (data) => api.post("/admin/users", data);
export const getActivityFeed = () =>
  api.get("/admin/activity-feed");
export const getUserAnalytics = () =>
  api.get("/admin/user-analytics");