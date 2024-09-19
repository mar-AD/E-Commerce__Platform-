"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_SERVICE_NAME = exports.ADMIN_SERVICE_NAME = exports.USER_SERVICE_NAME = exports.AUTH_PACKAGE_NAME = exports.Permissions = exports.protobufPackage = void 0;
exports.UserServiceControllerMethods = UserServiceControllerMethods;
exports.AdminServiceControllerMethods = AdminServiceControllerMethods;
exports.RoleServiceControllerMethods = RoleServiceControllerMethods;
const microservices_1 = require("@nestjs/microservices");
exports.protobufPackage = "auth";
var Permissions;
(function (Permissions) {
    Permissions[Permissions["PERMISSION_UNSPECIFIED"] = 0] = "PERMISSION_UNSPECIFIED";
    Permissions[Permissions["VIEW_DASHBOARD"] = 1] = "VIEW_DASHBOARD";
    Permissions[Permissions["MANAGE_USERS"] = 2] = "MANAGE_USERS";
    Permissions[Permissions["MANAGE_ORDERS"] = 3] = "MANAGE_ORDERS";
    Permissions[Permissions["MANAGE_PRODUCTS"] = 4] = "MANAGE_PRODUCTS";
    Permissions[Permissions["MANAGE_ROLES"] = 5] = "MANAGE_ROLES";
    Permissions[Permissions["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(Permissions || (exports.Permissions = Permissions = {}));
exports.AUTH_PACKAGE_NAME = "auth";
function UserServiceControllerMethods() {
    return function (constructor) {
        const grpcMethods = [
            "createUser",
            "userLogin",
            "updateUserPassword",
            "updateUserEmail",
            "logoutUser",
            "userRefreshToken",
            "userForgotPassword",
            "userResetPassword",
            "removeUser",
        ];
        for (const method of grpcMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcMethod)("UserService", method)(constructor.prototype[method], method, descriptor);
        }
        const grpcStreamMethods = [];
        for (const method of grpcStreamMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcStreamMethod)("UserService", method)(constructor.prototype[method], method, descriptor);
        }
    };
}
exports.USER_SERVICE_NAME = "UserService";
function AdminServiceControllerMethods() {
    return function (constructor) {
        const grpcMethods = [
            "createAdmin",
            "adminLogin",
            "updateAdminEmail",
            "updateAdminPassword",
            "logoutAdmin",
            "adminRefreshToken",
            "adminForgotPassword",
            "adminResetPassword",
            "removeAdmin",
        ];
        for (const method of grpcMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcMethod)("AdminService", method)(constructor.prototype[method], method, descriptor);
        }
        const grpcStreamMethods = [];
        for (const method of grpcStreamMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcStreamMethod)("AdminService", method)(constructor.prototype[method], method, descriptor);
        }
    };
}
exports.ADMIN_SERVICE_NAME = "AdminService";
function RoleServiceControllerMethods() {
    return function (constructor) {
        const grpcMethods = ["createRole", "getAllRoles", "getRoleById", "updateRole", "deleteRole"];
        for (const method of grpcMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcMethod)("RoleService", method)(constructor.prototype[method], method, descriptor);
        }
        const grpcStreamMethods = [];
        for (const method of grpcStreamMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcStreamMethod)("RoleService", method)(constructor.prototype[method], method, descriptor);
        }
    };
}
exports.ROLE_SERVICE_NAME = "RoleService";
//# sourceMappingURL=auth.js.map