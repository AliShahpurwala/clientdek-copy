import axios from 'axios';

const apiHandler = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  withCredentials: true
});

apiHandler.interceptors.request.use(
  config => {
    // You can modify the request config here if necessary
    return config;
  },
  error => {
    // Handle request errors
    console.log("Request error:", error);

    return Promise.reject(error);
  }
);

apiHandler.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (!error.response) {
      window.location = '/bad-gateway';
    } else if (error.response.status === 401) {
      window.location = '/';
    } else if (error.response.status === 502) {
      window.location = '/bad-gateway';
    } else if (error.response.status === 500) {
      window.location = '/server-error';
    } else {
      throw error;
    }
    return Promise.reject(error);
  }
);

export default apiHandler;
