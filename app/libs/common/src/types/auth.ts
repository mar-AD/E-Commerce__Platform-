// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.0.3
//   protoc               v5.27.3
// source: proto/auth.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { Timestamp } from "google/protobuf/timestamp";

export const protobufPackage = "auth";

export enum Permissions {
  PERMISSION_UNSPECIFIED = 0,
  VIEW_DASHBOARD = 1,
  MANAGE_USERS = 2,
  MANAGE_ORDERS = 3,
  MANAGE_PRODUCTS = 4,
  MANAGE_ROLES = 5,
  MANAGE_ADMINS = 6,
  UNRECOGNIZED = -1,
}

export interface Permission {
  permissions: Permissions[];
}

export interface BaseResponse {
  status: number;
  message: string;
}

export interface None {
}

export interface Empty {
  result: BaseResponse | undefined;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  result: BaseResponse | undefined;
}

export interface FindOneDto {
  id: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  newPassword: string;
  confirmPassword: string;
}

export interface RequestEmailUpdateDto {
  email: string;
}

export interface VerifyEmailCodeDto {
  verificationCode: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface UpdateEmailDto {
  email: string;
}

export interface UpdatePasswordDto {
  password: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TokenDto {
  token: string;
}

export interface VerifyEmailCodeRequest {
  verifyEmailCodeDto: VerifyEmailCodeDto | undefined;
  findOneDto: FindOneDto | undefined;
}

export interface ResetPasswordRequest {
  resetPasswordDto: ResetPasswordDto | undefined;
  tokenDto: TokenDto | undefined;
}

export interface UpdatePasswordRequest {
  updatePasswordDto: UpdatePasswordDto | undefined;
  findOneDto: FindOneDto | undefined;
}

export interface RequestUpdateEmailRequest {
  requestEmailUpdateDto: RequestEmailUpdateDto | undefined;
  findOneDto: FindOneDto | undefined;
}

export interface UpdateEmailRequest {
  updateEmailDto: UpdateEmailDto | undefined;
  findOneDto: FindOneDto | undefined;
}

/** user DTOs */
export interface CreateUserDto {
  email: string;
  password: string;
}

/** admin DTOs */
export interface CreateAdminDto {
  email: string;
  password: string;
  role: string;
}

export interface UpdateAdminRoleDto {
  role: string;
}

export interface UpdateAdminRoleRequest {
  updateAdminRoleDto: UpdateAdminRoleDto | undefined;
  findOneDto: FindOneDto | undefined;
}

/** role Dto */
export interface RolesResponse {
  roles: Role[];
  result: BaseResponse | undefined;
}

export interface CreateRoleDto {
  name: string;
  permissions: Permissions[];
}

export interface UpdateRoleDto {
  name?: string | undefined;
  permissions?: Permissions[];
}

export interface UpdateRoleRequest {
  updateRoleDto: UpdateRoleDto | undefined;
  findOneDto: FindOneDto | undefined;
}

/** user response */
export interface User {
  id: string;
  email: string;
  isActive: boolean;
  isDeleted: boolean;
  isEmailVerified: boolean;
  createdAt: Timestamp | undefined;
  updatedAt: Timestamp | undefined;
  deletedAt: Timestamp | undefined;
}

/** admin response */
export interface Admin {
  id: string;
  roleId: string;
  email: string;
  isActive: boolean;
  isDeleted: boolean;
  isEmailVerified: boolean;
  createdAt: Timestamp | undefined;
  updatedAt: Timestamp | undefined;
  deletedAt: Timestamp | undefined;
}

/** role response */
export interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: Timestamp | undefined;
  updatedAt: Timestamp | undefined;
}

/** refreshToken response */
export interface RefreshToken {
  id: string;
  userId: string;
  adminId: string;
  token: string;
  revoked: boolean;
  expiresAt: Timestamp | undefined;
  createdAt: Timestamp | undefined;
}

/** EmailVerificationCode response */
export interface EmailVerificationCode {
  id: string;
  adminId: string;
  userId: string;
  code: string;
  expiresAt: Timestamp | undefined;
  createdAt: Timestamp | undefined;
}

export const AUTH_PACKAGE_NAME = "auth";

/** users */

export interface UserServiceClient {
  createUser(request: CreateUserDto): Observable<User>;

  userLogin(request: LoginDto): Observable<AuthResponse>;

  updateUserPassword(request: UpdatePasswordRequest): Observable<User>;

  requestUpdateUserEmail(request: RequestUpdateEmailRequest): Observable<Empty>;

  verifyEmailCode(request: VerifyEmailCodeRequest): Observable<Empty>;

  updateUserEmail(request: UpdateEmailRequest): Observable<User>;

  logoutUser(request: RefreshTokenDto): Observable<Empty>;

  userRefreshToken(request: RefreshTokenDto): Observable<AuthResponse>;

  userForgotPassword(request: ForgotPasswordDto): Observable<Empty>;

  userResetPassword(request: ResetPasswordRequest): Observable<Empty>;

  removeUser(request: FindOneDto): Observable<Empty>;

  findUser(request: FindOneDto): Observable<User>;
}

/** users */

export interface UserServiceController {
  createUser(request: CreateUserDto): Promise<User> | Observable<User> | User;

  userLogin(request: LoginDto): Promise<AuthResponse> | Observable<AuthResponse> | AuthResponse;

  updateUserPassword(request: UpdatePasswordRequest): Promise<User> | Observable<User> | User;

  requestUpdateUserEmail(request: RequestUpdateEmailRequest): Promise<Empty> | Observable<Empty> | Empty;

  verifyEmailCode(request: VerifyEmailCodeRequest): Promise<Empty> | Observable<Empty> | Empty;

  updateUserEmail(request: UpdateEmailRequest): Promise<User> | Observable<User> | User;

  logoutUser(request: RefreshTokenDto): Promise<Empty> | Observable<Empty> | Empty;

  userRefreshToken(request: RefreshTokenDto): Promise<AuthResponse> | Observable<AuthResponse> | AuthResponse;

  userForgotPassword(request: ForgotPasswordDto): Promise<Empty> | Observable<Empty> | Empty;

  userResetPassword(request: ResetPasswordRequest): Promise<Empty> | Observable<Empty> | Empty;

  removeUser(request: FindOneDto): Promise<Empty> | Observable<Empty> | Empty;

  findUser(request: FindOneDto): Promise<User> | Observable<User> | User;
}

export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "createUser",
      "userLogin",
      "updateUserPassword",
      "requestUpdateUserEmail",
      "verifyEmailCode",
      "updateUserEmail",
      "logoutUser",
      "userRefreshToken",
      "userForgotPassword",
      "userResetPassword",
      "removeUser",
      "findUser",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("UserService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("UserService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const USER_SERVICE_NAME = "UserService";

/** Admins */

export interface AdminServiceClient {
  createAdmin(request: CreateAdminDto): Observable<Admin>;

  adminLogin(request: LoginDto): Observable<AuthResponse>;

  updateAdminRole(request: UpdateAdminRoleRequest): Observable<Admin>;

  updateAdminPassword(request: UpdatePasswordRequest): Observable<Admin>;

  requestUpdateAdminEmail(request: RequestUpdateEmailRequest): Observable<Empty>;

  verifyEmailCode(request: VerifyEmailCodeRequest): Observable<Empty>;

  updateAdminEmail(request: UpdateEmailRequest): Observable<Admin>;

  logoutAdmin(request: RefreshTokenDto): Observable<Empty>;

  adminRefreshToken(request: RefreshTokenDto): Observable<AuthResponse>;

  adminForgotPassword(request: ForgotPasswordDto): Observable<Empty>;

  adminResetPassword(request: ResetPasswordRequest): Observable<Empty>;

  removeAdmin(request: FindOneDto): Observable<Empty>;

  findOneAdmin(request: FindOneDto): Observable<Admin>;

  permissionsByRole(request: FindOneDto): Observable<Permission>;
}

/** Admins */

export interface AdminServiceController {
  createAdmin(request: CreateAdminDto): Promise<Admin> | Observable<Admin> | Admin;

  adminLogin(request: LoginDto): Promise<AuthResponse> | Observable<AuthResponse> | AuthResponse;

  updateAdminRole(request: UpdateAdminRoleRequest): Promise<Admin> | Observable<Admin> | Admin;

  updateAdminPassword(request: UpdatePasswordRequest): Promise<Admin> | Observable<Admin> | Admin;

  requestUpdateAdminEmail(request: RequestUpdateEmailRequest): Promise<Empty> | Observable<Empty> | Empty;

  verifyEmailCode(request: VerifyEmailCodeRequest): Promise<Empty> | Observable<Empty> | Empty;

  updateAdminEmail(request: UpdateEmailRequest): Promise<Admin> | Observable<Admin> | Admin;

  logoutAdmin(request: RefreshTokenDto): Promise<Empty> | Observable<Empty> | Empty;

  adminRefreshToken(request: RefreshTokenDto): Promise<AuthResponse> | Observable<AuthResponse> | AuthResponse;

  adminForgotPassword(request: ForgotPasswordDto): Promise<Empty> | Observable<Empty> | Empty;

  adminResetPassword(request: ResetPasswordRequest): Promise<Empty> | Observable<Empty> | Empty;

  removeAdmin(request: FindOneDto): Promise<Empty> | Observable<Empty> | Empty;

  findOneAdmin(request: FindOneDto): Promise<Admin> | Observable<Admin> | Admin;

  permissionsByRole(request: FindOneDto): Promise<Permission> | Observable<Permission> | Permission;
}

export function AdminServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "createAdmin",
      "adminLogin",
      "updateAdminRole",
      "updateAdminPassword",
      "requestUpdateAdminEmail",
      "verifyEmailCode",
      "updateAdminEmail",
      "logoutAdmin",
      "adminRefreshToken",
      "adminForgotPassword",
      "adminResetPassword",
      "removeAdmin",
      "findOneAdmin",
      "permissionsByRole",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("AdminService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("AdminService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const ADMIN_SERVICE_NAME = "AdminService";

/** Roles */

export interface RoleServiceClient {
  createRole(request: CreateRoleDto): Observable<Role>;

  getAllRoles(request: None): Observable<RolesResponse>;

  getRoleById(request: FindOneDto): Observable<Role>;

  updateRole(request: UpdateRoleRequest): Observable<Role>;

  deleteRole(request: FindOneDto): Observable<Empty>;
}

/** Roles */

export interface RoleServiceController {
  createRole(request: CreateRoleDto): Promise<Role> | Observable<Role> | Role;

  getAllRoles(request: None): Promise<RolesResponse> | Observable<RolesResponse> | RolesResponse;

  getRoleById(request: FindOneDto): Promise<Role> | Observable<Role> | Role;

  updateRole(request: UpdateRoleRequest): Promise<Role> | Observable<Role> | Role;

  deleteRole(request: FindOneDto): Promise<Empty> | Observable<Empty> | Empty;
}

export function RoleServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["createRole", "getAllRoles", "getRoleById", "updateRole", "deleteRole"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("RoleService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("RoleService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const ROLE_SERVICE_NAME = "RoleService";
