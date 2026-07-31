import { Role } from './role.enum';

// Matches AuthServiceD.Dto.Request.LoginRequest
export interface LoginRequest {
  email: string;
  password: string;
}

// Matches AuthServiceD.Dto.Response.LoginResponse
export interface LoginResponse {
  token: string;
  uuid: number;
  firstname: string;
  lastname: string;
  email: string;
  role: Role;
  message: string;
}

// Matches AuthServiceD.Dto.Response.ValidateTokenResponse
export interface ValidateTokenResponse {
  valid: boolean;
  email: string | null;
  firstname: string;
  lastname: string;
  role: Role;
}

// Frontend-only shape persisted to storage after login, derived from LoginResponse.
export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}
