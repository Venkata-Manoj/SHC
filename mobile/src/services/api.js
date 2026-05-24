import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'shc-auth-token';

const api = axios.create({
  baseURL: __DEV__ ? 'http://10.0.2.2:5000/api' : 'https://api.simatshackathon.com/api',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore storage errors
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
    return Promise.reject(err);
  }
);

export { AUTH_TOKEN_KEY };
export default api;
