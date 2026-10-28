import axiosClient from './axiosClient';

export const trainingApi = {
  getAll: () => axiosClient.get('/training'),
  getById: (id) => axiosClient.get(`/training/${id}`),
  create: (data) => axiosClient.post('/training', data),
  update: (id, data) => axiosClient.put(`/training/${id}`, data),
  delete: (id) => axiosClient.delete(`/training/${id}`),
};
