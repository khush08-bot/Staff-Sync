import axiosClient from './axiosClient';

export const attendanceApi = {
  checkIn: (data) => axiosClient.post('/attendance/check-in', data || {}),
  checkOut: (data) => axiosClient.post('/attendance/check-out', data || {}),
  getToday: () => axiosClient.get('/attendance/today'),
  getMyHistory: () => axiosClient.get('/attendance/my-history'),
  getAll: (params) => axiosClient.get('/attendance', { params }),
};
