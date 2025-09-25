import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL || 'https://linksenseai-app.onrender.com'
    : 'http://localhost:3001'
});

export default api;
