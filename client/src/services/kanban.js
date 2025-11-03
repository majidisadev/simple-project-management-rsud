import api from './auth';

export const getTasks = () => {
  return api.get('/kanban');
};

export const getTask = (id) => {
  return api.get(`/kanban/${id}`);
};

export const createTask = (taskData) => {
  return api.post('/kanban', taskData);
};

export const updateTask = (id, taskData) => {
  return api.put(`/kanban/${id}`, taskData);
};

export const deleteTask = (id) => {
  return api.delete(`/kanban/${id}`);
};

