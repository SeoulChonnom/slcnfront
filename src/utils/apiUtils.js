import axios from 'axios';
import { useUserStore } from '@/store/useUserStore';
import { showErrorAlert } from '@/utils/alertUtils';

class ApiUtils {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.VUE_APP_API_URL,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const userStore = useUserStore();
        if (userStore.token) {
          config.headers['X-AUTH-TOKEN'] = userStore.token;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for centralized error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const silent = error.config?.silent === true;
        this.handleError(error, silent);
        return Promise.reject(error);
      }
    );
  }

  handleError(error, silent = false) {
    if (silent) {
      throw error;
    }
    
    if (error.response?.status === 400) {
      const message = error.response.data?.message || '요청이 잘못되었습니다.';
      showErrorAlert(message);
      throw new Error(message);
    } else if (error.response?.status === 401) {
      showErrorAlert('인증이 필요합니다.');
      // Redirect to login or refresh token
      throw new Error('인증이 필요합니다.');
    } else if (error.response?.status >= 500) {
      showErrorAlert('서버 오류가 발생했습니다.');
      throw new Error('서버 오류가 발생했습니다.');
    } else {
      showErrorAlert('알 수 없는 오류입니다.');
      throw new Error('알 수 없는 오류입니다.');
    }
  }

  async get(url, config = {}) {
    const response = await this.client.get(url, config);
    return response.data.data;
  }

  async getSilent(url, config = {}) {
    const response = await this.client.get(url, { ...config, silent: true });
    return response.data.data;
  }

  async post(url, data = {}, config = {}) {
    const response = await this.client.post(url, data, config);
    return response.data.data;
  }

  async put(url, data = {}, config = {}) {
    const response = await this.client.put(url, data, config);
    return response.data.data;
  }

  async delete(url, config = {}) {
    const response = await this.client.delete(url, config);
    return response.data.data;
  }

  // File download with blob response
  async downloadFile(url, config = {}) {
    const response = await this.client.get(url, {
      ...config,
      responseType: 'blob',
      silent: true, // Prevent error notifications for file downloads
    });
    return URL.createObjectURL(response.data);
  }

  // File upload with multipart/form-data
  async uploadFile(url, formData, config = {}) {
    const response = await this.client.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
    });
    return response.data;
  }
}

export const apiUtils = new ApiUtils();
export default apiUtils;
