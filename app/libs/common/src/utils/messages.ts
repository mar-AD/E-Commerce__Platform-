export const messages = {
  USER: {
    FETCH_ALL: "All users fetched successfully",
    FETCH_USER_BY_NAME: "Fetch user by userName ",
    FETCH_USER_BY_EMAIL: "Fetch user by email ",
    LOGIN_SUCCESSFUL: "User login successful",
    USER_CREATED_SUCCESSFULLY: "User created successfully",
    USER_UPDATED_SUCCESSFULLY: "User updated successfully",
    REMOVED_SUCCESSFULLY: "The user was successfully deleted",
    FAILED_TO_FETCH: "Failed to fetch user",
    FAILED_TO_FETCH_FOR_UPDATE: "Failed to fetch user for update",
    FAILED_TO_UPDATE: "Failed to update user ",
    NOT_FOUND: "User with this email does not exist",
    NOT_FOUND2: "User not found",
    FAILED_FETCH: "Failed to fetch users",
    FAILED_FETCH_FOR_REMOVAL: "Failed to fetch user for removal",
    FAILED_REMOVE: "Failed to remove user",
    INVALID_CREDENTIALS: "Invalid credentials",
    FAILED_TO_CREATE: "Failed to create user",
    PASSWORD_SET_SUCCESSFULLY: "User password set successfully",
    FAILED_SET_PASSWORD: "Failed to set user password",
  },
  ADMIN: {
    FETCH_ALL: "All admins fetched successfully",
    FETCH_ADMIN_BY_NAME: "Fetch admin by adminName ",
    FETCH_ADMIN_BY_EMAIL: "Fetch admin by email ",
    LOGIN_SUCCESSFUL: "Admin login successful",
    ADMIN_CREATED_SUCCESSFULLY: "Admin created successfully",
    ADMIN_UPDATED_SUCCESSFULLY: "Admin updated successfully",
    REMOVED_SUCCESSFULLY: "The admin was successfully deleted",
    FAILED_TO_FETCH: "Failed to fetch admin",
    FAILED_TO_FETCH_FOR_UPDATE: "Failed to fetch admin for update",
    FAILED_TO_UPDATE: "Failed to update admin ",
    NOT_FOUND: "Admin with this email does not exist",
    NOT_FOUND2: "Admin not found",
    FAILED_FETCH: "Failed to fetch admins",
    FAILED_FETCH_FOR_REMOVAL: "Failed to fetch admin for removal",
    FAILED_REMOVE: "Failed to remove admin",
    INVALID_CREDENTIALS: "Invalid credentials",
    FAILED_TO_CREATE: "Failed to create admin",
    PASSWORD_SET_SUCCESSFULLY: "Admin password set successfully",
    FAILED_SET_PASSWORD: "Failed to set admin password",
  },
  PASSWORD: {
    PASSWORDS_DO_NOT_MATCH: "New password and confirm password do not match.",
    FAILED_TO_HASH_PASSWORD: "Failed to hash password",
    INVALID_PASSWORD: "Invalid password",
    FAILED_TO_UPDATE_PASSWORD: "Failed to update password",
    FAILED_TO_RESET_PASSWORD: "Failed to reset password",
    PASSWORD_UPDATE_SUCCESSFULLY: "password updated successfully",
    PASSWORD_RESET_SUCCESSFULLY: "Password reset successfully.",
    PASSWORD_FIELD_COMPARISON: "password field comparison",
  },
  EMAIL: {
    FAILED_TO_SEND_EMAIL: "Failed to send email",
    EMAIL_SENT_SUCCESSFULLY: "Email sent successfully",
    EMAIL_VERIFICATION_CODE_SENT_SUCCESSFULLY: "Email verification code has been successfully generated and sent.",
    FAILED_TO_UPDATE_EMAIL: "Failed to update email",
    RESET_PASS_EMAIL_SENT: "Password reset email sent successfully! Please use the link within one hour to reset your password.",
  },
  ROLE: {
    FETCH_ALL_ROLES: "All roles fetched successfully",
    FETCH_ROLE_BY_ROLE_NAME: "Fetch role by role name ",
    ROLE_CREATED_SUCCESSFULLY: "Role created successfully",
    ROLE_UPDATED_SUCCESSFULLY: "Role updated successfully",
    ROLE_REMOVED_SUCCESSFULLY: "The role was successfully deleted",
    FAILED_TO_FETCH_ROLE: "Failed to fetch role ",
    FAILED_TO_FETCH_ROLE_FOR_UPDATE: "Failed to fetch role for update",
    FAILED_TO_UPDATE_ROLE: "Failed to update role ",
    NOT_FOUND: "This role does not exist",
    FAILED_FETCH_ROLES: "Failed to fetch roles",
    FAILED_FETCH_ROLE_FOR_REMOVAL: "Failed to fetch role for removal",
    FAILED_REMOVE_ROLE: "Failed to remove role",
    FAILED_TO_CREATE_ROLE: "Failed to create role",
  },
  TOKEN: {
    TOKEN_NOT_FOUND: "Token is not found or invalid",
    TOKEN_GENERATED_SUCCESSFULLY: "Access token generated successfully",
    REF_TOKEN_WILL_EXPIRE: "Refresh token is about to expire",
    REF_TOKEN_HAS_EXPIRED: "Refresh token has expired",
    REF_TOKEN_REVOKED_SUCCESSFULLY:"RefreshToken successfully revoked",
    FAILED_TO_SAVE_REF_TOKEN: "Failed to save refresh token",
    FAILED_TO_GENERATE_REF_TOKEN: "Error generating refresh token",
    FAILED_TO_GENERATE_ACC_TOKEN: "Error generating access token",
    INVALID_OR_EXPIRED_TOKEN:"Invalid or expired token"
  },
  PRODUCTS: {
    // General Product Messages
    PRODUCT_ALREADY_EXISTS: "Product with this name already exists",
    PRODUCT_NOT_FOUND: "Product not found or unavailable",
    PRODUCT_ADDED_SUCCESSFULLY: "Product added successfully",
    PRODUCT_UPDATED_SUCCESSFULLY: "Product updated successfully",
    PRODUCT_DELETED_SUCCESSFULLY: "Product deleted successfully",
    FAILED_TO_ADD_PRODUCT: "Failed to add product",
    FAILED_TO_UPDATE_PRODUCT: "Failed to update product",
    FAILED_TO_DELETE_PRODUCT: "Failed to delete product",
    FAILED_TO_FETCH_FOR_UPDATE: "Failed to fetch product for update",
    FAILED_TO_FETCH_FOR_DELETE: "Failed to fetch product for delete",
    FAILED_TO_FETCH_ALL_PRODUCTS: "Failed to fetch all products",
    FAILED_TO_FETCH_PRODUCT: "Failed to fetch product",

    // Custom Product Messages
    CUSTOM_PRODUCT_NOT_FOUND: "Custom product not found or unavailable",
    CUSTOM_PRODUCT_CREATED_SUCCESSFULLY: "Custom product created successfully",
    CUSTOM_PRODUCT_UPDATED_SUCCESSFULLY: "Custom product updated successfully",
    CUSTOM_PRODUCT_DELETED_SUCCESSFULLY: "Custom product deleted successfully",
    FAILED_TO_CREATE_CUSTOM_PRODUCT: "Failed to create custom product",
    FAILED_TO_UPDATE_CUSTOM_PRODUCT: "Failed to update custom product",
    FAILED_TO_DELETE_CUSTOM_PRODUCT: "Failed to delete custom product",
    FAILED_TO_FETCH_CUSTOM_PRODUCT: "Failed to fetch custom product",
    FAILED_TO_FETCH_CUSTOM_PRODUCTS: "Failed to fetch custom products",

    // User Store Messages
    USER_STORE_NOT_FOUND: "User store not found or unavailable",
    USER_STORE_CREATED_SUCCESSFULLY: "User store created successfully",
    USER_STORE_UPDATED_SUCCESSFULLY: "User store updated successfully",
    USER_STORE_DELETED_SUCCESSFULLY: "User store deleted successfully",
    FAILED_TO_CREATE_USER_STORE: "Failed to create user store",
    FAILED_TO_UPDATE_USER_STORE: "Failed to update user store",
    FAILED_TO_DELETE_USER_STORE: "Failed to delete user store",
    FAILED_TO_FETCH_USER_STORE: "Failed to fetch user store",
    FAILED_TO_FETCH_STORES: "Failed to fetch stores",
    // Validation and Error Messages
    INVALID_PRODUCT_DETAILS: "Invalid product details provided",
    INVALID_STORE_DETAILS: "Invalid store details provided"
  },
  ORDERS: {
    ORDER_NOT_FOUND: "Order not found or unavailable",
    ORDER_PLACED_SUCCESSFULLY: "Order placed successfully",
    ORDER_UPDATED_SUCCESSFULLY: "Order updated successfully",
    ORDER_CANCEL_SUCCESSFULLY: "Order canceled successfully",
    FAILED_TO_PLACE_ORDER: "Failed to place order",
    FAILED_TO_UPDATE_ORDER: "Failed to update order",
    FAILED_TO_FETCH_ORDER: "Failed to fetch order",
    FAILED_TO_FETCH_ALL_ORDERS: "Failed to fetch all orders",
    ORDER_ALREADY_COMPLETED: "Order has already been completed",
    INVALID_ORDER_STATUS: "Invalid order status",
  }



}