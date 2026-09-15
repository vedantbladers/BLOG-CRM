import axios, { AxiosError } from "axios";
import type { ApiErrorBody } from "../types/auth";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("blogsphere_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * GlobalExceptionHandler returns either { message } or, for validation
 * failures, { errors: { field: message } }. This pulls out something
 * displayable regardless of which shape came back.
 */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ApiErrorBody>;
    const body = axiosErr.response?.data;

    if (body?.errors) {
      const firstField = Object.keys(body.errors)[0];
      return body.errors[firstField];
    }
    if (body?.message) {
      return body.message;
    }
    if (axiosErr.response?.status === 403) {
      return "You don't have permission to do that. Try signing in again.";
    }
    if (!axiosErr.response) {
      return "Can't reach the server. Check your connection and try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
