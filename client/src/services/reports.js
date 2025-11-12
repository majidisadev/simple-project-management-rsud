import api from './auth';

export const getReports = () => {
  return api.get('/reports');
};

export const getReportsByDateRange = (startDate, endDate) => {
  return api.get('/reports/calendar', {
    params: { startDate, endDate },
  });
};

export const searchReports = (keyword) => {
  return api.get('/reports/search', {
    params: { keyword },
  });
};

export const getReport = (id) => {
  return api.get(`/reports/${id}`);
};

export const createReport = (reportData) => {
  return api.post('/reports', reportData);
};

export const updateReport = (id, reportData) => {
  return api.put(`/reports/${id}`, reportData);
};

export const deleteReport = (id) => {
  return api.delete(`/reports/${id}`);
};

