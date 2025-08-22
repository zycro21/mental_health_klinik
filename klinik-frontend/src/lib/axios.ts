// src/lib/axios.ts
import axios from 'axios'
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Tambah interceptor biar otomatis ambil token dari cookies
api.interceptors.request.use((config) => {
  const token = Cookies.get("token"); // nama cookie sesuai pas kamu set waktu login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api