import axiosClient from './axiosClient';

export const employeeApi = {
  getAll: (params) => axiosClient.get('/employees', { params }),
  getById: (id) => axiosClient.get(`/employees/${id}`),
  create: (data) => axiosClient.post('/employees', data),
  update: (id, data) => axiosClient.put(`/employees/${id}`, data),
  delete: (id) => axiosClient.delete(`/employees/${id}`),
  getManagersList: () => axiosClient.get('/employees/meta/managers'),
  getMyTeam: () => axiosClient.get('/employees/team/me'),
};
