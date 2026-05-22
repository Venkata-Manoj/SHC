import axios from 'axios';

const api = axios.create({
  baseURL: __DEV__ ? 'http://10.0.2.2:5000/api' : 'https://api.simatshackathon.com/api',
  timeout: 10000,
});

export default api;
