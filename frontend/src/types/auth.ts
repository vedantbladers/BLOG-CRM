export interface RegisterInitiateRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  bio?: string;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  role: string;
  status: string;
}

/** Shape of error bodies from GlobalExceptionHandler. */
export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  errors?: Record<string, string>;
}
