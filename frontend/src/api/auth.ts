import { apiClient } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  MessageResponse,
  OtpVerifyRequest,
  RegisterInitiateRequest,
  ResendOtpRequest,
  User,
} from "../types/auth";

export async function registerInitiate(
  payload: RegisterInitiateRequest
): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>(
    "/auth/register/initiate",
    payload
  );
  return data;
}

export async function registerVerify(
  payload: OtpVerifyRequest
): Promise<User> {
  const { data } = await apiClient.post<User>("/auth/register/verify", payload);
  return data;
}

export async function registerResendOtp(
  payload: ResendOtpRequest
): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>(
    "/auth/register/resend-otp",
    payload
  );
  return data;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
}
