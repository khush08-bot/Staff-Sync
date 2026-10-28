import axiosClient from './axiosClient';

export const leaveApi = {
  apply: (data) => axiosClient.post('/leaves', data),
  getMyLeaves: () => axiosClient.get('/leaves/my-leaves'),
  getForReview: (params) => axiosClient.get('/leaves', { params }),
  updateStatus: (id, data) => axiosClient.put(`/leaves/${id}/status`, data),
};
