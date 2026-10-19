import axios from 'axios';

// Base URL for the backend API. You can set it in a .env file as NEXT_PUBLIC_API_URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HttpOnly cookies with each request
});

// Optional: interceptors for handling auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // You could add logic here to handle 401/403 globally
    return Promise.reject(error);
  }
);

export default apiClient;
