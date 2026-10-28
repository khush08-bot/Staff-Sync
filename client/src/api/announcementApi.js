import axiosClient from './axiosClient';

export const announcementApi = {
  getAll: () => axiosClient.get('/announcements'),
  create: (data) => axiosClient.post('/announcements', data),
  delete: (id) => axiosClient.delete(`/announcements/${id}`),
};
