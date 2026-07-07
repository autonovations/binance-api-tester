import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { BinanceApiError } from '../types/binance';

const BASE_URL = 'https://api.binance.com';

const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Tag each request with a start timestamp for latency calculation
    (config as InternalAxiosRequestConfig & { metadata?: { startTime: number } }).metadata = {
      startTime: Date.now(),
    };
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as InternalAxiosRequestConfig & {
      metadata?: { startTime: number };
    };
    if (config.metadata?.startTime) {
      (response as AxiosResponse & { latencyMs?: number }).latencyMs =
        Date.now() - config.metadata.startTime;
    }
    return response;
  },
  (error: AxiosError<BinanceApiError>) => {
    if (error.response) {
      const binanceErr = error.response.data;
      const message =
        binanceErr?.msg ??
        `HTTP ${error.response.status}: ${error.response.statusText}`;
      return Promise.reject(new Error(message));
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    return Promise.reject(new Error(error.message ?? 'Network error'));
  }
);

export default axiosClient;
