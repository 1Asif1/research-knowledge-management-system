import { Role } from './role.enum';

// Matches userservice.dto.UserRequest
export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

// Matches userservice.dto.UpdateUserRequest
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: Role;
}

// Matches userservice.dto.UserResponse
export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}
