export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
  expiresAt: string;
}

export interface AdminUser {
  email: string;
  fullName: string;
  role: string;
}

export interface AdminProfileResponse {
  adminName: string;
  fullName: string;
  email: string;
  role: string;
  updatedAt: string;
  token?: string;
}

export interface UpdateAdminProfileRequest {
  adminName: string;
  email: string;
}

export interface ChangeAdminPasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  token?: string;
}
